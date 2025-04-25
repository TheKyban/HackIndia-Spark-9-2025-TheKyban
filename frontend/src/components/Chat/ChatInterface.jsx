"use client";

import { useState, useEffect, useRef } from 'react';
import chatService from '@/services/chatService';

// Helper function to format AI response text with proper styling
function formatAIResponse(text) {
  if (!text) return '';
  
  // Handle paragraphs
  let formattedText = text.split('\n\n').map((paragraph, i) => (
    <p key={i} className={i > 0 ? 'mt-3' : ''}>{paragraph}</p>
  ));
  
  // Replace bullet points with properly styled ones
  formattedText = formattedText.map((paragraph, i) => {
    if (typeof paragraph.props.children !== 'string') return paragraph;
    
    // Process paragraphs with bullet points
    if (paragraph.props.children.includes('* ')) {
      const bulletItems = paragraph.props.children.split('* ').filter(Boolean);
      return (
        <div key={i} className={i > 0 ? 'mt-3' : ''}>
          <ul className="list-disc pl-5 space-y-1">
            {bulletItems.map((item, j) => (
              <li key={j}>{formatTextStyling(item)}</li>
            ))}
          </ul>
        </div>
      );
    }
    
    // Process normal paragraphs
    return <p key={i} className={i > 0 ? 'mt-3' : ''}>{formatTextStyling(paragraph.props.children)}</p>;
  });
  
  return <div className="space-y-2">{formattedText}</div>;
}

// Helper to format text styling like bold, italic, etc.
function formatTextStyling(text) {
  if (!text) return '';
  
  // Split the text by bold markers
  const parts = [];
  const segments = text.split(/(\*\*.*?\*\*)/g);
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    
    if (segment.startsWith('**') && segment.endsWith('**')) {
      // Bold text
      const boldText = segment.substring(2, segment.length - 2);
      parts.push(<strong key={i}>{boldText}</strong>);
    } else {
      // Regular text
      parts.push(<span key={i}>{segment}</span>);
    }
  }
  
  return <>{parts}</>;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Set up chat service listeners
  useEffect(() => {
    // Handle messages from the chat service
    const handleChatEvent = (event) => {
      switch (event.type) {
        case 'user-message':
          setMessages(prev => [...prev, {
            id: `user-${Date.now()}`,
            message: event.content,
            sender: 'user',
            timestamp: event.timestamp
          }]);
          break;
          
        case 'ai-thinking':
          setMessages(prev => [...prev, {
            id: `thinking-${Date.now()}`,
            message: 'Thinking...',
            sender: 'ai',
            timestamp: event.timestamp,
            status: 'thinking'
          }]);
          break;
          
        case 'ai-response':
          // Remove thinking message and add the real response
          setMessages(prev => {
            const filtered = prev.filter(msg => msg.status !== 'thinking');
            return [...filtered, {
              id: `ai-${Date.now()}`,
              message: event.content,
              sender: 'ai',
              timestamp: event.timestamp
            }];
          });
          setIsLoading(false);
          break;
          
        case 'error':
          console.error('Chat error:', event.error);
          setMessages(prev => [...prev, {
            id: `error-${Date.now()}`,
            message: 'Sorry, something went wrong. Please try again.',
            sender: 'ai',
            timestamp: event.timestamp,
            status: 'error'
          }]);
          setIsLoading(false);
          break;
      }
    };
    
    // Add listener
    chatService.addListener(handleChatEvent);
    
    // Clean up when component unmounts
    return () => {
      chatService.removeListener(handleChatEvent);
    };
  }, []);
  
  // Handle submitting a new message
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;
    
    // Get the trimmed message and clear the input
    const messageText = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // Send the message to the backend
      await chatService.sendMessage(messageText);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Chat header */}
      <div className="px-4 py-3 bg-primary text-primary-foreground flex items-center justify-between rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <h2 className="font-medium">Medical Assistant</h2>
        </div>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <p>How can I help with your medical concerns today?</p>
            <p className="text-xs mt-2">Your information remains private and secure</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`mb-4 ${msg.sender === 'user' ? 'ml-auto' : 'mr-auto'} max-w-[80%]`}
            >
              <div 
                className={`p-3 rounded-lg ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-br-none' 
                    : 'bg-muted text-foreground rounded-bl-none'
                } ${msg.status === 'thinking' ? 'animate-pulse' : ''}`}
              >
                {msg.sender === 'ai' && !msg.status ? (
                  formatAIResponse(msg.message)
                ) : (
                  msg.message
                )}
              </div>
              <div 
                className={`text-xs mt-1 text-muted-foreground ${
                  msg.sender === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 
              <span className="flex items-center justify-center w-6 h-6">
                <span className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"></span>
              </span>
              : 
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M22 2L11 13"></path>
                <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
              </svg>
            }
          </button>
        </div>
      </form>
    </div>
  );
} 