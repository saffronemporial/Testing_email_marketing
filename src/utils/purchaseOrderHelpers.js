// src/utils/purchaseOrderHelpers.js
import { toNumberSafe } from "./financeCalculations";

/**
 * Pure client-side PO number generator as fallback or preview:
 * Format: PO-YYYYMM-XXXX
 * - latestNumber: existing PO number string from DB (optional)
 * - now: Date instance (optional; default = current date)
 */
export function generateLocalPONumber(latestNumber, now = new Date()) {
  const prefix = now.toISOString().slice(0, 7).replace("-", ""); // YYYYMM
  let nextSequence = 1;

  if (latestNumber && typeof latestNumber === "string") {
    const parts = latestNumber.split("-");
    const seqPart = parts[2] || parts[1] || null;
    if (seqPart) {
      const parsed = parseInt(seqPart, 10);
      if (!Number.isNaN(parsed)) {
        nextSequence = parsed + 1;
      }
    }
  }

  const seq = String(nextSequence).padStart(4, "0");
  return `PO-${prefix}-${seq}`;
}

/**
 * Compute total PO value from items.
 * Each item: { quantity, unit_price }
 */
export function calculatePOTotal(items = []) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, it) => {
    const qty = toNumberSafe(it?.quantity);
    const price = toNumberSafe(it?.unit_price);
    return sum + qty * price;
  }, 0);
}

/**
 * Validates PO header + items.
 * Returns { valid: boolean, errors: { header: string[], items: string[] } }
 */
export function validatePOData(header = {}, items = []) {
  const errors = {
    header: [],
    items: [],
  };

  if (!header.supplier_id) {
    errors.header.push("Supplier is required.");
  }
  if (!header.po_date) {
    errors.header.push("PO date is required.");
  }

  const validItems = items.filter(
    (it) => it && (it.description || it.product_id)
  );
  if (!validItems.length) {
    errors.items.push("At least one item is required.");
  }

  validItems.forEach((it, index) => {
    if (!it.quantity || toNumberSafe(it.quantity) <= 0) {
      errors.items.push(`Item ${index + 1}: quantity must be greater than 0.`);
    }
    if (!it.unit_price || toNumberSafe(it.unit_price) <= 0) {
      errors.items.push(`Item ${index + 1}: unit price must be greater than 0.`);
    }
  });

  const valid = errors.header.length === 0 && errors.items.length === 0;
  return { valid, errors };
}

/**
 * Prepare PO for print/export (PDF, Excel, etc).
 * Returns a normalized structure with computed totals.
 */
export function formatPOForPrint(po, items = [], supplier) {
  const poSafe = po || {};
  const itemsSafe = Array.isArray(items) ? items : [];
  const supplierSafe = supplier || {};

  const total = calculatePOTotal(itemsSafe);

  return {
    header: {
      poNumber: poSafe.po_number,
      poDate: poSafe.po_date,
      currency: poSafe.currency || "INR",
      status: poSafe.status,
      paymentStatus: poSafe.payment_status,
      supplierName:
        supplierSafe.company_name ||
        supplierSafe.name ||
        poSafe.supplier_id,
      paymentTerms: poSafe.payment_terms,
      expectedDeliveryDate: poSafe.expected_delivery_date,
    },
    items: itemsSafe.map((it, index) => {
      const qty = toNumberSafe(it.quantity);
      const price = toNumberSafe(it.unit_price);
      const totalLine = qty * price;
      return {
        index: index + 1,
        description: it.description,
        quantity: qty,
        unit: it.unit,
        unitPrice: price,
        total: totalLine,
      };
    }),
    totals: {
      totalAmount: total,
    },
  };
}

/**
 * Converts raw payment_status fields into user-friendly labels.
 */
export function getPaymentStatusLabel(status) {
  const normalized = (status || "").toLowerCase();
  switch (normalized) {
    case "pending":
      return "Pending";
    case "partial":
      return "Partially Paid";
    case "paid":
      return "Paid";
    case "overdue":
      return "Overdue";
    default:
      return "Unknown";
  }
}

/**
 * Derives payment status based on total amount and total paid (client-side).
 * Server already has fn_update_purchase_payment_status; this is a mirror.
 */
export function derivePaymentStatusFromTotals(totalAmount, totalPaid) {
  const total = toNumberSafe(totalAmount);
  const paid = toNumberSafe(totalPaid);

  if (total <= 0) return "pending";
  if (paid <= 0) return "pending";
  if (paid < total) return "partial";
  if (paid >= total) return "paid";
  return "pending";
}
