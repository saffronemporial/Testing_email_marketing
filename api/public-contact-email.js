// api/public-contact-email.js
// Serverless function that sends contact form submissions via Gmail SMTP

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['POST']
    });
  }

  try {
    // Get environment variables for Gmail SMTP
    const {
      GMAIL_USER,
      GMAIL_PASS,
      COMPANY_EMAIL,
      NODE_ENV = 'development'
    } = process.env;

    // Validate required environment variables
    if (!GMAIL_USER || !GMAIL_PASS) {
      console.error('SMTP configuration missing:', {
        hasUser: !!GMAIL_USER,
        hasPass: !!GMAIL_PASS
      });
      
      return res.status(500).json({ 
        error: 'Email service not configured',
        message: 'Please configure Gmail SMTP credentials'
      });
    }

    // Extract form data
    const { 
      name, 
      email, 
      message, 
      company = '', 
      source = 'Landing Page',
      phone = '',
      subject = 'New Contact Form Submission'
    } = req.body || {};

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'email', 'message'],
        received: { name, email, message }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email address',
        message: 'Please provide a valid email address'
      });
    }

    // Create Nodemailer transporter for Gmail
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for 587
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false // For development, set to true in production
      }
    });

    // Verify transporter connection
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('SMTP connection failed:', verifyError);
      return res.status(500).json({ 
        error: 'SMTP connection failed',
        message: 'Unable to connect to email server. Please check credentials.'
      });
    }

    // Determine recipient email
    const recipientEmail = COMPANY_EMAIL || GMAIL_USER;
    
    // Email content for company (admin)
    const adminMailOptions = {
      from: `"Saffron Emporial Contact Form" <${GMAIL_USER}>`,
      to: recipientEmail,
      replyTo: email,
      subject: `📧 New Contact: ${subject} - ${name}`,
      text: `
NEW CONTACT FORM SUBMISSION
────────────────────────────
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Company: ${company || 'Not provided'}
Source: ${source}
────────────────────────────
Message:
${message}
────────────────────────────
Timestamp: ${new Date().toISOString()}
IP Address: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #DAA520, #FFD700); color: #000; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; }
    .field { margin-bottom: 15px; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #FFD700; }
    .field-label { font-weight: bold; color: #DAA520; margin-bottom: 5px; display: block; }
    .message-box { background: white; padding: 20px; border-radius: 5px; border: 1px solid #eee; margin-top: 20px; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #FFD700; font-size: 12px; color: #666; text-align: center; }
    .gold-text { color: #DAA520; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">⚜️ New Contact Form Submission</h1>
      <p style="margin: 10px 0 0 0; font-weight: 500;">Saffron Emporial - Export Excellence</p>
    </div>
    
    <div class="content">
      <h2 style="color: #DAA520; margin-top: 0;">Contact Details</h2>
      
      <div class="field">
        <span class="field-label">👤 Name:</span>
        <span>${name}</span>
      </div>
      
      <div class="field">
        <span class="field-label">📧 Email:</span>
        <span><a href="mailto:${email}" style="color: #0066cc;">${email}</a></span>
      </div>
      
      <div class="field">
        <span class="field-label">📞 Phone:</span>
        <span>${phone || 'Not provided'}</span>
      </div>
      
      <div class="field">
        <span class="field-label">🏢 Company:</span>
        <span>${company || 'Not provided'}</span>
      </div>
      
      <div class="field">
        <span class="field-label">🌐 Source:</span>
        <span class="gold-text">${source}</span>
      </div>
      
      <div class="message-box">
        <span class="field-label">💬 Message:</span>
        <p style="white-space: pre-wrap; margin-top: 10px; padding: 10px; background: #f8f8f8; border-radius: 5px;">${message}</p>
      </div>
      
      <div style="margin-top: 30px; background: #f0f0f0; padding: 15px; border-radius: 5px; font-size: 12px;">
        <div style="margin-bottom: 5px;">
          <span style="font-weight: bold;">📅 Submitted:</span> ${new Date().toLocaleString()}
        </div>
        <div>
          <span style="font-weight: bold;">🖥️ IP Address:</span> ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}
        </div>
      </div>
      
      <div class="footer">
        <p style="margin: 0;">
          This email was sent from the Saffron Emporial contact form.<br>
          You can reply directly to ${name} at <a href="mailto:${email}">${email}</a>
        </p>
        <p style="margin: 10px 0 0 0; color: #999;">
          © ${new Date().getFullYear()} Saffron Emporial. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
      `
    };

    // Optional: Send confirmation email to user
    const userMailOptions = {
      from: `"Saffron Emporial" <${GMAIL_USER}>`,
      to: email,
      subject: 'Thank you for contacting Saffron Emporial',
      text: `
Dear ${name},

Thank you for reaching out to Saffron Emporial - The Golden Standard of Natural Goodness.

We have received your message and our export specialists will review your inquiry shortly. 
We typically respond within 24-48 hours during business days.

Here's a summary of your submission:
────────────────────────────
Name: ${name}
Email: ${email}
Company: ${company || 'Not provided'}
Message: ${message.substring(0, 200)}${message.length > 200 ? '...' : ''}
────────────────────────────

If you have any urgent requirements, please feel free to call us at +91-7977133023.

Best regards,
The Saffron Emporial Team
Export Excellence Since 2010
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #DAA520, #FFD700); color: #000; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .gold { color: #DAA520; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">⚜️ Saffron Emporial</h1>
      <p style="margin: 5px 0 0 0;">The Golden Standard of Natural Goodness</p>
    </div>
    
    <div class="content">
      <h2 style="color: #DAA520;">Thank You for Contacting Us</h2>
      
      <p>Dear <span class="gold">${name}</span>,</p>
      
      <p>Thank you for reaching out to <strong>Saffron Emporial</strong>. We have successfully received your inquiry and our export specialists will review it shortly.</p>
      
      <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #FFD700;">
        <h3 style="margin-top: 0; color: #DAA520;">📋 Your Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company || 'Not provided'}</p>
        <p><strong>Message:</strong> ${message.substring(0, 150)}${message.length > 150 ? '...' : ''}</p>
      </div>
      
      <p><strong>📅 What happens next?</strong><br>
      • Our team will review your inquiry within 24-48 hours<br>
      • We'll contact you via email or phone for further discussion<br>
      • You'll receive a detailed proposal based on your requirements</p>
      
      <p>For urgent matters, please contact us directly at <strong>+91-7977133023</strong>.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #FFD700; text-align: center;">
        <p style="margin: 0;">
          <strong>Saffron Emporial</strong><br>
          Export Excellence Since 2010<br>
          <small>Natural Products | Premium Quality | Global Exports</small>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
      `
    };

    // Send both emails
    console.log('Attempting to send emails...');
    
    // Send to company
    const adminInfo = await transporter.sendMail(adminMailOptions);
    console.log('Admin email sent:', adminInfo.messageId);
    
    // Send confirmation to user
    let userInfo = null;
    try {
      userInfo = await transporter.sendMail(userMailOptions);
      console.log('User confirmation email sent:', userInfo.messageId);
    } catch (userEmailError) {
      console.warn('Failed to send user confirmation email:', userEmailError.message);
      // Don't fail the whole request if user email fails
    }

    // Log success (without sensitive data)
    console.log('Email submission processed:', {
      name,
      email: email.substring(0, 3) + '...@...',
      company: company ? 'Provided' : 'Not provided',
      source,
      messageLength: message.length,
      timestamp: new Date().toISOString()
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        name,
        email,
        company,
        submittedAt: new Date().toISOString(),
        emailIds: {
          admin: adminInfo.messageId,
          user: userInfo?.messageId || 'not_sent'
        }
      }
    });

  } catch (error) {
    console.error('Email sending error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // More specific error messages
    let errorMessage = 'Failed to send email';
    let statusCode = 500;

    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check Gmail credentials.';
      statusCode = 401;
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Could not connect to email server. Please check SMTP settings.';
      statusCode = 503;
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Email server connection timeout. Please try again.';
      statusCode = 504;
    }

    return res.status(statusCode).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: error.code
    });
  }
}