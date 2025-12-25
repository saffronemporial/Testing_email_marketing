// supabase/functions/notifyEmail/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import "https://deno.land/x/dotenv/load.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const COMPANY_NAME = "Saffron Emporial";
const COMPANY_LOGO = "https://nylqihwnftbmkxuysgko.supabase.co/storage/v1/object/public/Saffron_Emporial/Logo.JPG"; // 🔁 replace with your logo image URL

serve(async (req) => {
  try {
    const { shipment_id, status, client_email, invoice_url } = await req.json();

    if (!client_email) {
      return new Response("Missing client email", { status: 400 });
    }

    // build the branded HTML email
    const html = `
      <div style="font-family:Arial,sans-serif; background:#fff8f0; padding:20px; border-radius:12px; border:1px solid #f1c27d; max-width:600px; margin:auto;">
        <div style="text-align:center; margin-bottom:20px;">
          <img src="${COMPANY_LOGO}" alt="${COMPANY_NAME}" style="max-height:80px;"/>
          <h2 style="color:#b8860b; margin-top:10px;">${COMPANY_NAME} Shipment Update</h2>
        </div>
        <p style="font-size:16px; color:#333;">
          Dear Valued Client,
        </p>
        <p style="font-size:16px; color:#333;">
          Your shipment <strong>#${shipment_id}</strong> status has been updated:
        </p>
        <div style="text-align:center; margin:20px 0;">
          <span style="display:inline-block; padding:12px 24px; background:#ffd700; color:#000; font-weight:bold; border-radius:8px;">
            ${status.toUpperCase()}
          </span>
        </div>
        ${
          invoice_url
            ? `<p style="text-align:center; margin-top:20px;">
                <a href="${invoice_url}" 
                   style="padding:12px 24px; background:#b8860b; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold;">
                  📄 Download Invoice
                </a>
               </p>`
            : ""
        }
        <p style="font-size:14px; color:#777; margin-top:30px;">
          Thank you for trusting <strong>${COMPANY_NAME}</strong>.  
          We are committed to delivering excellence in every shipment.
        </p>
      </div>
    `;

    // call Resend API
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Saffron Emporial <no-reply@saffronemporial.com>",
        to: [client_email],
        subject: `Shipment #${shipment_id} - Status: ${status}`,
        html,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Resend error:", errText);
      return new Response(`Error sending email: ${errText}`, { status: 500 });
    }

    return new Response("Email sent successfully", { status: 200 });
  } catch (error) {
    console.error("Function error:", error);
    return new Response("Server error", { status: 500 });
  }
});
