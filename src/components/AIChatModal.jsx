import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import './AIChatButton.css';
import { 
  getChatServices, 
  checkApiHealth
} from '../api/chatService';

const AIChatModal = ({ isOpen, onClose, onChatTypeChange }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [chatType, setChatType] = useState('openai'); // 'openai', 'free', 'gemini'
  const [currentModel, setCurrentModel] = useState('gemini-assistant'); // Default Gemini model
  const [manualChatChange, setManualChatChange] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('online');
  const [isMaximized, setIsMaximized] = useState(false); // New state for maximizing chat
  
  const messagesEndRef = useRef(null);
  const initializedRef = useRef(false); // Ref to track initialization
  const { userInfo } = useSelector(state => state.auth);

  // Get appropriate chat services based on type and auth
  const chatServices = getChatServices(chatType, !!userInfo);

  // Add useEffect for auto-dismissing error messages
  useEffect(() => {
    let errorTimeout;
    
    if (error) {
      // Auto-dismiss error after 5 seconds
      errorTimeout = setTimeout(() => {
        setError(null);
      }, 5000);
    }
    
    return () => {
      if (errorTimeout) clearTimeout(errorTimeout);
    };
  }, [error]);

  useEffect(() => {
    // Kiểm tra kết nối mạng ban đầu
    setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    
    // Thêm event listener
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => {
      setNetworkStatus('offline');
      setError('Đã mất kết nối mạng. Vui lòng kiểm tra lại kết nối của bạn.');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Define functions inline without useCallback to avoid dependency issues
  const endChat = async () => {
    if (!sessionId || !chatServices.endChat) {
      return Promise.resolve();
    }
    
    try {
      console.log(`Ending session for ${chatType}:`, sessionId);
      const response = await chatServices.endChat(sessionId);
      console.log("End chat response:", response);
      setSessionId(null);
      setMessages([]);
      return response;
    } catch (error) {
      console.error(`Error ending ${chatType} chat:`, error);
      return Promise.resolve();
    }
  };

  const initChat = async () => {
    // Prevent multiple initializations
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await chatServices.initChat();
      
      console.log(`Init ${chatType} chat response:`, data);
      
      if (data.success && data.chat) {
        setSessionId(data.chat.sessionId);
        
        // Use the initial messages from the backend response
        if (Array.isArray(data.chat.messages)) {
          const initialMessages = data.chat.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            model: msg.model
          }));
              
          setMessages(initialMessages);
          console.log('Session ID set to:', data.chat.sessionId);
          console.log('Initial messages:', initialMessages);
          
          // Update currentModel if present in the first message
          if (chatType === 'gemini' && initialMessages.length > 0 && initialMessages[0].model) {
            setCurrentModel(initialMessages[0].model);
          }
        } else {
          console.error('Expected messages array but got:', data.chat.messages);
          throw new Error('Invalid messages format');
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error(`Error initializing ${chatType} chat:`, error);
      // Don't show the error message immediately - try to make it work offline first
      const offlineWelcomeMessage = { 
        role: 'assistant', 
        content: `Xin chào! Tôi là trợ lý ${getChatTypeLabel(chatType)}. Tôi có thể giúp gì cho bạn?` 
      };
      
      setMessages([offlineWelcomeMessage]);
      
      // Only set error after a delay if we're online (to avoid confusing offline users)
      if (networkStatus === 'online') {
        setTimeout(() => {
          setError(`Không thể kết nối đến dịch vụ chat. Vui lòng thử lại sau.`);
        }, 500);
      }
    } finally {
      setLoading(false);
    }
  };

  // Use separate useEffect hooks to handle different events
  // Effect for handling chat initialization
  useEffect(() => {
    if (isOpen) {
      if (!manualChatChange) {
        // Reset the initialization flag when opening the modal
        initializedRef.current = false;
        initChat();
      }
    } else {
      // Reset initialization when modal closes
      initializedRef.current = false;
    }
  }, [isOpen]);
  
  // Effect to handle chat type changes
  useEffect(() => {
    if (manualChatChange) {
      setManualChatChange(false);
    }
  }, [manualChatChange]);
  
  // Effect to handle cleanup when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (sessionId && !isOpen) {
        endChat();
      }
    };
  }, [isOpen, sessionId]);

  // Reset initialization flag when chat type changes
  useEffect(() => {
    initializedRef.current = false;
  }, [chatType]);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !sessionId) return;
    
    const userMessage = { role: 'user', content: newMessage.trim() };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setLoading(true);
    setError(null);
    
    const messageToSend = newMessage.trim();
    console.log(`Sending message to ${chatType}:`, { 
      message: messageToSend, 
      sessionId
    });
    
    try {
      const data = await chatServices.sendMessage(messageToSend, sessionId);
      
      console.log(`${chatType} response:`, data);
      
      if (data.success && data.message) {
        const responseMessage = { 
          role: 'assistant', 
          content: data.message 
        };
        
        // Add model information for Gemini responses
        if (chatType === 'gemini' && data.model) {
          responseMessage.model = data.model;
          setCurrentModel(data.model);
        }
        
        // Add fallback information
        if (data.isFallback) {
          responseMessage.isFallback = true;
        }
        
        setMessages(prev => [...prev, responseMessage]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error(`Error sending message to ${chatType}:`, error);
      setError(`Không thể gửi tin nhắn đến ${getChatTypeLabel(chatType)}. Vui lòng thử lại sau.`);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    if (!sessionId || !chatServices.getChatHistory) return;
    
    setLoading(true);
    try {
      const data = await chatServices.getChatHistory(sessionId);
      if (data.success && data.chat && Array.isArray(data.chat.messages)) {
        setMessages(data.chat.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          model: msg.model,
          isFallback: msg.model === 'fallback'
        })));
        
        // Nếu đang sử dụng HuggingFace, cập nhật model hiện tại
        if (chatType === 'gemini') {
          const lastAssistantMessage = [...data.chat.messages].reverse()
            .find(m => m.role === 'assistant' && m.model);
          
          if (lastAssistantMessage && lastAssistantMessage.model) {
            setCurrentModel(lastAssistantMessage.model);
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching ${chatType} chat history:`, error);
      setError('Không thể tải lịch sử trò chuyện');
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setSessionId(null);
    initializedRef.current = false; // Reset the initialization flag
    endChat().then(() => {
      initChat();
    });
  };

  const changeChatType = async (type) => {
    if (type === chatType) return;
    
    setLoading(true);
    setError(null);
    setManualChatChange(true); // Đánh dấu rằng đang thay đổi thủ công
    
    try {
      // Endpoint paths for different chat types
      let endpoint;
      switch (type) {
        case 'gemini':
          endpoint = '/chat/gemini/init';
          break;
        case 'free':
          endpoint = '/chat/free/init';
          break;
        default:
          endpoint = userInfo ? '/chat/ai/init' : '/public/chat/init';
      }
      
      // Only perform health check in development environment or if explicitly enabled
      // Skip health check in production to avoid unnecessary warnings
      if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_ENABLE_HEALTH_CHECK === 'true') {
        try {
          const healthResult = await checkApiHealth(endpoint);
          if (!healthResult.available) {
            console.warn(`API endpoint ${endpoint} is not available:`, healthResult);
            // For development debugging only
            console.log(`Health check failed for ${endpoint}. This warning is only shown in development mode.`);
          }
        } catch (healthError) {
          // Just log the error, don't show to user
          console.warn('Health check error:', healthError);
        }
      }
      
      // End current chat session if exists
      if (sessionId) {
        await endChat();
      }
      
      // Change type
      setChatType(type);
      setMessages([]);
      setSessionId(null);
      
      // Reset initialization flag
      initializedRef.current = false;
      
      // Notify parent component
      if (onChatTypeChange) {
        onChatTypeChange(type);
      }
      
      // Delay initialization to make sure the previous session is properly ended
      setTimeout(async () => {
        try {
          // Get the new chat service
          const newChatServices = getChatServices(type, !!userInfo);
          
          // Initialize new chat session
          console.log(`Initializing ${type} chat...`);
          
          // Make sure initialization flag is reset
          initializedRef.current = false;
          
          setLoading(true);
          setError(null);
          
          const data = await newChatServices.initChat();
          
          console.log(`Init ${type} chat response:`, data);
          
          if (data.success && data.chat) {
            setSessionId(data.chat.sessionId);
            
            // Use the initial messages from the backend response
            if (Array.isArray(data.chat.messages)) {
              const initialMessages = data.chat.messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                model: msg.model
              }));
                  
              setMessages(initialMessages);
              console.log('Session ID set to:', data.chat.sessionId);
              console.log('Initial messages:', initialMessages);
              
              // Update currentModel if present in the first message
              if (type === 'gemini' && initialMessages.length > 0 && initialMessages[0].model) {
                setCurrentModel(initialMessages[0].model);
              }
            } else {
              console.error('Expected messages array but got:', data.chat.messages);
              throw new Error('Invalid messages format');
            }
          } else {
            throw new Error('Invalid response format');
          }
        } catch (err) {
          console.error(`Error initializing ${type} chat during type change:`, err);
          setError(`Không thể khởi tạo cuộc trò chuyện ${getChatTypeLabel(type)}. Vui lòng thử lại sau.`);
          setMessages([{ 
            role: 'assistant', 
            content: `Xin chào! Tôi là trợ lý ${getChatTypeLabel(type)}. Tôi có thể giúp gì cho bạn?` 
          }]);
        } finally {
          setLoading(false);
          setManualChatChange(false); // Đã hoàn tất thay đổi thủ công
          // Mark initialization as complete
          initializedRef.current = true;
        }
      }, 500);
    } catch (error) {
      console.error(`Error changing chat type to ${type}:`, error);
      setError(`Không thể chuyển sang chế độ trò chuyện ${getChatTypeLabel(type)}. Vui lòng thử lại sau.`);
      setLoading(false);
      setManualChatChange(false); // Đã hoàn tất thay đổi thủ công
    }
  };

  const getChatTypeLabel = (type) => {
    switch (type) {
      case 'openai': return 'OpenAI';
      case 'free': return 'Miễn phí';
      case 'gemini': return 'Gemini';
      default: return 'AI';
    }
  };

  const getMessageClass = (message) => {
    // Nếu là tin nhắn từ fallback model
    if (message.isFallback || message.model === 'fallback') {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
    
    return 'bg-white border border-gray-200 shadow-sm';
  };

  // Thêm hàm để khôi phục phiên chat khi có lỗi
  const recoverSession = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Reset initialization flag to allow reinitialization
      initializedRef.current = false;
      
      // Reset message state but keep the session
      const oldSessionId = sessionId;
      
      // Attempt to get chat history if available
      if (oldSessionId && chatServices.getChatHistory) {
        try {
          const data = await chatServices.getChatHistory(oldSessionId);
          if (data.success && data.chat && Array.isArray(data.chat.messages)) {
            setMessages(data.chat.messages.map(msg => ({
              role: msg.role,
              content: msg.content,
              model: msg.model,
              isFallback: msg.model === 'fallback'
            })));
            
            // If using Gemini, update current model
            if (chatType === 'gemini') {
              const lastAssistantMessage = [...data.chat.messages].reverse()
                .find(m => m.role === 'assistant' && m.model);
              
              if (lastAssistantMessage && lastAssistantMessage.model) {
                setCurrentModel(lastAssistantMessage.model);
              }
            }
            
            setError(null);
            setLoading(false);
            initializedRef.current = true; // Mark as initialized after recovery
            return; // Success - history retrieved
          }
        } catch (historyError) {
          console.error('Error retrieving chat history:', historyError);
          // Continue to fallback - start a new session
        }
      }
      
      // If history retrieval fails or not available, start a new session
      await initChat();
    } catch (error) {
      console.error('Error recovering session:', error);
      // Don't show error if we're offline
      if (networkStatus === 'online') {
        setError('Không thể khôi phục phiên chat. Tạo phiên mới.');
        
        // Add a welcome message so the chat isn't empty
        setMessages([{ 
          role: 'assistant', 
          content: `Xin chào! Tôi là trợ lý ${getChatTypeLabel(chatType)}. Tôi có thể giúp gì cho bạn?` 
        }]);
      }
    } finally {
      setLoading(false);
      initializedRef.current = true; // Mark as initialized regardless of outcome
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-start justify-start min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        {/* Chat Modal - positioned on the left */}
        <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all duration-300 ease-in-out sm:my-8 sm:align-middle ${isMaximized ? 'sm:max-w-4xl w-full h-[90vh]' : 'sm:max-w-lg sm:w-full'} ai-chat-modal ml-8`}>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="text-white font-medium">Trợ lý {getChatTypeLabel(chatType)}</h3>
              </div>
              {chatType === 'gemini' && currentModel && (
                <span className="text-xs text-blue-100 bg-blue-800 px-2 py-0.5 rounded">
                  {currentModel}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex bg-blue-700 rounded-lg">
                <button 
                  onClick={() => changeChatType('openai')}
                  className={`px-2 py-1 text-xs rounded-l-lg ${chatType === 'openai' 
                    ? 'bg-indigo-800 text-white' 
                    : 'text-white hover:bg-blue-800'}`}
                >
                  OpenAI
                </button>
                <button 
                  onClick={() => changeChatType('free')}
                  className={`px-2 py-1 text-xs ${chatType === 'free' 
                    ? 'bg-indigo-800 text-white' 
                    : 'text-white hover:bg-blue-800'}`}
                >
                  Miễn phí
                </button>
                <button 
                  onClick={() => changeChatType('gemini')}
                  className={`px-2 py-1 text-xs rounded-r-lg ${chatType === 'gemini' 
                    ? 'bg-indigo-800 text-white' 
                    : 'text-white hover:bg-blue-800'}`}
                >
                  Gemini
                </button>
              </div>
              {chatServices.getChatHistory && (
                <button 
                  onClick={fetchChatHistory} 
                  className="text-white hover:text-gray-200"
                  title="Tải lịch sử chat"
                  disabled={loading}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
              <button 
                onClick={resetChat} 
                className="text-white hover:text-gray-200"
                title="Làm mới cuộc trò chuyện"
                disabled={loading}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button 
                onClick={() => setIsMaximized(!isMaximized)} 
                className="text-white hover:text-gray-200"
                title={isMaximized ? "Thu nhỏ" : "Phóng to"}
              >
                {isMaximized ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                  </svg>
                )}
              </button>
              <button 
                onClick={onClose} 
                className="text-white hover:text-gray-200"
                title="Đóng"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Error notification */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-2">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-2 flex-grow">
                  <p className="text-xs text-red-700">{error}</p>
                </div>
                <button 
                  onClick={recoverSession} 
                  className="mx-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-0.5 rounded"
                  title="Thử kết nối lại"
                >
                  Thử lại
                </button>
                <button 
                  onClick={() => setError(null)} 
                  className="text-xs text-red-500 hover:text-red-700"
                  title="Đóng thông báo"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {networkStatus === 'offline' && !error && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">Bạn đang ở chế độ ngoại tuyến. Một số tính năng có thể không hoạt động.</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Chat Messages */}
          <div className={`bg-gray-50 overflow-y-auto p-4 transition-all duration-300 ease-in-out ${isMaximized ? 'h-[calc(90vh-140px)]' : 'h-96'}`}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div 
                  className={`inline-block p-3 rounded-lg max-w-xs md:max-w-md ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : `${getMessageClass(msg)} rounded-bl-none`
                  }`}
                >
                  {msg.content}
                  
                  {msg.role === 'assistant' && msg.model && chatType === 'gemini' && (
                    <div className="mt-1 text-xs text-gray-500">
                      {msg.isFallback ? 'Phản hồi dự phòng' : `Model: ${msg.model}`}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-left mb-4">
                <div className="inline-block p-3 rounded-lg max-w-xs md:max-w-md bg-white border border-gray-200 shadow-sm rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat Input */}
          <form onSubmit={sendMessage} className="bg-white p-4 border-t">
            <div className="flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border border-gray-300 px-3 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tin nhắn..."
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !newMessage.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg disabled:bg-blue-400 flex items-center justify-center"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIChatModal; 