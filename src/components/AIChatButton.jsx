import React, { useState, useEffect } from 'react';
import aiIcon from '../assets/ai-assistant.svg';
import './AIChatButton.css';

const AIChatButton = ({ onClick, chatType = 'openai' }) => {
  const [pulseColor, setPulseColor] = useState('ai-chat-button-openai');
  
  useEffect(() => {
    // Set different pulse colors for different chat types
    switch(chatType) {
      case 'free':
        setPulseColor('ai-chat-button-free');
        break;
      case 'huggingface':
        setPulseColor('ai-chat-button-huggingface');
        break;
      case 'openai':
      default:
        setPulseColor('ai-chat-button-openai');
        break;
    }
  }, [chatType]);
  
  const getButtonGradient = () => {
    switch(chatType) {
      case 'free':
        return 'from-green-500 to-emerald-600';
      case 'huggingface':
        return 'from-yellow-500 to-orange-600';
      case 'openai':
      default:
        return 'from-blue-600 to-indigo-600';
    }
  };
  
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-8 left-8 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r ${getButtonGradient()} shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${pulseColor}`}
      aria-label="Open AI Chat"
    >
      <img src={aiIcon} alt="AI Assistant" className="w-8 h-8 text-white" />
      <span className="sr-only">AI Trợ lý</span>
    </button>
  );
};

export default AIChatButton; 