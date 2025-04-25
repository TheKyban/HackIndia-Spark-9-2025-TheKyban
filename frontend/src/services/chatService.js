// ChatService.js
// Service to handle chat functionality with the backend API

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ChatService {
  constructor() {
    this.listeners = [];
  }

  // Add a message listener
  addListener(listener) {
    this.listeners.push(listener);
  }

  // Remove a message listener
  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // Send a message to the Gemini AI and get a response
  async sendMessage(message) {
    try {
      // Notify listeners that we're sending a message
      this._notifyListeners({
        type: 'user-message',
        content: message,
        timestamp: new Date().toISOString()
      });

      // Notify listeners that AI is thinking
      this._notifyListeners({
        type: 'ai-thinking',
        timestamp: new Date().toISOString()
      });

      // Send the message to the backend
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }

      // Notify listeners of the AI response
      this._notifyListeners({
        type: 'ai-response',
        content: result.response,
        timestamp: result.timestamp || new Date().toISOString()
      });

      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Notify listeners of the error
      this._notifyListeners({
        type: 'error',
        error: error.message || 'An error occurred',
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }

  // Notify all listeners
  _notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in listener:', error);
      }
    });
  }
}

// Create and export a singleton instance
const chatService = new ChatService();
export default chatService; 