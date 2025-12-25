// test ping
await (await fetch(import.meta.env.VITE_TWILIO_PROXY_URL + '/health')).json();

// test EmailJS call (adjust email)
import { sendEmailViaEmailJS } from '/src/services/emailService.js';
await sendEmailViaEmailJS({ to_email: 'you@example.com', to_name: 'You', subject: 'Test', message: 'Hello' });

// test communications (requires proper VITE vars)
import { sendBulkCommunications } from '/src/services/communicationService.js';
await sendBulkCommunications([{ profile_id: null, client_id: null, email: 'you@example.com', phone: '+91xxxxxxxxxx', full_name:'You' }], { subject:'Hi', message:'Test', sendEmail:true, sendWhatsApp:false, sendSms:false, current_profile_id: null });
