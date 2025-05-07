import React, { useEffect, useRef, useState } from 'react';
import { AiOutlineMessage, AiOutlinePaperClip } from 'react-icons/ai';
import { GrEmoji } from 'react-icons/gr';
import { IoSend } from 'react-icons/io5';
import { FaList, FaSearch } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { add_friend, messageClear, send_message, updateMessage, search_sellers, clearSearchResults } from '../../store/reducers/chatReducer';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import { ClipLoader } from 'react-spinners';
import EmojiPicker from 'emoji-picker-react';
import { useDropzone } from 'react-dropzone';
import { FiPaperclip } from 'react-icons/fi';
import api from '../../api/api';

const socket = io('http://localhost:5000');

const Chat = () => {
    const scrollRef = useRef();
    const dispatch = useDispatch();
    const { sellerId } = useParams();
    const { userInfo } = useSelector(state => state.auth);
    const { 
        fb_messages, 
        currentFd, 
        my_friends, 
        successMessage,
        searchResults,
        isSearching,
        errorMessage 
    } = useSelector(state => state.chat);

    const [text, setText] = useState('');
    const [receverMessage, setReceverMessage] = useState('');
    const [activeSeller, setActiveSeller] = useState([]);
    const [showSidebar, setShowSidebar] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const emojiPickerRef = useRef(null);

    useEffect(() => {
        socket.emit('add_user', userInfo.id, userInfo);
    }, [userInfo]);

    useEffect(() => {
        dispatch(add_friend({
            sellerId: sellerId || "",
            userId: userInfo.id
        }));
    }, [sellerId, userInfo.id, dispatch]);

    useEffect(() => {
        socket.on('seller_message', msg => setReceverMessage(msg));
        socket.on('activeSeller', sellers => setActiveSeller(sellers));
        socket.on('typing', () => setIsTyping(true));
        socket.on('stop_typing', () => setIsTyping(false));
        return () => {
            socket.off('seller_message');
            socket.off('activeSeller');
            socket.off('typing');
            socket.off('stop_typing');
        };
    }, []);

    useEffect(() => {
        if (successMessage) {
            socket.emit('send_customer_message', fb_messages[fb_messages.length - 1]);
            dispatch(messageClear());
        }
    }, [successMessage, fb_messages, dispatch]);

    useEffect(() => {
        if (receverMessage) {
            if (sellerId === receverMessage.senderId && userInfo.id === receverMessage.receverId) {
                dispatch(updateMessage(receverMessage));
            } else {
                toast.success(`${receverMessage.senderName} đã gửi tin nhắn mới`);
                dispatch(messageClear());
            }
        }
    }, [receverMessage, sellerId, userInfo.id, dispatch]);

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [errorMessage, dispatch]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [fb_messages]);

    const onEmojiClick = (emojiObject) => {
        setText(prevText => prevText + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('File không được vượt quá 5MB');
                return;
            }
            setSelectedFile(file);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        multiple: false
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const sendMessage = async () => {
        if (text.trim() || selectedFile) {
            setIsLoading(true);
            try {
                let messageText = text.trim();
                
                // Upload file if exists
                if (selectedFile) {
                    const formData = new FormData();
                    formData.append('file', selectedFile);
                    const { data } = await api.post('/chat/upload', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    if (data.url) {
                        messageText = messageText ? `${messageText}\n[File đính kèm](${data.url})` : `[File đính kèm](${data.url})`;
                    }
                }

                // Send message
                dispatch(send_message({
                    userId: userInfo.id,
                    text: messageText,
                    sellerId,
                    name: userInfo.name
                }));

                setText('');
                setSelectedFile(null);
            } catch (error) {
                toast.error('Lỗi khi gửi tin nhắn');
                console.error('Send message error:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleTyping = () => {
        socket.emit('typing', sellerId);
        const timeout = setTimeout(() => {
            socket.emit('stop_typing', sellerId);
        }, 2000);
        return () => clearTimeout(timeout);
    };

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        if (value.trim()) {
            dispatch(search_sellers(value));
        } else {
            dispatch(clearSearchResults());
        }
    };

    const filteredFriends = my_friends?.filter(friend => {
        if (!friend || !friend.name) return false;
        return friend.name.toLowerCase().includes(searchQuery.toLowerCase());
    }) || [];

    return (
        <div className="flex h-[600px] bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Sidebar */}
            <div className={`w-80 bg-white border-r transition-all duration-300 md-lg:fixed md-lg:top-0 md-lg:h-full md-lg:z-50 ${
                showSidebar ? 'md-lg:left-0' : 'md-lg:-left-80'
            }`}>
                <div className="p-4 border-b bg-gradient-to-r from-red-500 to-red-600 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AiOutlineMessage size={24} />
                            <h2 className="text-lg font-semibold">Tin nhắn</h2>
                        </div>
                        <button
                            onClick={() => setShowSidebar(false)}
                            className="md-lg:block hidden p-2 hover:bg-red-400 rounded-lg transition-colors"
                        >
                            <FaList />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="p-3 border-b">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm người bán..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <ClipLoader size={16} color="#6B7280" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Search Results */}
                {searchQuery && (
                    <div className="border-b">
                        <div className="p-2 text-sm text-gray-500 bg-gray-50">
                            Kết quả tìm kiếm
                        </div>
                        {searchResults.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                Không tìm thấy người bán
                            </div>
                        ) : (
                            searchResults.map((seller) => (
                                <Link
                                    key={seller._id}
                                    to={`/dashboard/chat/${seller._id}`}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                                >
                                    <img
                                        src={seller.image || '/images/default-seller.png'}
                                        alt={seller.shopInfo?.shopName}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 truncate">
                                            {seller.shopInfo?.shopName}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {activeSeller.some(s => s.sellerId === seller._id) ? 'Đang hoạt động' : 'Ngoại tuyến'}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}

                {/* Friends List */}
                <div className="overflow-y-auto h-[calc(100%-120px)]">
                    {filteredFriends.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            {searchQuery ? 'Không tìm thấy người bán' : 'Không có người bán nào'}
                        </div>
                    ) : (
                        filteredFriends.map((friend) => (
                            <Link
                                key={friend.fdId}
                                to={`/dashboard/chat/${friend.fdId}`}
                                className={`flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                                    currentFd?.fdId === friend.fdId ? 'bg-red-50' : ''
                                }`}
                            >
                                <div className="relative">
                                    <img
                                        src={friend.image}
                                        alt={friend.name}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                    {activeSeller.some(s => s.sellerId === friend.fdId) && (
                                        <span className="absolute right-0 bottom-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-800 truncate">{friend.name}</p>
                                    <p className="text-sm text-gray-500 truncate">
                                        {activeSeller.some(s => s.sellerId === friend.fdId) ? 'Đang hoạt động' : 'Ngoại tuyến'}
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {currentFd ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white border-b flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img
                                        src={currentFd.image}
                                        alt={currentFd.name}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                    {activeSeller.some(s => s.sellerId === currentFd.fdId) && (
                                        <span className="absolute right-0 bottom-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">{currentFd.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {activeSeller.some(s => s.sellerId === currentFd.fdId) ? 'Đang hoạt động' : 'Ngoại tuyến'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSidebar(!showSidebar)}
                                className="md-lg:block hidden p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                            >
                                <FaList />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                            {fb_messages.map((msg, i) => (
                                <div
                                    key={i}
                                    ref={scrollRef}
                                    className={`flex ${currentFd.fdId !== msg.receverId ? 'justify-start' : 'justify-end'} mb-4`}
                                >
                                    <div className={`max-w-[70%] ${currentFd.fdId !== msg.receverId ? 'bg-gray-100' : 'bg-red-500 text-white'} rounded-lg p-3`}>
                                        <div className="text-sm font-medium mb-1">{msg.senderName}</div>
                                        <div className="whitespace-pre-wrap break-words">
                                            {msg.message.split('\n').map((line, i) => {
                                                // Check if line contains file attachment
                                                const fileMatch = line.match(/\[File đính kèm\]\((.*?)\)/);
                                                if (fileMatch) {
                                                    const fileUrl = fileMatch[1];
                                                    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileUrl);
                                                    return (
                                                        <div key={i} className="mt-2">
                                                            {isImage ? (
                                                                <div className="relative group">
                                                                    <img 
                                                                        src={fileUrl} 
                                                                        alt="File đính kèm" 
                                                                        className="max-w-[200px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                                        onClick={() => window.open(fileUrl, '_blank')}
                                                                    />
                                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                                                                        <span className="text-white opacity-0 group-hover:opacity-100 text-sm">Click để xem ảnh gốc</span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <a 
                                                                    href={fileUrl} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
                                                                >
                                                                    <FiPaperclip className="text-lg" />
                                                                    <span>Tải xuống file đính kèm</span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                                return <div key={i}>{line}</div>;
                                            })}
                                        </div>
                                        <div className="text-xs mt-1 opacity-70">
                                            {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <span>Đang nhập tin nhắn</span>
                                    <ClipLoader color="#6B7280" size={12} />
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t">
                            {selectedFile && (
                                <div className="mb-2 p-2 bg-gray-50 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AiOutlinePaperClip />
                                        <span className="text-sm truncate">{selectedFile.name}</span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedFile(null)}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <div {...getRootProps()} className="cursor-pointer">
                                    <input {...getInputProps()} />
                                    <button className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                                        <AiOutlinePaperClip size={24} />
                                    </button>
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        value={text}
                                        onChange={(e) => {
                                            setText(e.target.value);
                                            handleTyping();
                                        }}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        type="text"
                                        placeholder="Nhập tin nhắn..."
                                        className="w-full p-3 pr-20 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <button
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className="text-gray-500 hover:text-red-500"
                                        >
                                            <GrEmoji size={20} />
                                        </button>
                                        {showEmojiPicker && (
                                            <div
                                                ref={emojiPickerRef}
                                                className="absolute bottom-10 right-0 z-50"
                                            >
                                                <EmojiPicker
                                                    onEmojiClick={onEmojiClick}
                                                    width={300}
                                                    height={400}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={sendMessage}
                                    disabled={isLoading || (!text.trim() && !selectedFile)}
                                    className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <ClipLoader color="#ffffff" size={20} />
                                    ) : (
                                        <IoSend size={20} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <AiOutlineMessage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-600">Chọn người bán để bắt đầu trò chuyện</h3>
                            <p className="text-gray-500 mt-2">Hoặc tìm kiếm người bán trong danh sách bên trái</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;