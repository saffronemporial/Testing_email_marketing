// api/email-contact.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, message, company, topic } = req.body || {};

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields (name, email, message).',
      });
    }

    // EmailJS config from environment variables
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY; // often called user ID

    if (!serviceId || !templateId || !publicKey) {
      console.error('EmailJS env not configured');
      return res.status(500).json({
        ok: false,
        error: 'Server email configuration missing. Please contact support.',
      });
    }

    // Template params – must match your EmailJS template variables
    const templateParams = {
      from_name: name,
      from_email: email,
      from_phone: phone || '',
      from_company: company || '',
      inquiry_topic: topic || 'General enquiry',
      message: message,
      submit_time: new Date().toISOString(),
    };

    const emailJsPayload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: templateParams,
    };

    const emailJsResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailJsPayload),
    });

    if (!emailJsResponse.ok) {
      const text = await emailJsResponse.text();
      console.error('EmailJS error:', emailJsResponse.status, text);
      return res.status(502).json({
        ok: false,
        error: 'Failed to send email via EmailJS. Please try again.',
        details: text,
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('email-contact handler error:', err);
    return res.status(500).json({
      ok: false,
      error: 'Unexpected server error while sending message.',
    });
  }
}
