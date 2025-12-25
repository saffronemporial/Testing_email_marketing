import { supabase } from '../supabaseClient';

// 🔥 FIX: Define callGeminiAPI function
const callGeminiAPI = async (prompt, context = {}) => {
  try {
    const proxyUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'; // Your proxy server

    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        contextData: context
      })
    });

    if (!response.ok) {
      throw new Error(`Proxy error: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle Gemini response format
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else if (data.error) {
      throw new Error(data.error);
    } else {
      return data; // Fallback to raw data
    }
  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw error;
  }
};

export const enhanceMessageWithAI = async (message, context = {}) => {
  const { clientName, clientType, productInfo, tone = 'professional', clientId } = context;

  try {
    const prompt = `Please enhance this business message for our client. 
    
    CLIENT INFORMATION:
    - Name: ${clientName || 'Valued Client'}
    - Type: ${clientType || 'Business Partner'}
    ${productInfo ? `- Product: ${productInfo}` : ''}
    - Desired Tone: ${tone}
    
    ORIGINAL MESSAGE:
    ${message}
    
    Please return ONLY the enhanced message without any additional explanations or notes. Keep it professional and suitable for business communication.`;

    const enhancedMessage = await callGeminiAPI(prompt, context);
    
    // Log successful AI usage
    await logAIUsage({
      client_id: clientId,
      action: 'message_enhancement',
      input_message: message,
      output_message: enhancedMessage,
      tokens_used: 0
    });

    return enhancedMessage;

  } catch (error) {
    console.error('AI enhancement failed:', error);
    
    // Log the error
    await logAIUsage({
      client_id: clientId,
      action: 'message_enhancement_error',
      input_message: message,
      error: error.message
    });

    return message; // Return original as fallback
  }
};

export const generateProductMessage = async (product, client, messageType = 'update') => {
  const clientName = client?.profiles?.full_name || client?.full_name || 'Valued Client';
  const clientType = client?.client_type || 'business partner';

  const prompts = {
    update: `Create a professional product update message for ${clientName} about ${product.name}. 
    Product Details:
    - Current Price: ₹${product.base_price} per ${product.unit}
    - Category: ${product.category}
    - Description: ${product.description || 'High quality export product'}
    
    Focus on value and availability. Keep it concise and professional. Return only the message content.`,
    
    promotion: `Create a promotional message for ${product.name} targeting ${clientName}.
    Product: ${product.name}
    Price: ₹${product.base_price}/${product.unit}
    Key Features: ${product.description || 'Premium quality'}
    
    Make it engaging but professional. Highlight the business opportunity. Return only the message content.`,
    
    followup: `Write a friendly follow-up message to ${clientName} regarding ${product.name}.
    Client is a ${clientType}.
    
    Be polite, professional, and focus on understanding their needs and offering assistance. Return only the message content.`
  };

  try {
    const generatedMessage = await callGeminiAPI(prompts[messageType], {
      product,
      client,
      messageType
    });

    await logAIUsage({
      client_id: client?.id,
      action: `generate_${messageType}_message`,
      product_id: product.id,
      output_message: generatedMessage,
      tokens_used: 0
    });

    return generatedMessage;

  } catch (error) {
    console.error('AI message generation failed:', error);
    return generateFallbackMessage(product, client, messageType);
  }
};

// Fallback message generator when AI is unavailable
const generateFallbackMessage = (product, client, messageType) => {
  const clientName = client?.profiles?.full_name || client?.full_name || 'Valued Client';
  const baseMessage = `Dear ${clientName},\n\n`;
  
  const messages = {
    update: `${baseMessage}We have updates regarding ${product.name}. Current price: ₹${product.base_price} per ${product.unit}. Quality: Export grade. Please contact us for bulk orders.\n\nBest regards,\nSaffron Emporial`,
    
    promotion: `${baseMessage}Special offer on ${product.name}! Premium quality at ₹${product.base_price} per ${product.unit}. Limited stock available for immediate export.\n\nRegards,\nSaffron Emporial`,
    
    followup: `${baseMessage}Following up on your interest in ${product.name}. We have fresh stock available at competitive prices. Would you like current rates and samples?\n\nThank you,\nSaffron Emporial Team`
  };

  return messages[messageType] || messages.followup;
};

// Log AI usage for monitoring
const logAIUsage = async (usageData) => {
  try {
    const { data, error } = await supabase
      .from('ai_insights')
      .insert([{
        insight_type: usageData.action,
        insight_text: usageData.output_message || usageData.error,
        related_entities: {
          client_id: usageData.client_id,
          product_id: usageData.product_id,
          tokens_used: usageData.tokens_used
        },
        relevance_score: usageData.tokens_used ? usageData.tokens_used / 1000 : 0.1
      }]);

    if (error) {
      console.error('Error logging AI usage:', error);
    }
  } catch (error) {
    console.error('Failed to log AI usage:', error);
  }
};