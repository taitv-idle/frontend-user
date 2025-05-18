import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    get_provinces, 
    get_districts, 
    get_wards, 
    get_saved_addresses,
    save_shipping_address,
    update_address,
    delete_address,
    set_default_address,
    clearLocationData,
    messageClear
} from '../../store/reducers/orderReducer';
import { FaEdit, FaTrash, FaStar, FaPlus, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';

const Addresses = () => {
    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);
    const { 
        provinces, 
        districts, 
        wards, 
        savedAddresses,
        addressLoading,
        successMessage,
        errorMessage
    } = useSelector(state => state.order);

    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [state, setState] = useState({
        name: userInfo?.name || '',
        address: '',
        phone: '',
        post: '',
        province: '',
        provinceCode: '',
        city: '',
        cityCode: '',
        area: '',
        areaCode: '',
        isDefault: false
    });

    // Fetch data on component mount
    useEffect(() => {
        if (userInfo?.id) {
            dispatch(get_saved_addresses(userInfo.id));
            dispatch(get_provinces());
        }
    }, [userInfo, dispatch]);

    // Handle notifications
    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            if (!editingAddress) {
                setShowForm(false);
            }
            setEditingAddress(null);
            // Reset form
            setState({
                name: userInfo?.name || '',
                address: '',
                phone: '',
                post: '',
                province: '',
                provinceCode: '',
                city: '',
                cityCode: '',
                area: '',
                areaCode: '',
                isDefault: false
            });
        }
    }, [errorMessage, successMessage, dispatch, userInfo, editingAddress]);

    // Load districts when province changes
    useEffect(() => {
        if (state.provinceCode) {
            dispatch(get_districts(state.provinceCode));
        }
    }, [dispatch, state.provinceCode]);

    // Load wards when district changes
    useEffect(() => {
        if (state.cityCode) {
            dispatch(get_wards(state.cityCode));
        }
    }, [dispatch, state.cityCode]);

    const handleProvinceChange = (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        setState({
            ...state,
            province: selectedOption.text,
            provinceCode: e.target.value,
            city: '',
            cityCode: '',
            area: '',
            areaCode: ''
        });
        dispatch(clearLocationData());
    };

    const handleDistrictChange = (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        setState({
            ...state,
            city: selectedOption.text,
            cityCode: e.target.value,
            area: '',
            areaCode: ''
        });
    };

    const handleWardChange = (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        setState({
            ...state,
            area: selectedOption.text,
            areaCode: e.target.value
        });
    };

    const handleEditAddress = (address) => {
        setEditingAddress(address);
        setState({
            name: address.name,
            phone: address.phone,
            address: address.address,
            province: address.province,
            provinceCode: address.provinceCode,
            city: address.city,
            cityCode: address.cityCode,
            area: address.area,
            areaCode: address.areaCode,
            post: address.post || '',
            isDefault: address.isDefault
        });
        setShowForm(true);
    };

    const handleDeleteAddress = async (addressId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
            dispatch(delete_address(addressId));
        }
    };

    const handleSetDefaultAddress = async (addressId) => {
        dispatch(set_default_address(addressId));
    };

    const handleInputChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, address, phone, province, city, area } = state;

        if (!name || !address || !phone || !province || !city || !area) {
            toast.error('Vui lòng điền đầy đủ thông tin địa chỉ');
            return;
        }

        if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(phone)) {
            toast.error('Số điện thoại không hợp lệ');
            return;
        }

        if (editingAddress) {
            dispatch(update_address({
                addressId: editingAddress._id,
                addressData: {
                    ...state,
                    userId: userInfo.id
                }
            }));
        } else {
            dispatch(save_shipping_address({
                ...state,
                userId: userInfo.id
            }));
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Địa chỉ giao hàng</h2>
                {!showForm && (
                    <button 
                        onClick={() => {
                            setEditingAddress(null);
                            setShowForm(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    >
                        <FaPlus className="text-xs" />
                        <span>Thêm địa chỉ mới</span>
                    </button>
                )}
            </div>

            {showForm ? (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">
                        {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên*
                                </label>
                                <input
                                    onChange={handleInputChange}
                                    value={state.name}
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    name="name"
                                    id="name"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Số điện thoại*
                                </label>
                                <input
                                    onChange={handleInputChange}
                                    value={state.phone}
                                    type="tel"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    name="phone"
                                    id="phone"
                                    placeholder="09xxxxxxx hoặc 03xxxxxxx"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                Địa chỉ cụ thể*
                            </label>
                            <input
                                onChange={handleInputChange}
                                value={state.address}
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                name="address"
                                id="address"
                                placeholder="Số nhà, tên đường"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố*</label>
                                <select
                                    onChange={handleProvinceChange}
                                    value={state.provinceCode}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    name="province"
                                    id="province"
                                    required
                                    disabled={addressLoading}
                                >
                                    <option value="">Chọn tỉnh/thành phố</option>
                                    {provinces.map((province) => (
                                        <option key={province.code} value={province.code}>
                                            {province.name}
                                        </option>
                                    ))}
                                </select>
                                {addressLoading && state.provinceCode === '' && (
                                    <div className="mt-1 text-sm text-gray-500">
                                        Đang tải danh sách tỉnh/thành phố...
                                    </div>
                                )}
                            </div>
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện*</label>
                                <select
                                    onChange={handleDistrictChange}
                                    value={state.cityCode}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    name="city"
                                    id="city"
                                    required
                                    disabled={addressLoading || !state.provinceCode}
                                >
                                    <option value="">Chọn quận/huyện</option>
                                    {districts.map((district) => (
                                        <option key={district.code} value={district.code}>
                                            {district.name}
                                        </option>
                                    ))}
                                </select>
                                {addressLoading && state.provinceCode && !state.cityCode && (
                                    <div className="mt-1 text-sm text-gray-500">
                                        Đang tải danh sách quận/huyện...
                                    </div>
                                )}
                            </div>
                            <div>
                                <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã*</label>
                                <select
                                    onChange={handleWardChange}
                                    value={state.areaCode}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    name="area"
                                    id="area"
                                    required
                                    disabled={addressLoading || !state.cityCode}
                                >
                                    <option value="">Chọn phường/xã</option>
                                    {wards.map((ward) => (
                                        <option key={ward.code} value={ward.code}>
                                            {ward.name}
                                        </option>
                                    ))}
                                </select>
                                {addressLoading && state.cityCode && !state.areaCode && (
                                    <div className="mt-1 text-sm text-gray-500">
                                        Đang tải danh sách phường/xã...
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="post" className="block text-sm font-medium text-gray-700 mb-1">Mã bưu điện (nếu có)</label>
                            <input
                                onChange={handleInputChange}
                                value={state.post}
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                name="post"
                                id="post"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isDefault"
                                checked={state.isDefault}
                                onChange={(e) => setState({ ...state, isDefault: e.target.checked })}
                                className="rounded border-gray-300 text-red-500 focus:ring-red-500"
                            />
                            <label htmlFor="isDefault" className="text-sm text-gray-600">
                                Đặt làm địa chỉ mặc định
                            </label>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingAddress(null);
                                    setState({
                                        name: userInfo?.name || '',
                                        address: '',
                                        phone: '',
                                        post: '',
                                        province: '',
                                        provinceCode: '',
                                        city: '',
                                        cityCode: '',
                                        area: '',
                                        areaCode: '',
                                        isDefault: false
                                    });
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition disabled:bg-red-300 disabled:cursor-not-allowed flex items-center gap-2"
                                disabled={addressLoading}
                            >
                                {addressLoading ? (
                                    <>
                                        <ClipLoader color="#ffffff" size={16} />
                                        <span>Đang xử lý...</span>
                                    </>
                                ) : (
                                    <span>{editingAddress ? 'Cập nhật' : 'Lưu'}</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="space-y-4">
                    {addressLoading && !savedAddresses.length ? (
                        <div className="flex justify-center items-center py-8">
                            <ClipLoader color="#ef4444" size={32} />
                        </div>
                    ) : savedAddresses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {savedAddresses.map((address) => (
                                <div key={address._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-2">
                                            <FaMapMarkerAlt className="text-red-500 mt-1 flex-shrink-0" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium text-gray-800">{address.name}</h4>
                                                    {address.isDefault && (
                                                        <span className="inline-block px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                                                            Mặc định
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">{address.phone}</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {address.address}, {address.area}, {address.city}, {address.province}
                                                </p>
                                                {address.post && (
                                                    <p className="text-sm text-gray-600">Mã bưu điện: {address.post}</p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleEditAddress(address)}
                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                                                title="Chỉnh sửa"
                                            >
                                                <FaEdit className="text-sm" />
                                            </button>
                                            
                                            <button
                                                onClick={() => handleDeleteAddress(address._id)}
                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                                                title="Xóa"
                                            >
                                                <FaTrash className="text-sm" />
                                            </button>
                                            
                                            {!address.isDefault && (
                                                <button
                                                    onClick={() => handleSetDefaultAddress(address._id)}
                                                    className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition"
                                                    title="Đặt làm mặc định"
                                                >
                                                    <FaStar className="text-sm" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-8 rounded-md text-center">
                            <p className="text-gray-500">Bạn chưa có địa chỉ giao hàng nào.</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-4 px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition inline-flex items-center gap-2"
                            >
                                <FaPlus className="text-xs" />
                                <span>Thêm địa chỉ mới</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Addresses; 