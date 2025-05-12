import api from './api';

// Health check function to verify API is available
export const checkApiHealth = async (endpoint) => {
  try {
    // Tạo một request OPTIONS để kiểm tra endpoint
    const response = await api({
      method: 'OPTIONS',
      url: endpoint,
      timeout: 5000 // 5 giây
    });
    
    return {
      available: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    console.error(`API Health check failed for ${endpoint}:`, error);
    return {
      available: false,
      error: error.message || 'Unknown error',
      status: error.response?.status
    };
  }
};

// =========================
// OpenAI Chat (authenticated)
// =========================
export const initAiChat = async () => {
  try {
    const response = await api.get('/chat/ai/init');
    return response.data;
  } catch (error) {
    console.error('initAiChat error:', error);
    throw error;
  }
};

export const sendAiMessage = async (message, sessionId) => {
  try {
    const response = await api.post('/chat/ai/send', { 
      message, 
      sessionId 
    });
    return response.data;
  } catch (error) {
    console.error('sendAiMessage error:', error);
    throw error;
  }
};

export const getAiChatHistory = async (sessionId) => {
  try {
    const response = await api.get(`/chat/ai/history/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('getAiChatHistory error:', error);
    throw error;
  }
};

export const endAiChat = async (sessionId) => {
  try {
    const response = await api.delete(`/chat/ai/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('endAiChat error:', error);
    throw error;
  }
};

// =========================
// OpenAI Chat (public)
// =========================
export const initPublicAiChat = async () => {
  try {
    const response = await api.get('/public/chat/init');
    return response.data;
  } catch (error) {
    console.error('initPublicAiChat error:', error);
    throw error;
  }
};

export const sendPublicAiMessage = async (message, sessionId) => {
  try {
    const response = await api.post('/public/chat/send', { 
      message, 
      sessionId 
    });
    return response.data;
  } catch (error) {
    console.error('sendPublicAiMessage error:', error);
    throw error;
  }
};

export const getPublicAiChatHistory = async (sessionId) => {
  try {
    const response = await api.get(`/public/chat/history/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('getPublicAiChatHistory error:', error);
    throw error;
  }
};

export const endPublicAiChat = async (sessionId) => {
  try {
    const response = await api.delete(`/public/chat/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('endPublicAiChat error:', error);
    throw error;
  }
};

// =========================
// Free Chat
// =========================
export const initFreeChat = async () => {
  try {
    const response = await api.get('/chat/free/init');
    return response.data;
  } catch (error) {
    console.error('initFreeChat error:', error);
    throw error;
  }
};

export const sendFreeMessage = async (message, sessionId) => {
  try {
    const response = await api.post('/chat/free/send', { 
      message, 
      sessionId 
    });
    return response.data;
  } catch (error) {
    console.error('sendFreeMessage error:', error);
    throw error;
  }
};

export const getFreeChatHistory = async (sessionId) => {
  try {
    const response = await api.get(`/chat/free/history/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('getFreeChatHistory error:', error);
    throw error;
  }
};

export const endFreeChat = async (sessionId) => {
  try {
    const response = await api.delete(`/chat/free/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('endFreeChat error:', error);
    throw error;
  }
};

// =========================
// Gemini Chat
// =========================
export const initGeminiChat = async () => {
  try {
    const response = await api.get('/chat/gemini/init');
    return response.data;
  } catch (error) {
    console.error('initGeminiChat error:', error);
    throw error;
  }
};

export const sendGeminiMessage = async (message, sessionId) => {
  try {
    const response = await api.post('/chat/gemini/send', { 
      message, 
      sessionId 
    });
    return response.data;
  } catch (error) {
    console.error('sendGeminiMessage error:', error);
    throw error;
  }
};

export const getGeminiChatHistory = async (sessionId) => {
  try {
    const response = await api.get(`/chat/gemini/history/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('getGeminiChatHistory error:', error);
    throw error;
  }
};

export const endGeminiChat = async (sessionId) => {
  try {
    const response = await api.delete(`/chat/gemini/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('endGeminiChat error:', error);
    throw error;
  }
};

// Utility function to choose the right endpoints based on authentication status and chat type
export const getChatServices = (chatType, isAuthenticated) => {
  switch (chatType) {
    case 'openai':
      return {
        initChat: isAuthenticated ? initAiChat : initPublicAiChat,
        sendMessage: isAuthenticated ? sendAiMessage : sendPublicAiMessage,
        getChatHistory: isAuthenticated ? getAiChatHistory : getPublicAiChatHistory,
        endChat: isAuthenticated ? endAiChat : endPublicAiChat,
      };
    case 'free':
      return {
        initChat: initFreeChat,
        sendMessage: sendFreeMessage,
        getChatHistory: getFreeChatHistory,
        endChat: endFreeChat,
      };
    case 'gemini':
      return {
        initChat: initGeminiChat,
        sendMessage: sendGeminiMessage,
        getChatHistory: getGeminiChatHistory,
        endChat: endGeminiChat,
      };
    default:
      return {
        initChat: isAuthenticated ? initAiChat : initPublicAiChat,
        sendMessage: isAuthenticated ? sendAiMessage : sendPublicAiMessage,
        getChatHistory: isAuthenticated ? getAiChatHistory : getPublicAiChatHistory,
        endChat: isAuthenticated ? endAiChat : endPublicAiChat,
      };
  }
}; 