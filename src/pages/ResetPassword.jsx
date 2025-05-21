import React, { useEffect, useState } from 'react';
import { FaLock } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { reset_password, messageClear } from '../store/reducers/authReducer';
import toast from 'react-hot-toast';
import { FadeLoader } from 'react-spinners';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loader, errorMessage, successMessage } = useSelector(state => state.auth);

    // State cho form
    const [state, setState] = useState({
        password: '',
        confirmPassword: ''
    });

    // State cho validation
    const [errors, setErrors] = useState({
        password: '',
        confirmPassword: ''
    });

    const [resetComplete, setResetComplete] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setState({
            ...state,
            [name]: value
        });

        // Clear error when user starts typing
        setErrors({
            ...errors,
            [name]: ''
        });
    };

    // Validate password
    const validatePassword = (password) => {
        if (!password) {
            return {
                isValid: false,
                message: 'Vui lòng nhập mật khẩu mới'
            };
        }
        
        // Kiểm tra độ dài tối thiểu
        if (password.length < 8) {
            return {
                isValid: false,
                message: 'Mật khẩu phải có ít nhất 8 ký tự'
            };
        }

        // Kiểm tra có ít nhất một chữ hoa
        if (!/[A-Z]/.test(password)) {
            return {
                isValid: false,
                message: 'Mật khẩu phải có ít nhất một chữ cái in hoa'
            };
        }

        // Kiểm tra có ít nhất một chữ thường
        if (!/[a-z]/.test(password)) {
            return {
                isValid: false,
                message: 'Mật khẩu phải có ít nhất một chữ cái thường'
            };
        }

        // Kiểm tra có ít nhất một chữ số
        if (!/[0-9]/.test(password)) {
            return {
                isValid: false,
                message: 'Mật khẩu phải có ít nhất một chữ số'
            };
        }

        // Kiểm tra có ít nhất một ký tự đặc biệt
        if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
            return {
                isValid: false,
                message: 'Mật khẩu phải có ít nhất một ký tự đặc biệt (!@#$%^&*...)'
            };
        }

        return {
            isValid: true,
            message: 'Mật khẩu hợp lệ'
        };
    };

    // Validate form
    const validateForm = () => {
        let isValid = true;
        const newErrors = { ...errors };

        const passwordValidation = validatePassword(state.password);
        if (!passwordValidation.isValid) {
            newErrors.password = passwordValidation.message;
            isValid = false;
        }

        if (!state.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
            isValid = false;
        } else if (state.confirmPassword !== state.password) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            dispatch(reset_password({
                token,
                password: state.password
            }));
        }
    };

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            setResetComplete(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch, navigate]);

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
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Đặt lại mật khẩu</h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Nhập mật khẩu mới cho tài khoản của bạn
                        </p>
                    </div>

                    {resetComplete ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <h3 className="text-lg font-medium text-green-800 mb-2">Đặt lại mật khẩu thành công!</h3>
                            <p className="text-green-700">
                                Mật khẩu của bạn đã được cập nhật. Bạn sẽ được chuyển hướng đến trang đăng nhập trong vài giây.
                            </p>
                            <div className="mt-4">
                                <Link to="/login" className="text-emerald-600 hover:text-emerald-500 font-medium">
                                    Đăng nhập ngay
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="rounded-md shadow-sm -space-y-px">
                                <div className="space-y-1">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Mật khẩu mới
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaLock className={`h-5 w-5 ${errors.password ? 'text-red-500' : 'text-gray-400'}`} />
                                        </div>
                                        <input
                                            onChange={handleChange}
                                            value={state.password}
                                            className={`block w-full pl-10 pr-3 py-3 border ${
                                                errors.password ? 'border-red-500' : 'border-gray-300'
                                            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                                            type="password"
                                            name="password"
                                            id="password"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                                    )}
                                    <ul className="mt-1 text-xs text-gray-500 list-disc list-inside">
                                        <li>Ít nhất 8 ký tự</li>
                                        <li>Ít nhất một chữ cái in hoa</li>
                                        <li>Ít nhất một chữ cái thường</li>
                                        <li>Ít nhất một chữ số</li>
                                        <li>Ít nhất một ký tự đặc biệt (!@#$%^&*...)</li>
                                    </ul>
                                </div>

                                <div className="space-y-1 mt-4">
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                        Xác nhận mật khẩu
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaLock className={`h-5 w-5 ${errors.confirmPassword ? 'text-red-500' : 'text-gray-400'}`} />
                                        </div>
                                        <input
                                            onChange={handleChange}
                                            value={state.confirmPassword}
                                            className={`block w-full pl-10 pr-3 py-3 border ${
                                                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                                            type="password"
                                            name="confirmPassword"
                                            id="confirmPassword"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loader}
                                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-150 ease-in-out"
                                >
                                    {loader ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                                </button>
                            </div>

                            <div className="flex items-center justify-center">
                                <Link to="/login" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
                                    Quay lại đăng nhập
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

export default ResetPassword; 