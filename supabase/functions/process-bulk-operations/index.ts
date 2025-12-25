// supabase/functions/process-bulk-operations/index.ts
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

/* Expect SUPABASE_URL and SUPABASE_SERVICE_ROLE to be set as secrets for the function */
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE")!;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE env");
}
const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } });

/* Simple CSV parser */
function parseCsv(text: string) {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter(Boolean);
  if (!lines.length) return [];
  const header = lines[0].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(h => h.replace(/^"|"$/g, '').trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
    const obj: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) obj[header[j]] = cols[j] ?? '';
    rows.push(obj);
  }
  return rows;
}

async function logSystem(level: string, message: string, component = "process-bulk-operations", metadata: any = {}) {
  try {
    await supa.from("system_logs").insert([{ level, message, component, metadata, created_at: new Date().toISOString() }]);
  } catch (err) {
    console.error("system_logs insert failed:", err);
  }
}

async function fetchPendingOperation() {
  const now = new Date().toISOString();
  const { data, error } = await supa
    .from("bulk_operations")
    .select("*")
    .or(`next_run.is.null,next_run.lte.${now}`)
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(1);

  if (error) throw error;
  return (data && data[0]) ?? null;
}

async function updateOp(id: string, obj: Record<string, any>) {
  obj.updated_at = new Date().toISOString();
  const { error } = await supa.from("bulk_operations").update(obj).eq("id", id);
  if (error) throw error;
}

async function insertAudit(operation_id: string, changed_table: string, changed_ids: any[], diffs: any, created_by: string | null = null) {
  try {
    const { error } = await supa.from("operation_audit").insert([{
      operation_id,
      changed_table,
      changed_ids: changed_ids || [],
      diffs: diffs || {},
      created_by,
      created_at: new Date().toISOString()
    }]);
    if (error) console.warn("operation_audit insert error", error);
  } catch (err) {
    console.warn("operation_audit insert exception", err);
  }
}

async function processOperation(op: any) {
  const opId = op.id;
  await updateOp(opId, { status: "running", started_at: new Date().toISOString() });
  await logSystem("info", `Processing operation ${opId}`, "process-bulk-operations", { opId, type: op.operation_type });

  let processed = 0, success = 0, failed = 0;
  const errors: string[] = [], changedIds: string[] = [], diffs: any[] = [];

  try {
    let rows: any[] = [];
    if (op.storage_path) {
      const { data: fileBody, error: downloadErr } = await supa.storage.from("bulk-uploads").download(op.storage_path);
      if (downloadErr) throw downloadErr;
      const text = await fileBody.text();
      rows = parseCsv(text);
    } else if (op.parameters?.preview_rows) {
      rows = op.parameters.preview_rows;
    } else {
      rows = [];
    }
    processed = rows.length;

    for (const row of rows) {
      try {
        // Three supported types demonstrated: inventory_update, price_adjustment, order_status_update
        switch (op.operation_type) {
          case "inventory_update":
            {
              const productId = row.id || row.product_id || null;
              const productName = row.product_name || row.name || null;
              const toUpdate: any = {};
              if (row.current_stock !== undefined && row.current_stock !== "") toUpdate.current_stock = Number(row.current_stock);
              if (row.unit_price !== undefined && row.unit_price !== "") toUpdate.unit_price = Number(row.unit_price);
              if (row.minimum_stock !== undefined && row.minimum_stock !== "") toUpdate.minimum_stock = Number(row.minimum_stock);
              if (row.status !== undefined && row.status !== "") toUpdate.status = row.status;

              if (productId) {
                const { error } = await supa.from("inventory").update({ ...toUpdate, updated_at: new Date().toISOString() }).eq("id", productId);
                if (error) throw error;
                success++; changedIds.push(productId); diffs.push({ id: productId, changes: toUpdate });
              } else if (productName) {
                const { data: found } = await supa.from("inventory").select("id").eq("product_name", productName).limit(1).maybeSingle();
                if (found?.id) {
                  const id = found.id;
                  const { error } = await supa.from("inventory").update({ ...toUpdate, updated_at: new Date().toISOString() }).eq("id", id);
                  if (error) throw error;
                  success++; changedIds.push(id); diffs.push({ id, changes: toUpdate });
                } else {
                  const insertObj: any = {
                    product_name: productName,
                    current_stock: toUpdate.current_stock ?? 0,
                    minimum_stock: toUpdate.minimum_stock ?? 0,
                    unit_price: toUpdate.unit_price ?? 0,
                    status: toUpdate.status ?? "active",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  };
                  const { data: ins, error } = await supa.from("inventory").insert([insertObj]).select().single();
                  if (error) throw error;
                  success++; changedIds.push(ins.id); diffs.push({ id: ins.id, created: insertObj });
                }
              } else {
                throw new Error("inventory_update: missing id or product_name in CSV row");
              }
            }
            break;

          case "price_adjustment":
            {
              const productId = row.id || row.product_id || null;
              const sku = row.sku || null;
              const productName = row.product_name || row.name || null;
              const newPriceRaw = row.new_price || row.unit_price || row.price;
              if (!newPriceRaw) throw new Error("price_adjustment: missing new_price");
              const newPrice = Number(newPriceRaw);

              if (productId) {
                const { error } = await supa.from("inventory").update({ unit_price: newPrice, updated_at: new Date().toISOString() }).eq("id", productId);
                if (error) throw error;
                success++; changedIds.push(productId); diffs.push({ id: productId, unit_price: newPrice });
              } else if (sku) {
                const { data: found } = await supa.from("inventory").select("id").eq("sku", sku).limit(1).maybeSingle();
                if (found?.id) {
                  const id = found.id;
                  const { error } = await supa.from("inventory").update({ unit_price: newPrice, updated_at: new Date().toISOString() }).eq("id", id);
                  if (error) throw error;
                  success++; changedIds.push(id); diffs.push({ id, unit_price: newPrice });
                } else {
                  throw new Error(`price_adjustment: sku ${sku} not found`);
                }
              } else if (productName) {
                const { data: found } = await supa.from("inventory").select("id").eq("product_name", productName).limit(1).maybeSingle();
                if (found?.id) {
                  const id = found.id;
                  const { error } = await supa.from("inventory").update({ unit_price: newPrice, updated_at: new Date().toISOString() }).eq("id", id);
                  if (error) throw error;
                  success++; changedIds.push(id); diffs.push({ id, unit_price: newPrice });
                } else {
                  throw new Error(`price_adjustment: product_name ${productName} not found`);
                }
              } else {
                throw new Error("price_adjustment: missing id, sku, or product_name");
              }
            }
            break;

          case "order_status_update":
            {
              const orderId = row.order_id || row.id || null;
              const invoice = row.invoice_number || null;
              const status = (row.status || row.new_status || "").trim();
              if (!status) throw new Error("order_status_update: missing status");

              if (orderId) {
                const { error } = await supa.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", orderId);
                if (error) throw error;
                success++; changedIds.push(orderId); diffs.push({ id: orderId, status });
              } else if (invoice) {
                const { data: found } = await supa.from("orders").select("id").eq("invoice_number", invoice).limit(1).maybeSingle();
                if (found?.id) {
                  const id = found.id;
                  const { error } = await supa.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
                  if (error) throw error;
                  success++; changedIds.push(id); diffs.push({ id, status });
                } else {
                  throw new Error(`order_status_update: invoice ${invoice} not found`);
                }
              } else {
                throw new Error("order_status_update: missing order_id or invoice_number");
              }
            }
            break;

          default:
            throw new Error(`Unsupported operation_type: ${op.operation_type}`);
        }
      } catch (rowErr) {
        failed++; errors.push(String(rowErr?.message || rowErr));
      }
    } // end rows loop

    if (changedIds.length || diffs.length) await insertAudit(opId, op.target_table, changedIds, { diffs }, op.created_by ?? null);

    const finalStatus = failed === 0 ? "completed" : "completed_with_errors";
    await updateOp(opId, {
      status: finalStatus,
      processed_records: processed,
      successful_records: success,
      failed_records: failed,
      error_log: errors.length > 0 ? errors.join("\n") : null,
      completed_at: new Date().toISOString()
    });

    await logSystem("info", `Operation ${opId} finished: ${finalStatus}`, "process-bulk-operations", { processed, success, failed });
    return { ok: true, processed, success, failed, errors };
  } catch (err) {
    console.error("processOperation error", err);
    const attempts = (op.attempts || 0) + 1;
    const backoffMinutes = Math.min(60 * 24, attempts * attempts);
    const nextRun = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString();
    try {
      await updateOp(opId, { status: "failed", attempts, next_run: nextRun, error_log: String(err?.message || err) });
    } catch (uErr) {
      console.error("updateOp after fail error", uErr);
    }
    await logSystem("error", `Operation ${opId} failed and scheduled for retry`, "process-bulk-operations", { error: String(err?.message || err), nextRun, attempts });
    return { ok: false, error: String(err?.message || err) };
  }
}

serve(async (_req) => {
  try {
    const op = await fetchPendingOperation();
    if (!op) return new Response(JSON.stringify({ message: "no pending operations" }), { status: 200 });

    const result = await processOperation(op);
    return new Response(JSON.stringify({ result }), { status: 200 });
  } catch (err) {
    console.error("Top-level worker error", err);
    await logSystem("error", "Worker top-level error", "process-bulk-operations", { error: String(err?.message || err) });
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500 });
  }
});
