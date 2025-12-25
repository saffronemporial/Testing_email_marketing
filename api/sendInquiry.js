// src/api/sendInquiry.js

/**
 * Email Service for Product Inquiries
 * Sends emails using Gmail SMTP via EmailJS
 */

// ==================== CONFIGURATION ====================
// TODO: Replace these with your actual credentials
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_n9a3k6e',  // Get from EmailJS dashboard
  TEMPLATE_ID_ADMIN: 'template_c8ig14r',  // Admin notification template
  TEMPLATE_ID_USER: 'template_c8ig14r',  // User confirmation template
  PUBLIC_KEY: 'AHvm1NQh5ANq_mT4D',  // Your EmailJS public key
};

// Your Gmail credentials (for receiving inquiries)
const ADMIN_EMAIL = 'saffronemporial@gmail.com';  // Replace with your Gmail
const ADMIN_NAME = 'Saffron Emporial';

/**
 * Initialize EmailJS
 * Load EmailJS library dynamically
 */
const loadEmailJS = () => {
  return new Promise((resolve, reject) => {
    if (window.emailjs) {
      resolve(window.emailjs);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.async = true;
    
    script.onload = () => {
      if (window.emailjs) {
        window.emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
        resolve(window.emailjs);
      } else {
        reject(new Error('EmailJS failed to load'));
      }
    };
    
    script.onerror = () => reject(new Error('Failed to load EmailJS script'));
    document.head.appendChild(script);
  });
};

/**
 * Format inquiry data for email
 */
export const formatInquiryData = (formData, product) => {
  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'long',
  });

  const totalPrice = product.base_price * formData.quantity;

  return {
    // User Information
    user_name: formData.name,
    user_email: formData.email,
    user_phone: formData.phone,
    user_company: formData.company || 'Not specified',
    
    // Inquiry Details
    inquiry_message: formData.message,
    quantity: formData.quantity,
    timestamp: timestamp,
    
    // Product Information
    product_name: product.name,
    product_sku: product.sku,
    product_category: product.category,
    product_price: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(product.base_price),
    product_unit: product.unit || 'piece',
    
    // Calculated Values
    total_price: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(totalPrice),
    
    // Additional Product Info
    product_description: product.description || 'No description',
    product_origin: product.origin || 'Not specified',
    product_lead_time: product.lead_time || 'Not specified',
    min_order_qty: product.min_order_quantity || 1,
    
    // Admin Info
    admin_email: ADMIN_EMAIL,
    admin_name: ADMIN_NAME,
  };
};

/**
 * Send inquiry email to admin
 */
const sendAdminNotification = async (emailData) => {
  try {
    const emailjs = await loadEmailJS();
    
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID_ADMIN,
      {
        to_email: ADMIN_EMAIL,
        to_name: ADMIN_NAME,
        from_name: emailData.user_name,
        from_email: emailData.user_email,
        from_phone: emailData.user_phone,
        from_company: emailData.user_company,
        
        product_name: emailData.product_name,
        product_sku: emailData.product_sku,
        product_category: emailData.product_category,
        product_price: emailData.product_price,
        
        quantity: emailData.quantity,
        total_price: emailData.total_price,
        message: emailData.inquiry_message,
        timestamp: emailData.timestamp,
        
        subject: `New Product Inquiry: ${emailData.product_name}`,
      }
    );

    return { success: true, response };
  } catch (error) {
    console.error('Admin notification failed:', error);
    throw error;
  }
};

/**
 * Send confirmation email to user
 */
const sendUserConfirmation = async (emailData) => {
  try {
    const emailjs = await loadEmailJS();
    
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID_USER,
      {
        to_email: emailData.user_email,
        to_name: emailData.user_name,
        
        product_name: emailData.product_name,
        product_sku: emailData.product_sku,
        quantity: emailData.quantity,
        total_price: emailData.total_price,
        
        company_name: ADMIN_NAME,
        company_email: ADMIN_EMAIL,
        
        subject: `Thank You for Your Inquiry - ${emailData.product_name}`,
      }
    );

    return { success: true, response };
  } catch (error) {
    console.error('User confirmation failed:', error);
    throw error;
  }
};

/**
 * Main function to send inquiry
 * Sends both admin notification and user confirmation
 */
export const sendInquiry = async (formData, product) => {
  try {
    // Validate inputs
    if (!formData || !product) {
      throw new Error('Missing required data');
    }

    if (!formData.name || !formData.email || !formData.message) {
      throw new Error('Missing required form fields');
    }

    // Format the data
    const emailData = formatInquiryData(formData, product);

    // Send both emails in parallel
    const [adminResult, userResult] = await Promise.allSettled([
      sendAdminNotification(emailData),
      sendUserConfirmation(emailData),
    ]);

    // Check results
    const adminSuccess = adminResult.status === 'fulfilled';
    const userSuccess = userResult.status === 'fulfilled';

    if (adminSuccess && userSuccess) {
      return {
        success: true,
        message: 'Inquiry sent successfully! Check your email for confirmation.',
        details: {
          adminNotificationSent: true,
          userConfirmationSent: true,
        }
      };
    } else if (adminSuccess) {
      return {
        success: true,
        message: 'Inquiry received! Confirmation email may be delayed.',
        details: {
          adminNotificationSent: true,
          userConfirmationSent: false,
          userError: userResult.reason?.message,
        }
      };
    } else {
      throw new Error('Failed to send inquiry. Please try again.');
    }

  } catch (error) {
    console.error('Send inquiry error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send inquiry. Please try again.',
      error: error,
    };
  }
};

/**
 * Alternative: Direct Gmail SMTP (Backend Required)
 * This is a placeholder - real SMTP requires backend server
 */
export const sendInquiryViaBackend = async (formData, product) => {
  try {
    const emailData = formatInquiryData(formData, product);
    
    const response = await fetch('/api/send-inquiry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error('Failed to send inquiry');
    }

    const result = await response.json();
    return {
      success: true,
      message: 'Inquiry sent successfully!',
      data: result,
    };

  } catch (error) {
    console.error('Backend inquiry error:', error);
    return {
      success: false,
      message: 'Failed to send inquiry. Please try again.',
      error: error,
    };
  }
};

// Export configuration for setup instructions
export const getSetupInstructions = () => {
  return {
    step1: 'Go to https://www.emailjs.com/ and create a free account',
    step2: 'Add Gmail service in EmailJS dashboard',
    step3: 'Create two email templates (admin notification + user confirmation)',
    step4: 'Get your Service ID, Template IDs, and Public Key',
    step5: 'Update EMAILJS_CONFIG in this file with your credentials',
    step6: 'Update ADMIN_EMAIL with your Gmail address',
    
    adminTemplate: {
      name: 'Admin Inquiry Notification',
      variables: [
        'to_email', 'to_name', 'from_name', 'from_email', 'from_phone',
        'from_company', 'product_name', 'product_sku', 'quantity',
        'total_price', 'message', 'timestamp'
      ],
    },
    
    userTemplate: {
      name: 'User Confirmation',
      variables: [
        'to_email', 'to_name', 'product_name', 'product_sku',
        'quantity', 'total_price', 'company_name', 'company_email'
      ],
    },
  };
};