import React, { useEffect, useState } from 'react';
import { FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { forgot_password, messageClear } from '../store/reducers/authReducer';
import toast from 'react-hot-toast';
import { FadeLoader } from 'react-spinners';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ForgotPassword = () => {
    const dispatch = useDispatch();
    const { loader, errorMessage, successMessage } = useSelector(state => state.auth);

    // State cho form
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Validate email
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleChange = (e) => {
        setEmail(e.target.value);
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!email) {
            setError('Vui lòng nhập email của bạn');
            return;
        }
        
        if (!validateEmail(email)) {
            setError('Email không hợp lệ');
            return;
        }
        
        dispatch(forgot_password({ email }));
        setSubmitted(true);
    };

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
            setSubmitted(false);
        }
    }, [successMessage, errorMessage, dispatch]);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Loader khi đang xử lý */}
            {loader && (
                <div className="w-screen h-screen flex justify-center items-center fixed left-0 top-0 bg-black bg-opacity-30 z-[999]">
                    <FadeLoader color="#ef4444" />
                </div>
            )}

            <Header />

            <div className="flex-grow flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Quên mật khẩu</h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
                        </p>
                    </div>

                    {submitted && successMessage ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <h3 className="text-lg font-medium text-green-800 mb-2">Kiểm tra email của bạn</h3>
                            <p className="text-green-700">
                                Chúng tôi đã gửi một email với hướng dẫn đặt lại mật khẩu đến địa chỉ email của bạn.
                            </p>
                            <div className="mt-4">
                                <Link to="/login" className="text-emerald-600 hover:text-emerald-500 font-medium">
                                    Quay lại đăng nhập
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="rounded-md shadow-sm -space-y-px">
                                <div className="space-y-1">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaEnvelope className={`h-5 w-5 ${error ? 'text-red-500' : 'text-gray-400'}`} />
                                        </div>
                                        <input
                                            onChange={handleChange}
                                            value={email}
                                            className={`block w-full pl-10 pr-3 py-3 border ${
                                                error ? 'border-red-500' : 'border-gray-300'
                                            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                                            type="email"
                                            name="email"
                                            id="email"
                                            placeholder="your-email@example.com"
                                            required
                                        />
                                    </div>
                                    {error && (
                                        <p className="mt-1 text-sm text-red-500">{error}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loader}
                                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-150 ease-in-out"
                                >
                                    {loader ? 'Đang gửi...' : 'Gửi liên kết đặt lại mật khẩu'}
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <Link to="/login" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
                                    Quay lại đăng nhập
                                </Link>
                                <Link to="/register" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
                                    Đăng ký tài khoản mới
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ForgotPassword; 