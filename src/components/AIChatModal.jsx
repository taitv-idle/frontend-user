import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import './AIChatButton.css';
import { 
  getChatServices, 
} from '../api/chatService';

const AIChatModal = ({ isOpen, onClose, onChatTypeChange }) => {
  // Core state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatType, setChatType] = useState('openai'); // 'openai', 'free', 'gemini'
  const [currentModel, setCurrentModel] = useState('gemini-assistant'); // Default Gemini model
  const [manualChatChange, setManualChatChange] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('online');
  const [isMaximized, setIsMaximized] = useState(false);

  // Session management
  const [sessionIds, setSessionIds] = useState({
    openai: null,
    free: null,
    gemini: null
  });

  // User refs for more stable tracking
  const messagesEndRef = useRef(null);
  const initializedRef = useRef(false);
  const initializingRef = useRef(false);
  const initAttempts = useRef(0);
  const { userInfo } = useSelector(state => state.auth);

  // Add a new state to track if chat is ready
  const [isChatReady, setIsChatReady] = useState(false);

  // Add new state for session error
  const [sessionError, setSessionError] = useState(null);

  // Define type labels first to avoid usage-before-definition errors
  const getChatTypeLabel = useCallback((type) => {
    switch (type) {
      case 'openai': return 'OpenAI';
      case 'free': return 'Miễn phí';
      case 'gemini': return 'Gemini';
      default: return 'AI';
    }
  }, []);

  // Get appropriate chat services based on type and auth - memoized to prevent recreation
  const chatServices = useCallback(() => {
    return getChatServices(chatType, !!userInfo);
  }, [chatType, userInfo]);

  // Add a helper function to check if we need to force public chat
  const shouldUsePublicChat = useCallback(() => {
    return chatType === 'openai' && !userInfo;
  }, [chatType, userInfo]);

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

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Core functions wrapped in useCallback to prevent recreation on render
  const endChat = useCallback(async () => {
    const currentSessionId = sessionIds[chatType];
    if (!currentSessionId) return Promise.resolve();
    
    const currentServices = chatServices();
    if (!currentServices.endChat) return Promise.resolve();
    
    try {
      console.log(`Ending session for ${chatType}:`, currentSessionId);
      
      // For OpenAI chat, if user is not authenticated, ensure we're using public chat services
      let serviceToUse = currentServices;
      if (chatType === 'openai' && !userInfo) {
        serviceToUse = getChatServices('openai', false);
      }
      
      const response = await serviceToUse.endChat(currentSessionId);
      console.log("End chat response:", response);
      
      // Update sessionId for current chat type
      setSessionIds(prev => ({
        ...prev,
        [chatType]: null
      }));
      setMessages([]);
      return response;
    } catch (error) {
      console.error(`Error ending ${chatType} chat:`, error);
      
      // If session not found, just clear the state
      if (error.error === 'Không tìm thấy phiên chat' || error.response?.status === 404) {
        setSessionIds(prev => ({
          ...prev,
          [chatType]: null
        }));
        setMessages([]);
        return Promise.resolve();
      }
      
      // For other errors, show error message
      setSessionError(`Không thể kết thúc phiên chat. Vui lòng thử lại sau.`);
      return Promise.reject(error);
    }
  }, [sessionIds, chatServices, chatType, userInfo]);

  const initChat = useCallback(async () => {
    // Emergency guard against infinite loops
    if (initAttempts.current > 2) {
      console.error("Too many initialization attempts, aborting to prevent infinite loop");
      return;
    }
    
    // Skip if already initialized or initializing
    if (initializedRef.current || initializingRef.current) {
      console.log("Skipping initialization, already initialized or in progress");
      return;
    }
    
    // Set initializing flag to prevent multiple concurrent initializations
    initializingRef.current = true;
    initAttempts.current += 1;
    
    setLoading(true);
    setError(null);
    setIsChatReady(false);
    
    try {
      const currentServices = chatServices();
      const data = await currentServices.initChat();
      
      console.log(`Init ${chatType} chat response:`, data);
      
      if (data.success && data.chat) {
        // Update sessionId for current chat type
        setSessionIds(prev => ({
          ...prev,
          [chatType]: data.chat.sessionId
        }));
        
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
          
          // Mark as initialized and ready
          initializedRef.current = true;
          setIsChatReady(true);
        } else {
          console.error('Expected messages array but got:', data.chat.messages);
          throw new Error('Invalid messages format');
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error(`Error initializing ${chatType} chat:`, error);
      
      // Check for authentication error
      if (error.error === 'Please Login First' || 
          (error.response?.status === 409 && error.response?.data?.error === 'Please Login First')) {
        // If authentication error and trying to use authenticated chat, switch to public chat
        if (chatType === 'openai' && userInfo === null) {
          console.log('Authentication required, switching to public chat');
          
          // Add a welcome message
          const welcomeMessage = { 
            role: 'assistant', 
            content: `Xin chào! Tôi là trợ lý AI công cộng. Để sử dụng đầy đủ tính năng, vui lòng đăng nhập.` 
          };
          
          setMessages([welcomeMessage]);
          
          // Try to initialize with public services
          try {
            const publicServices = getChatServices('openai', false);
            const publicData = await publicServices.initChat();
            
            if (publicData.success && publicData.chat) {
              setSessionIds(prev => ({
                ...prev,
                openai: publicData.chat.sessionId
              }));
              initializedRef.current = true;
              setIsChatReady(true);
            }
          } catch (publicError) {
            console.error("Error initializing public chat:", publicError);
          }
        }
      }
      
      if (!initializedRef.current) {
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
        
        // Mark as initialized anyway to prevent loops
        initializedRef.current = true;
        setIsChatReady(true);
      }
    } finally {
      setLoading(false);
      initializingRef.current = false;
    }
  }, [chatType, chatServices, getChatTypeLabel, networkStatus, userInfo]);

  // Single clean effect for chat initialization
  useEffect(() => {
    // Only initialize when modal is open and not already initialized
    if (isOpen && !initializedRef.current && !manualChatChange && !initializingRef.current) {
      console.log("Starting chat initialization");
      
      if (shouldUsePublicChat()) {
        console.log('User not authenticated, using public OpenAI chat');
        
        // Set initializing flag
        initializingRef.current = true;
        setLoading(true);
        
        const publicServices = getChatServices('openai', false);
        publicServices.initChat()
          .then(data => {
            if (data.success && data.chat) {
              setSessionIds(prev => ({
                ...prev,
                openai: data.chat.sessionId
              }));
              
              if (Array.isArray(data.chat.messages)) {
                const initialMessages = data.chat.messages.map(msg => ({
                  role: msg.role,
                  content: msg.content,
                  model: msg.model
                }));
                
                setMessages(initialMessages);
              }
              
              initializedRef.current = true;
            }
          })
          .catch(error => {
            console.error('Error initializing public chat:', error);
            setError('Không thể kết nối đến dịch vụ chat công khai.');
            setMessages([{ 
              role: 'assistant', 
              content: 'Xin chào! Tôi là trợ lý AI công cộng. Để sử dụng đầy đủ tính năng, vui lòng đăng nhập.' 
            }]);
            
            // Mark as initialized anyway to prevent loops
            initializedRef.current = true;
          })
          .finally(() => {
            setLoading(false);
            initializingRef.current = false;
          });
      } else {
        // For authenticated users or non-OpenAI chat types
        initChat();
      }
    } else if (!isOpen) {
      // Reset initialization state when modal closes
      initializedRef.current = false;
      initializingRef.current = false;
      initAttempts.current = 0;
    }
  }, [isOpen, shouldUsePublicChat, initChat, manualChatChange, chatType]);
  
  // Reset manual change flag
  useEffect(() => {
    if (manualChatChange) {
      setTimeout(() => {
        setManualChatChange(false);
      }, 100);
    }
  }, [manualChatChange]);
  
  // Cleanup when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (sessionIds[chatType] && !isOpen) {
        endChat();
      }
    };
  }, [isOpen, sessionIds, endChat]);

  // Reset initialization when chat type changes
  useEffect(() => {
    initializedRef.current = false;
    initializingRef.current = false;
    initAttempts.current = 0;
  }, [chatType]);

  const resetChat = useCallback(() => {
    // Clear state
    setMessages([]);
    setSessionIds(prev => ({
      ...prev,
      [chatType]: null
    }));
    // Reset initialization flags
    initializedRef.current = false;
    initializingRef.current = false;
    initAttempts.current = 0;
    
    // End current chat session if exists
    endChat().then(() => {
      // Trigger initialization in the next render cycle
      setTimeout(() => {
        if (shouldUsePublicChat()) {
          // Use public chat for unauthenticated OpenAI
          const publicServices = getChatServices('openai', false);
          initializingRef.current = true;
          setLoading(true);
          
          publicServices.initChat()
            .then(data => {
              if (data.success && data.chat) {
                setSessionIds(prev => ({
                  ...prev,
                  openai: data.chat.sessionId
                }));
                
                if (Array.isArray(data.chat.messages)) {
                  const initialMessages = data.chat.messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                    model: msg.model
                  }));
                  
                  setMessages(initialMessages);
                }
                
                initializedRef.current = true;
              }
            })
            .catch(error => {
              console.error('Error in reset:', error);
              initializedRef.current = true; // Prevent loops
            })
            .finally(() => {
              setLoading(false);
              initializingRef.current = false;
            });
        } else {
          // For other chat types
          initChat();
        }
      }, 100);
    });
  }, [endChat, initChat, shouldUsePublicChat, chatType]);

  const changeChatType = useCallback(async (type) => {
    if (type === chatType) return;
    
    setLoading(true);
    setError(null);
    setSessionError(null);
    setManualChatChange(true);
    setIsChatReady(false);
    
    try {
      // End current chat session if exists
      const currentSessionId = sessionIds[chatType];
      if (currentSessionId) {
        try {
          const currentServices = chatServices();
          await currentServices.endChat(currentSessionId);
        } catch (error) {
          console.log('Error ending previous chat session:', error);
          // Continue with the change even if ending fails
        }
      }
      
      // Change type
      setChatType(type);
      setMessages([]);
      
      // Reset initialization flags
      initializedRef.current = false;
      initializingRef.current = false;
      initAttempts.current = 0;
      
      // Notify parent component
      if (onChatTypeChange) {
        onChatTypeChange(type);
      }
      
      // Initialize new chat session immediately
      const newServices = getChatServices(type, !!userInfo);
      try {
        const data = await newServices.initChat();
        if (data.success && data.chat) {
          // Update sessionId for new chat type
          setSessionIds(prev => ({
            ...prev,
            [type]: data.chat.sessionId
          }));
          
          if (Array.isArray(data.chat.messages)) {
            const initialMessages = data.chat.messages.map(msg => ({
              role: msg.role,
              content: msg.content,
              model: msg.model
            }));
            setMessages(initialMessages);
          }
          initializedRef.current = true;
          setIsChatReady(true);
        }
      } catch (error) {
        console.error('Error initializing new chat session:', error);
        setSessionError('Không thể khởi tạo phiên chat mới. Vui lòng thử lại sau.');
        // Add a default welcome message
        setMessages([{ 
          role: 'assistant', 
          content: `Xin chào! Tôi là trợ lý ${getChatTypeLabel(type)}. Tôi có thể giúp gì cho bạn?` 
        }]);
        initializedRef.current = true;
        setIsChatReady(true);
      }
      
      // Reset the manual change flag after a short delay
      setTimeout(() => {
        setManualChatChange(false);
        setLoading(false);
      }, 100);
    } catch (error) {
      console.error(`Error changing chat type to ${type}:`, error);
      setError(`Không thể chuyển sang chế độ trò chuyện ${getChatTypeLabel(type)}. Vui lòng thử lại sau.`);
      setLoading(false);
      setManualChatChange(false);
      setIsChatReady(true);
    }
  }, [chatType, sessionIds, chatServices, onChatTypeChange, getChatTypeLabel, userInfo]);

  const sendMessage = useCallback(async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isChatReady) return;
    
    const userMessage = { role: 'user', content: newMessage.trim() };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setLoading(true);
    setError(null);
    
    const messageToSend = newMessage.trim();
    console.log(`Sending message to ${chatType}:`, { 
      message: messageToSend, 
      sessionId: sessionIds[chatType]
    });
    
    try {
      // For OpenAI chat, if user is not authenticated, ensure we're using public chat services
      let currentChatServices = getChatServices(chatType, !!userInfo);
      if (chatType === 'openai' && !userInfo) {
        currentChatServices = getChatServices('openai', false);
      }
      
      const data = await currentChatServices.sendMessage(messageToSend, sessionIds[chatType]);
      
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
      
      // Check for session expired error
      if (error.error === 'Không tìm thấy phiên chat hoặc phiên đã hết hạn' ||
          error.response?.status === 404) {
        // Try to reinitialize the chat session
        try {
          console.log('Session expired, attempting to recreate session...');
          
          // Reset initialization flags
          initializedRef.current = false;
          initializingRef.current = false;
          initAttempts.current = 0;
          
          // Initialize new session
          const currentServices = getChatServices(chatType, !!userInfo);
          const initData = await currentServices.initChat();
          
          if (initData.success && initData.chat) {
            // Update sessionId for current chat type
            setSessionIds(prev => ({
              ...prev,
              [chatType]: initData.chat.sessionId
            }));
            
            // Retry sending the message with new session
            const retryData = await currentServices.sendMessage(messageToSend, initData.chat.sessionId);
            
            if (retryData.success && retryData.message) {
              const responseMessage = { 
                role: 'assistant', 
                content: retryData.message 
              };
              
              if (chatType === 'gemini' && retryData.model) {
                responseMessage.model = retryData.model;
                setCurrentModel(retryData.model);
              }
              
              setMessages(prev => [...prev, responseMessage]);
              return;
            }
          }
        } catch (retryError) {
          console.error('Error retrying message send:', retryError);
          setError('Phiên chat đã hết hạn. Vui lòng thử lại sau.');
        }
      }
      
      // Check for authentication error
      if (error.error === 'Please Login First' || 
          (error.response?.status === 409 && error.response?.data?.error === 'Please Login First')) {
        setError(`Vui lòng đăng nhập để sử dụng trợ lý ${getChatTypeLabel(chatType)}.`);
      } else {
        setError(`Không thể gửi tin nhắn đến ${getChatTypeLabel(chatType)}. Vui lòng thử lại sau.`);
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.' 
      }]);
    } finally {
      setLoading(false);
    }
  }, [newMessage, chatType, sessionIds, userInfo, getChatTypeLabel, isChatReady]);

  const fetchChatHistory = useCallback(async () => {
    if (!sessionIds[chatType]) return;
    
    const services = getChatServices(chatType, !!userInfo);
    if (!services.getChatHistory) return;
    
    setLoading(true);
    try {
      // For OpenAI chat, if user is not authenticated, ensure we're using public chat services
      let currentChatServices = services;
      if (chatType === 'openai' && !userInfo) {
        currentChatServices = getChatServices('openai', false);
      }
      
      const data = await currentChatServices.getChatHistory(sessionIds[chatType]);
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
      
      // Check for authentication error
      if (error.error === 'Please Login First' || 
          (error.response?.status === 409 && error.response?.data?.error === 'Please Login First')) {
        setError(`Vui lòng đăng nhập để xem lịch sử trò chuyện ${getChatTypeLabel(chatType)}.`);
      } else {
        setError('Không thể tải lịch sử trò chuyện');
      }
    } finally {
      setLoading(false);
    }
  }, [sessionIds, chatType, userInfo, getChatTypeLabel]);

  // Simplified recoverSession function for recovering from errors
  const recoverSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Reset all state to trigger initialization
      initializedRef.current = false;
      initializingRef.current = false;
      initAttempts.current = 0;
      
      // Clear any previous error
      setError(null);
      
      // Force a new initialization on the next render cycle
      setTimeout(() => {
        if (shouldUsePublicChat()) {
          // Use public chat for unauthenticated OpenAI
          const publicServices = getChatServices('openai', false);
          initializingRef.current = true;
          setLoading(true);
          
          publicServices.initChat()
            .then(data => {
              if (data.success && data.chat) {
                setSessionIds(prev => ({
                  ...prev,
                  openai: data.chat.sessionId
                }));
                
                if (Array.isArray(data.chat.messages)) {
                  const initialMessages = data.chat.messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                    model: msg.model
                  }));
                  
                  setMessages(initialMessages);
                }
                
                initializedRef.current = true;
              }
            })
            .catch(error => {
              console.error('Error in recover:', error);
              initializedRef.current = true; // Prevent loops
              
              // Add a default message
              setMessages([{ 
                role: 'assistant', 
                content: `Xin chào! Tôi là trợ lý AI. Tôi có thể giúp gì cho bạn?` 
              }]);
            })
            .finally(() => {
              setLoading(false);
              initializingRef.current = false;
            });
        } else {
          // For other chat types
          initChat();
        }
      }, 100);
    } catch (error) {
      console.error('Error recovering session:', error);
      setError('Không thể khôi phục phiên chat. Tạo phiên mới.');
      setLoading(false);
    }
  }, [initChat, shouldUsePublicChat]);

  // Add recreateSession function
  const recreateSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSessionError(null);
    setIsChatReady(false);
    
    try {
      // Reset initialization flags
      initializedRef.current = false;
      initializingRef.current = false;
      initAttempts.current = 0;
      
      // Initialize new chat session
      const currentServices = getChatServices(chatType, !!userInfo);
      const data = await currentServices.initChat();
      
      if (data.success && data.chat) {
        // Update sessionId for current chat type
        setSessionIds(prev => ({
          ...prev,
          [chatType]: data.chat.sessionId
        }));
        
        if (Array.isArray(data.chat.messages)) {
          const initialMessages = data.chat.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            model: msg.model
          }));
          setMessages(initialMessages);
        }
        
        initializedRef.current = true;
        setIsChatReady(true);
      }
    } catch (error) {
      console.error('Error recreating session:', error);
      setError('Không thể tạo lại phiên chat. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [chatType, userInfo]);

  const getMessageClass = (message) => {
    // Nếu là tin nhắn từ fallback model
    if (message.isFallback || message.model === 'fallback') {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
    
    return 'bg-white border border-gray-200 shadow-sm';
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
              {(() => {
                const services = getChatServices(chatType, !!userInfo);
                return services.getChatHistory && (
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
                );
              })()}
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
                <div className="flex space-x-2">
                  <button 
                    onClick={recreateSession} 
                    className="mx-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-0.5 rounded"
                    title="Tạo lại phiên chat"
                  >
                    Tạo lại phiên
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
