import React, { useEffect, useRef, useState } from 'react';
import { AiOutlineMessage, AiOutlinePlus } from 'react-icons/ai';
import { GrEmoji } from 'react-icons/gr';
import { IoSend } from 'react-icons/io5';
import { FaList } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { add_friend, messageClear, send_message, updateMessage } from '../../store/reducers/chatReducer';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const Chat = () => {
    const scrollRef = useRef();
    const dispatch = useDispatch();
    const { sellerId } = useParams();
    const { userInfo } = useSelector(state => state.auth);
    const { fb_messages, currentFd, my_friends, successMessage } = useSelector(state => state.chat);

    const [text, setText] = useState('');
    const [receverMessage, setReceverMessage] = useState('');
    const [activeSeller, setActiveSeller] = useState([]);
    const [showSidebar, setShowSidebar] = useState(false);

    useEffect(() => {
        socket.emit('add_user', userInfo.id, userInfo);
    }, [userInfo.id]);

    useEffect(() => {
        dispatch(add_friend({
            sellerId: sellerId || "",
            userId: userInfo.id
        }));
    }, [sellerId, userInfo.id, dispatch]);

    useEffect(() => {
        socket.on('seller_message', msg => setReceverMessage(msg));
        socket.on('activeSeller', sellers => setActiveSeller(sellers));
        return () => {
            socket.off('seller_message');
            socket.off('activeSeller');
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
                toast.success(`${receverMessage.senderName} sent a message`);
                dispatch(messageClear());
            }
        }
    }, [receverMessage, sellerId, userInfo.id, dispatch]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [fb_messages]);

    const sendMessage = () => {
        if (text.trim()) {
            dispatch(send_message({
                userId: userInfo.id,
                text: text.trim(),
                sellerId,
                name: userInfo.name
            }));
            setText('');
        }
    };

    return (
        <div className="flex h-[500px] bg-gray-100 rounded-xl shadow-lg overflow-hidden">
            {/* Sidebar */}
            <div className={`w-72 bg-white border-r transition-all duration-300 md-lg:fixed md-lg:top-0 md-lg:h-full md-lg:z-50 ${showSidebar ? 'md-lg:left-0' : 'md-lg:-left-72'}`}>
                <div className="p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <div className="flex items-center gap-2">
                        <AiOutlineMessage size={24} />
                        <h2 className="text-lg font-semibold">Messages</h2>
                    </div>
                </div>
                <div className="overflow-y-auto h-[calc(100%-60px)] p-2">
                    {my_friends.map((friend) => (
                        <Link
                            key={friend.fdId}
                            to={`/dashboard/chat/${friend.fdId}`}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                            <div className="relative">
                                <img src={friend.image} alt={friend.name} className="w-10 h-10 rounded-full object-cover" />
                                {activeSeller.some(s => s.sellerId === friend.fdId) && (
                                    <span className="absolute right-0 bottom-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                                )}
                            </div>
                            <span className="text-gray-700 font-medium">{friend.name}</span>
                        </Link>
                    ))}
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
                                    <img src={currentFd.image} alt={currentFd.name} className="w-10 h-10 rounded-full object-cover" />
                                    {activeSeller.some(s => s.sellerId === currentFd.fdId) && (
                                        <span className="absolute right-0 bottom-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                                    )}
                                </div>
                                <span className="text-gray-800 font-semibold">{currentFd.name}</span>
                            </div>
                            <button
                                onClick={() => setShowSidebar(!showSidebar)}
                                className="md-lg:block hidden p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
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
                                    className={`flex ${currentFd.fdId !== msg.receverId ? 'justify-start' : 'justify-end'} mb-3`}
                                >
                                    <div className="flex items-end gap-2">
                                        {currentFd.fdId !== msg.receverId && (
                                            <img src="http://localhost:3000/images/user.png" alt="user" className="w-8 h-8 rounded-full" />
                                        )}
                                        <div
                                            className={`max-w-xs p-3 rounded-lg shadow-sm ${
                                                currentFd.fdId !== msg.receverId
                                                    ? 'bg-indigo-500 text-white'
                                                    : 'bg-white text-gray-800'
                                            }`}
                                        >
                                            {msg.message}
                                        </div>
                                        {currentFd.fdId === msg.receverId && (
                                            <img src="http://localhost:3000/images/user.png" alt="user" className="w-8 h-8 rounded-full" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t flex items-center gap-2">
                            <button className="p-2 text-gray-600 hover:text-indigo-500 transition-colors">
                                <AiOutlinePlus size={24} />
                            </button>
                            <div className="flex-1 relative">
                                <input
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    type="text"
                                    placeholder="Type a message..."
                                    className="w-full p-3 pr-10 rounded-full border border-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-500">
                                    <GrEmoji size={20} />
                                </button>
                            </div>
                            <button
                                onClick={sendMessage}
                                className="p-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors"
                            >
                                <IoSend size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div
                        onClick={() => setShowSidebar(true)}
                        className="flex-1 flex items-center justify-center text-gray-500 cursor-pointer hover:text-indigo-500 transition-colors"
                    >
                        <span className="text-lg font-medium">Select a Seller to Chat</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;