import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { update_user_info } from '../../store/reducers/authReducer';
import { FiUpload, FiSave, FiEdit, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Profile = () => {
    const dispatch = useDispatch();
    const { userInfo, loading } = useSelector(state => state.auth);
    const fileInputRef = useRef(null);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        image: null
    });
    
    // Preview image
    const [imagePreview, setImagePreview] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Initialize form data from user info
    useEffect(() => {
        if (userInfo) {
            setFormData({
                name: userInfo.name || '',
                email: userInfo.email || '',
                image: null
            });
            
            if (userInfo.image) {
                setImagePreview(userInfo.image);
            }
        }
    }, [userInfo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Chỉ cho phép các định dạng ảnh: JPEG, PNG, JPG, GIF');
                return;
            }
            
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Kích thước ảnh không được vượt quá 2MB');
                return;
            }
            
            setFormData({
                ...formData,
                image: file
            });
            
            // Create preview URL
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            
            // Logging for debug
            console.log('Selected file:', file.name, file.type, file.size);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check if email is valid
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Email không hợp lệ');
            return;
        }
        
        // Create form data for submission
        const submitData = new FormData();
        
        // Add form fields to FormData
        submitData.append('name', formData.name);
        submitData.append('email', formData.email);
        
        // Only append image if it exists
        if (formData.image) {
            submitData.append('image', formData.image);
        }
        
        // Debug to check FormData
        console.log('Submitting data:', {
            name: formData.name,
            email: formData.email,
            hasImage: formData.image !== null
        });
        
        try {
            const result = await dispatch(update_user_info(submitData)).unwrap();
            if (result.success) {
                toast.success(result.message || 'Cập nhật thông tin thành công');
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error || 'Lỗi khi cập nhật thông tin');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin cá nhân</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Picture */}
                <div className="flex flex-col items-center">
                    <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-100 mb-4 relative">
                        {imagePreview ? (
                            <img 
                                src={imagePreview} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/avatar-placeholder.png';
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gray-200">
                                <FiUser className="w-20 h-20 text-gray-400" />
                            </div>
                        )}
                        
                        {isEditing && (
                            <div 
                                className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <FiUpload className="w-8 h-8 text-white" />
                            </div>
                        )}
                    </div>
                    
                    {isEditing && (
                        <>
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2"
                            >
                                <FiUpload className="w-4 h-4" />
                                Tải ảnh lên
                            </button>
                        </>
                    )}
                </div>
                
                {/* Personal Information Form */}
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:text-gray-500"
                                    placeholder="Nhập họ và tên"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:text-gray-500"
                                    placeholder="Nhập địa chỉ email"
                                    required
                                />
                            </div>
                            
                            {!isEditing ? (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
                                >
                                    <FiEdit className="w-4 h-4" />
                                    Chỉnh sửa thông tin
                                </button>
                            ) : (
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-70"
                                    >
                                        {loading ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <FiSave className="w-4 h-4" />
                                        )}
                                        Lưu thay đổi
                                    </button>
                                    
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            // Reset form data
                                            if (userInfo) {
                                                setFormData({
                                                    name: userInfo.name || '',
                                                    email: userInfo.email || '',
                                                    image: null
                                                });
                                                
                                                if (userInfo.image) {
                                                    setImagePreview(userInfo.image);
                                                } else {
                                                    setImagePreview('');
                                                }
                                            }
                                        }}
                                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile; 