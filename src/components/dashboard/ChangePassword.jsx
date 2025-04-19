import React, { useState } from 'react';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [errors, setErrors] = useState({});

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

    const validateForm = () => {
        const newErrors = {};
        if (!formData.old_password) newErrors.old_password = 'Vui lòng nhập mật khẩu hiện tại';
        if (!formData.new_password) {
            newErrors.new_password = 'Vui lòng nhập mật khẩu mới';
        } else if (formData.new_password.length < 6) {
            newErrors.new_password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        if (!formData.confirm_password) {
            newErrors.confirm_password = 'Vui lòng xác nhận mật khẩu';
        } else if (formData.confirm_password !== formData.new_password) {
            newErrors.confirm_password = 'Mật khẩu xác nhận không khớp';
        }
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        // Xử lý logic đổi mật khẩu ở đây (gọi API, etc.)
        console.log('Dữ liệu gửi:', formData);
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Đổi mật khẩu</h2>

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
                        className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300"
                    >
                        Cập nhật mật khẩu
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword;
