const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// Check if API key is configured
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
  console.error('ERROR: GEMINI_API_KEY environment variable is not set or is using the default placeholder');
  console.error('Please set your Gemini API key in the .env file');
  console.error('You can get your API key from https://aistudio.google.com/app/apikey');
  process.exit(1);
}

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure the model
const geminiConfig = {
  model: 'gemini-1.5-pro',
  temperature: 0.7,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 1000,
};

// Create a system prompt with medical context
const medicalSystemPrompt = `
You are a helpful AI medical assistant integrated into a healthcare platform. 
Your role is to provide informative responses to health-related questions, 
but always clarify that you are not a replacement for professional medical advice.
When asked about symptoms, provide general information and always recommend consulting with a healthcare provider.
Focus on being helpful, accurate, and promoting responsible healthcare decisions.
`;

// Helper function to create a new chat session
const createChatSession = async () => {
  try {
    const model = genAI.getGenerativeModel({ model: geminiConfig.model });
    
    // Start the chat with the medical system prompt
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'Please act as a medical assistant as we discuss health topics' }],
        },
        {
          role: 'model',
          parts: [{ text: "I'll act as a medical assistant to provide general health information, but remember I'm not a substitute for professional medical advice. How can I help you today?" }],
        },
      ],
      generationConfig: {
        temperature: geminiConfig.temperature,
        topP: geminiConfig.topP,
        topK: geminiConfig.topK,
        maxOutputTokens: geminiConfig.maxOutputTokens,
      },
    });
    
    return chat;
  } catch (error) {
    console.error('Error creating Gemini chat session:', error);
    throw new Error('Failed to initialize AI chat session');
  }
};

// Function to generate a response to a user message
const generateResponse = async (message) => {
  try {
    const chat = await createChatSession();
    const result = await chat.sendMessage(message);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    return 'I apologize, but I encountered an issue processing your request. Please try again later.';
  }
};

module.exports = {
  generateResponse,
  createChatSession,
}; 