const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const router = express.Router();

// Load environment variables
dotenv.config();

// Check if API key is configured
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === 'your_gemini_api_key_here') {
  console.error('ERROR: GEMINI_API_KEY environment variable is not set or is using the default placeholder');
  console.error('Please set your Gemini API key in the .env file');
}

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(apiKey);

// Configure the model
const modelConfig = {
  temperature: 0.7,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 1000,
};

/**
 * POST /api/chat
 * 
 * Receives a message from the patient and returns a response from the Gemini AI.
 */
router.post('/', async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ 
      success: false, 
      error: 'Message is required' 
    });
  }
  
  try {
    console.log('Processing message with Gemini AI:', message);
    
    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: modelConfig 
    });
    
    // Create medical context prompt
    const contextPrompt = `
      You are a helpful medical assistant chatbot. Please respond to the following query
      from a patient. Keep your response medically accurate, but easy to understand.
      Remember you are not a doctor and cannot diagnose conditions, but you can provide
      general health information.
      
      Patient's query: ${message}
    `;
    
    // Generate content
    const result = await model.generateContent(contextPrompt);
    const response = await result.response.text();
    
    // Return the response to the client
    res.status(200).json({
      success: true,
      response: response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating AI response:', error);
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate AI response' 
    });
  }
});

module.exports = router; 