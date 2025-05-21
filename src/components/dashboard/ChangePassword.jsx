import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { messageClear } from '../../store/reducers/authReducer';
import { FadeLoader } from 'react-spinners';

const ChangePassword = () => {
    const dispatch = useDispatch();
    const { loader, errorMessage, successMessage } = useSelector(state => state.auth);
    const [formData, setFormData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Xóa lỗi khi người dùng bắt đầu nhập
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
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

    const validateForm = () => {
        const newErrors = {};
        if (!formData.old_password) newErrors.old_password = 'Vui lòng nhập mật khẩu hiện tại';
        
        const passwordValidation = validatePassword(formData.new_password);
        if (!passwordValidation.isValid) {
            newErrors.new_password = passwordValidation.message;
        }
        
        if (!formData.confirm_password) {
            newErrors.confirm_password = 'Vui lòng xác nhận mật khẩu';
        } else if (formData.confirm_password !== formData.new_password) {
            newErrors.confirm_password = 'Mật khẩu xác nhận không khớp';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const { data } = await api.post('/customer/change-password', {
                oldPassword: formData.old_password,
                newPassword: formData.new_password
            });
            
            toast.success(data.message || 'Mật khẩu đã được cập nhật thành công');
            
            // Reset form
            setFormData({
                old_password: '',
                new_password: '',
                confirm_password: ''
            });
        } catch (error) {
            const errorMessage = error.message || 'Có lỗi xảy ra khi đổi mật khẩu';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
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
    }, [successMessage, errorMessage, dispatch]);

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Đổi mật khẩu</h2>

            {/* Loader khi đang xử lý */}
            {isSubmitting && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                    <FadeLoader color="#6366f1" />
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Mật khẩu hiện tại */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="old_password" className="text-sm font-medium text-gray-700">
                        Mật khẩu hiện tại
                    </label>
                    <input
                        type="password"
                        name="old_password"
                        id="old_password"
                        value={formData.old_password}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu hiện tại"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                            errors.old_password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-500'
                        }`}
                    />
                    {errors.old_password && (
                        <p className="text-xs text-red-500 mt-1">{errors.old_password}</p>
                    )}
                </div>

                {/* Mật khẩu mới */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="new_password" className="text-sm font-medium text-gray-700">
                        Mật khẩu mới
                    </label>
                    <input
                        type="password"
                        name="new_password"
                        id="new_password"
                        value={formData.new_password}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu mới"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                            errors.new_password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-500'
                        }`}
                    />
                    {errors.new_password && (
                        <p className="text-xs text-red-500 mt-1">{errors.new_password}</p>
                    )}
                    <ul className="mt-1 text-xs text-gray-500 list-disc list-inside">
                        <li>Ít nhất 8 ký tự</li>
                        <li>Ít nhất một chữ cái in hoa</li>
                        <li>Ít nhất một chữ cái thường</li>
                        <li>Ít nhất một chữ số</li>
                        <li>Ít nhất một ký tự đặc biệt (!@#$%^&*...)</li>
                    </ul>
                </div>

                {/* Xác nhận mật khẩu */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="confirm_password" className="text-sm font-medium text-gray-700">
                        Xác nhận mật khẩu mới
                    </label>
                    <input
                        type="password"
                        name="confirm_password"
                        id="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        placeholder="Nhập lại mật khẩu mới"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                            errors.confirm_password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-500'
                        }`}
                    />
                    {errors.confirm_password && (
                        <p className="text-xs text-red-500 mt-1">{errors.confirm_password}</p>
                    )}
                </div>

                {/* Nút gửi */}
                <div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70"
                    >
                        {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword;
