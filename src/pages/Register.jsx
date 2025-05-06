import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaFacebookF, FaGoogle, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { customer_register, messageClear } from '../store/reducers/authReducer';
import toast from 'react-hot-toast';
import { FadeLoader } from 'react-spinners';

const Register = () => {
    const navigate = useNavigate();
    const { loader, errorMessage, successMessage, userInfo } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    const [state, setState] = useState({
        name: '',
        email: '',
        password: ''
    });

    const [isHovered, setIsHovered] = useState({
        facebook: false,
        google: false,
        sellerLogin: false,
        sellerRegister: false
    });

    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    const register = (e) => {
        e.preventDefault();
        dispatch(customer_register(state));
    };

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
        if (userInfo) {
            navigate('/');
        }
    }, [successMessage, errorMessage, userInfo, navigate, dispatch]);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Loader khi đang xử lý */}
            {loader && (
                <div className="w-screen h-screen flex justify-center items-center fixed left-0 top-0 bg-black bg-opacity-30 z-[999]">
                    <FadeLoader color="#059473" />
                </div>
            )}

            <Header />

            {/* Nội dung chính */}
            <main className="flex-grow flex items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Cột trái - Form đăng ký */}
                        <div className="p-8 md:p-12">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-800">Tạo tài khoản mới</h2>
                                <p className="text-gray-600 mt-2">Đăng ký để trải nghiệm dịch vụ của chúng tôi</p>
                            </div>

                            <form onSubmit={register} className="space-y-6">
                                <div className="space-y-1">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Họ và tên
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUser className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            onChange={inputHandle}
                                            value={state.name}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            type="text"
                                            name="name"
                                            id="name"
                                            placeholder="Nhập họ và tên"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaEnvelope className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            onChange={inputHandle}
                                            value={state.email}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            type="email"
                                            name="email"
                                            id="email"
                                            placeholder="email@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Mật khẩu
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaLock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            onChange={inputHandle}
                                            value={state.password}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            type="password"
                                            name="password"
                                            id="password"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-300"
                                >
                                    Đăng ký
                                </button>
                            </form>

                            {/* Phần chia cách */}
                            <div className="mt-6 relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Hoặc tiếp tục với</span>
                                </div>
                            </div>

                            {/* Nút đăng nhập bằng mạng xã hội */}
                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <button
                                    onMouseEnter={() => setIsHovered({...isHovered, facebook: true})}
                                    onMouseLeave={() => setIsHovered({...isHovered, facebook: false})}
                                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-300"
                                >
                                    <FaFacebookF className={`h-5 w-5 ${isHovered.facebook ? 'text-blue-600' : ''}`} />
                                    <span className="ml-2">Facebook</span>
                                </button>

                                <button
                                    onMouseEnter={() => setIsHovered({...isHovered, google: true})}
                                    onMouseLeave={() => setIsHovered({...isHovered, google: false})}
                                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-300"
                                >
                                    <FaGoogle className={`h-5 w-5 ${isHovered.google ? 'text-red-500' : ''}`} />
                                    <span className="ml-2">Google</span>
                                </button>
                            </div>

                            {/* Link đăng nhập */}
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Đã có tài khoản?{' '}
                                    <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
                                        Đăng nhập ngay
                                    </Link>
                                </p>
                            </div>

                            {/* Các nút cho người bán */}
                            <div className="mt-8 space-y-3">
                                <a
                                    href="http://localhost:3001/login"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onMouseEnter={() => setIsHovered({...isHovered, sellerLogin: true})}
                                    onMouseLeave={() => setIsHovered({...isHovered, sellerLogin: false})}
                                    className="block w-full text-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition duration-300"
                                >
                                    Đăng nhập với tư cách Người bán
                                </a>

                                <a
                                    href="http://localhost:3001/register"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onMouseEnter={() => setIsHovered({...isHovered, sellerRegister: true})}
                                    onMouseLeave={() => setIsHovered({...isHovered, sellerRegister: false})}
                                    className="block w-full text-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-300"
                                >
                                    Đăng ký với tư cách Người bán
                                </a>
                            </div>
                        </div>

                        {/* Cột phải - Hình ảnh */}
                        <div className="hidden lg:block relative bg-gradient-to-br from-emerald-500 to-teal-600">
                            <div className="absolute inset-0 bg-black opacity-10"></div>
                            <div className="relative h-full flex items-center justify-center p-12">
                                <div className="text-center text-white">
                                    <h3 className="text-3xl font-bold mb-4">Đã là thành viên?</h3>
                                    <p className="mb-8 text-emerald-100 max-w-md mx-auto">
                                        Đăng nhập ngay để tiếp tục trải nghiệm các dịch vụ tuyệt vời của chúng tôi
                                    </p>
                                    <Link
                                        to="/login"
                                        className="inline-block px-6 py-3 border-2 border-white rounded-lg text-white font-medium hover:bg-white hover:bg-opacity-20 transition duration-300"
                                    >
                                        Đăng nhập
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Register;