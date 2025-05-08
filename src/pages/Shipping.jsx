import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { FaMapMarkerAlt, FaPhone, FaUser, FaSave, FaEdit, FaTrash, FaStar } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { 
    place_order, 
    get_provinces, 
    get_districts, 
    get_wards,
    calculate_shipping_fee,
    save_shipping_address,
    get_saved_addresses,
    update_address,
    delete_address,
    set_default_address,
    clearLocationData
} from '../store/reducers/orderReducer';
import { toast } from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';

const Shipping = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);
    const { 
        provinces, 
        districts, 
        wards, 
        savedAddresses,
        addressLoading,
        addressError,
        shippingFee,
        isFreeShipping,
        errorMessage,
        successMessage
    } = useSelector(state => state.order);

    // State declarations
    const [res, setRes] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [saveAddress, setSaveAddress] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [loading, setLoading] = useState(false);

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

    // Validation check
    useEffect(() => {
        if (!location.state?.products || !location.state?.price) {
            toast.error('Vui lòng chọn sản phẩm trước khi thanh toán');
            navigate('/cart');
        }
    }, [location.state, navigate]);

    // Lấy danh sách tỉnh/thành phố khi component mount
    useEffect(() => {
        dispatch(get_provinces());
        if (userInfo?.id) {
            dispatch(get_saved_addresses(userInfo.id));
        }
    }, [dispatch, userInfo?.id]);

    // Lấy danh sách quận/huyện khi tỉnh/thành phố thay đổi
    useEffect(() => {
        if (state.provinceCode) {
            dispatch(get_districts(state.provinceCode));
        }
    }, [dispatch, state.provinceCode]);

    // Lấy danh sách phường/xã khi quận/huyện thay đổi
    useEffect(() => {
        if (state.cityCode) {
            dispatch(get_wards(state.cityCode));
        }
    }, [dispatch, state.cityCode]);

    // Tính phí vận chuyển khi giá trị đơn hàng thay đổi
    useEffect(() => {
        if (location.state?.price) {
            dispatch(calculate_shipping_fee(location.state.price));
        }
    }, [dispatch, location.state?.price]);

    // Xử lý thông báo
    useEffect(() => {
        if (errorMessage) {
            const message = typeof errorMessage === 'object' ? errorMessage.message : errorMessage;
            toast.error(message);
        }
        if (successMessage) {
            const message = typeof successMessage === 'object' ? successMessage.message : successMessage;
            toast.success(message);
        }
    }, [errorMessage, successMessage]);

    // Xử lý lỗi địa chỉ
    useEffect(() => {
        if (addressError) {
            const message = typeof addressError === 'object' ? addressError.message : addressError;
            toast.error(message);
        }
    }, [addressError]);

    // Loading state effect
    useEffect(() => {
        if (loading) {
            toast.loading('Đang xử lý...', { id: 'shipping' });
        } else {
            toast.dismiss('shipping');
        }
    }, [loading]);

    // Early return if no location state
    if (!location.state?.products || !location.state?.price) {
        return null;
    }

    const { products, price, shipping_fee } = location.state;

    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

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

    const handleAddressSelect = (address) => {
        setSelectedAddress(address);
        setState({
            ...state,
            name: address.name,
            phone: address.phone,
            address: address.address,
            province: address.province,
            provinceCode: address.provinceCode,
            city: address.city,
            cityCode: address.cityCode,
            area: address.area,
            areaCode: address.areaCode
        });
        setRes(true);
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
        setShowNewAddressForm(true);
    };

    const handleDeleteAddress = async (addressId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
            await dispatch(delete_address(addressId));
        }
    };

    const handleSetDefaultAddress = async (addressId) => {
        await dispatch(set_default_address(addressId));
    };

    const save = async (e) => {
        e.preventDefault();
        const { name, address, phone, province, city, area } = state;

        if (!name || !address || !phone || !province || !city || !area) {
            toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
            return;
        }

        if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(phone)) {
            toast.error('Số điện thoại không hợp lệ');
            return;
        }

        if (editingAddress) {
            await dispatch(update_address({
                addressId: editingAddress._id,
                addressData: {
                    ...state,
                    userId: userInfo.id
                }
            }));
            setEditingAddress(null);
        } else if (saveAddress) {
            await dispatch(save_shipping_address({
                ...state,
                userId: userInfo.id
            }));
        }

        setRes(true);
        setShowNewAddressForm(false);
    };

    const placeOrder = async () => {
        if (!state.address || !state.province || !state.city || !state.area || !state.phone) {
            toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
            return;
        }

        setLoading(true);

        try {
            // Kiểm tra dữ liệu sản phẩm
            if (!products || !Array.isArray(products) || products.length === 0) {
                toast.error('Không có sản phẩm trong giỏ hàng');
                return;
            }

            // Kiểm tra giá
            if (!price || price <= 0) {
                toast.error('Giá sản phẩm không hợp lệ');
                return;
            }

            // Chuẩn bị thông tin giao hàng
            const shippingInfo = {
                name: state.name,
                phone: state.phone,
                address: state.address,
                province: state.province,
                city: state.city,
                area: state.area,
                post: state.post || ''
            };

            // Tính toán giá
            const shippingPrice = isFreeShipping ? 0 : (shippingFee || shipping_fee);
            const totalAmount = price + shippingPrice;

            // Chuẩn bị danh sách sản phẩm
            const orderItems = products.map(shop => ({
                shopId: shop.shopId,
                products: shop.products.map(product => ({
                    productId: product.productInfo._id,
                    quantity: product.quantity,
                    price: product.productInfo.price,
                    discount: product.productInfo.discount,
                    shopId: shop.shopId
                }))
            })).flatMap(shop => shop.products);

            // Chuẩn bị dữ liệu đơn hàng
            const orderData = {
                shippingInfo,
                orderItems,
                itemsPrice: price,
                taxPrice: 0,
                shippingPrice,
                totalPrice: totalAmount,
                userId: userInfo.id,
                navigate,
                paymentMethod
            };

            console.log('Placing order with data:', JSON.stringify(orderData, null, 2));

            // Gửi đơn hàng
            const result = await dispatch(place_order(orderData));

            // Kiểm tra kết quả
            if (result.error) {
                const errorMessage = typeof result.error === 'object' ? result.error.message : result.error;
                toast.error(errorMessage || 'Có lỗi xảy ra khi tạo đơn hàng');
                return;
            }

            // Nếu thành công, hiển thị thông báo
            toast.success('Đặt hàng thành công!');

        } catch (err) {
            console.error('Order error:', err);
            const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo đơn hàng';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Tính tổng tiền: giá đơn hàng + phí vận chuyển (nếu không được miễn phí)
    const totalPayment = price + (isFreeShipping ? 0 : (shippingFee || shipping_fee));

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            {/* Banner */}
            <section className='bg-gradient-to-r from-red-500 to-red-600 h-[220px] relative'>
                <div className='absolute inset-0 bg-black/20'></div>
                <div className='container mx-auto px-4 h-full flex items-center justify-center'>
                    <div className='text-center text-white relative z-10'>
                        <h2 className='text-3xl font-bold mb-3'>Thông Tin Giao Hàng</h2>
                        <div className='flex justify-center items-center gap-2'>
                            <Link to='/' className='hover:text-red-200 transition'>Trang chủ</Link>
                            <IoIosArrowForward className="text-sm" />
                            <span>Thanh toán</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className='bg-gray-50 flex-grow py-12'>
                <div className='container mx-auto px-4 max-w-7xl'>
                    <div className='flex flex-col lg:flex-row gap-8'>
                        {/* Shipping Information */}
                        <div className='lg:w-2/3'>
                            <div className='bg-white p-6 rounded-lg shadow-sm'>
                                <h2 className='text-xl font-bold text-gray-800 mb-6'>Thông Tin Nhận Hàng</h2>

                                {!res ? (
                                    <div className='space-y-6'>
                                        {/* Debug info */}
                                        <div className='text-sm text-gray-500'>
                                            <p>Show new address form: {showNewAddressForm ? 'true' : 'false'}</p>
                                            <p>Saved addresses count: {savedAddresses?.length || 0}</p>
                                            <p>Editing address: {editingAddress ? 'yes' : 'no'}</p>
                                        </div>

                                        {/* Địa chỉ đã lưu */}
                                        {savedAddresses && savedAddresses.length > 0 && !showNewAddressForm && (
                                            <div className='space-y-4'>
                                                <div className='flex justify-between items-center'>
                                                    <h3 className='font-medium text-gray-700'>Địa chỉ đã lưu</h3>
                                                    <button
                                                        onClick={() => {
                                                            setEditingAddress(null);
                                                            setShowNewAddressForm(true);
                                                        }}
                                                        className='text-sm text-red-500 hover:text-red-600'
                                                    >
                                                        + Thêm địa chỉ mới
                                                    </button>
                                                </div>
                                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                    {savedAddresses.map((address) => (
                                                        <div
                                                            key={address._id}
                                                            className={`p-4 border rounded-lg transition ${
                                                                selectedAddress?._id === address._id
                                                                    ? 'border-red-500 bg-red-50'
                                                                    : 'border-gray-200 hover:border-red-300'
                                                            }`}
                                                        >
                                                            <div className='flex items-start gap-3'>
                                                                <FaMapMarkerAlt className="text-red-500 mt-1" />
                                                                <div className='flex-1'>
                                                                    <div className='flex justify-between items-start'>
                                                                        <h4 className='font-medium text-gray-800'>{address.name}</h4>
                                                                        <div className='flex gap-2'>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleEditAddress(address);
                                                                                }}
                                                                                className='text-gray-500 hover:text-blue-600'
                                                                            >
                                                                                <FaEdit />
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleDeleteAddress(address._id);
                                                                                }}
                                                                                className='text-gray-500 hover:text-red-600'
                                                                            >
                                                                                <FaTrash />
                                                                            </button>
                                                                            {!address.isDefault && (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleSetDefaultAddress(address._id);
                                                                                }}
                                                                                    className='text-gray-500 hover:text-yellow-600'
                                                                                >
                                                                                    <FaStar />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <p className='text-sm text-gray-600 mt-1'>{address.phone}</p>
                                                                    <p className='text-sm text-gray-600 mt-1'>
                                                                        {address.address}, {address.area}, {address.city}, {address.province}
                                                                    </p>
                                                                    {address.isDefault && (
                                                                        <span className='inline-block mt-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full'>
                                                                            Mặc định
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleAddressSelect(address)}
                                                                className='w-full mt-3 py-2 text-sm text-center border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition'
                                                            >
                                                                Chọn địa chỉ này
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Form nhập địa chỉ mới */}
                                        {(showNewAddressForm || !savedAddresses || savedAddresses.length === 0) && (
                                            <form onSubmit={save} className='space-y-4'>
                                                <div className='flex justify-between items-center mb-4'>
                                                    <h3 className='font-medium text-gray-700'>
                                                        {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                                                    </h3>
                                                    {savedAddresses.length > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setShowNewAddressForm(false);
                                                                setEditingAddress(null);
                                                            }}
                                                            className='text-sm text-gray-500 hover:text-gray-700'
                                                        >
                                                            Quay lại
                                                        </button>
                                                    )}
                                                </div>
                                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                    <div>
                                                        <label htmlFor="name" className='block text-sm font-medium text-gray-700 mb-1'>
                                                            <FaUser className="inline-block mr-1" /> Họ và tên*
                                                        </label>
                                                        <input
                                                            onChange={inputHandle}
                                                            value={state.name}
                                                            type="text"
                                                            className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                                                            name="name"
                                                            id="name"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="phone" className='block text-sm font-medium text-gray-700 mb-1'>
                                                            <FaPhone className="inline-block mr-1" /> Số điện thoại*
                                                        </label>
                                                        <input
                                                            onChange={inputHandle}
                                                            value={state.phone}
                                                            type="tel"
                                                            className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                                                            name="phone"
                                                            id="phone"
                                                            placeholder="09xxxxxxx hoặc 03xxxxxxx"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label htmlFor="address" className='block text-sm font-medium text-gray-700 mb-1'>
                                                        <FaMapMarkerAlt className="inline-block mr-1" /> Địa chỉ cụ thể*
                                                    </label>
                                                    <input
                                                        onChange={inputHandle}
                                                        value={state.address}
                                                        type="text"
                                                        className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                                                        name="address"
                                                        id="address"
                                                        placeholder="Số nhà, tên đường"
                                                        required
                                                    />
                                                </div>

                                                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                                    <div>
                                                        <label htmlFor="province" className='block text-sm font-medium text-gray-700 mb-1'>Tỉnh/Thành phố*</label>
                                                        <select
                                                            onChange={handleProvinceChange}
                                                            value={state.provinceCode}
                                                            className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
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
                                                        <label htmlFor="city" className='block text-sm font-medium text-gray-700 mb-1'>Quận/Huyện*</label>
                                                        <select
                                                            onChange={handleDistrictChange}
                                                            value={state.cityCode}
                                                            className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
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
                                                        <label htmlFor="area" className='block text-sm font-medium text-gray-700 mb-1'>Phường/Xã*</label>
                                                        <select
                                                            onChange={handleWardChange}
                                                            value={state.areaCode}
                                                            className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
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
                                                    <label htmlFor="post" className='block text-sm font-medium text-gray-700 mb-1'>Mã bưu điện (nếu có)</label>
                                                    <input
                                                        onChange={inputHandle}
                                                        value={state.post}
                                                        type="text"
                                                        className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                                                        name="post"
                                                        id="post"
                                                    />
                                                </div>

                                                <div className='flex items-center gap-2'>
                                                    <input
                                                        type="checkbox"
                                                        id="isDefault"
                                                        checked={state.isDefault}
                                                        onChange={(e) => setState({ ...state, isDefault: e.target.checked })}
                                                        className='rounded border-gray-300 text-red-500 focus:ring-red-500'
                                                    />
                                                    <label htmlFor="isDefault" className='text-sm text-gray-600'>
                                                        Đặt làm địa chỉ mặc định
                                                    </label>
                                                </div>

                                                {!editingAddress && savedAddresses.length > 0 && (
                                                    <div className='flex items-center gap-2'>
                                                        <input
                                                            type="checkbox"
                                                            id="saveAddress"
                                                            checked={saveAddress}
                                                            onChange={(e) => setSaveAddress(e.target.checked)}
                                                            className='rounded border-gray-300 text-red-500 focus:ring-red-500'
                                                        />
                                                        <label htmlFor="saveAddress" className='text-sm text-gray-600'>
                                                            Lưu địa chỉ này cho lần sau
                                                        </label>
                                                    </div>
                                                )}

                                                <div className='flex justify-end'>
                                                    <button
                                                        type="submit"
                                                        className='px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2'
                                                        disabled={addressLoading}
                                                    >
                                                        {addressLoading ? (
                                                            <>
                                                                <ClipLoader color="#ffffff" size={16} />
                                                                <span>Đang xử lý...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FaSave />
                                                                <span>{editingAddress ? 'Cập nhật địa chỉ' : 'Xác nhận địa chỉ'}</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                ) : (
                                    <div className='space-y-4'>
                                        <div className='bg-blue-50 p-4 rounded-md border border-blue-100'>
                                            <div className='flex justify-between items-start'>
                                                <div>
                                                    <h3 className='font-medium text-gray-800'>{state.name}</h3>
                                                    <p className='text-gray-600 text-sm mt-1'>
                                                        {state.address}, {state.area}, {state.city}, {state.province}
                                                    </p>
                                                    <p className='text-gray-600 text-sm mt-1'>Điện thoại: {state.phone}</p>
                                                    {state.post && <p className='text-gray-600 text-sm mt-1'>Mã bưu điện: {state.post}</p>}
                                                </div>
                                                <button
                                                    onClick={() => setRes(false)}
                                                    className='text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1'
                                                >
                                                    <IoIosArrowBack className="text-xs" />
                                                    Thay đổi
                                                </button>
                                            </div>
                                        </div>

                                        <div className='mt-6'>
                                            <h3 className='text-lg font-medium text-gray-800 mb-4'>Sản phẩm đặt mua</h3>
                                            <div className='space-y-4'>
                                                {products.map((shop, i) => (
                                                    <div key={i} className='border border-gray-200 rounded-lg p-4'>
                                                        <h4 className='font-medium text-gray-700 mb-3'>{shop.shopName}</h4>
                                                        {shop.products.map((product, j) => (
                                                            <div key={j} className='flex flex-col sm:flex-row gap-4 py-3 border-t border-gray-100 first:border-0'>
                                                                <div className='flex flex-1 gap-4'>
                                                                    <img
                                                                        className='w-20 h-20 object-cover rounded border border-gray-200'
                                                                        src={product.productInfo.images[0]}
                                                                        alt={product.productInfo.name}
                                                                    />
                                                                    <div className='flex-1'>
                                                                        <h3 className='font-medium text-gray-800'>{product.productInfo.name}</h3>
                                                                        <p className='text-sm text-gray-500'>Thương hiệu: {product.productInfo.brand}</p>
                                                                        <p className='text-sm text-gray-500'>Số lượng: {product.quantity}</p>
                                                                    </div>
                                                                </div>
                                                                <div className='sm:text-right'>
                                                                    <p className='text-lg font-semibold text-orange-500'>
                                                                        {((product.productInfo.price - (product.productInfo.price * product.productInfo.discount / 100)) * 1000).toLocaleString('vi-VN')}₫
                                                                    </p>
                                                                    {product.productInfo.discount > 0 && (
                                                                        <div className='flex gap-2 items-center sm:justify-end'>
                                                                            <span className='text-sm text-gray-400 line-through'>
                                                                                {(product.productInfo.price * 1000).toLocaleString('vi-VN')}₫
                                                                            </span>
                                                                            <span className='text-xs bg-red-100 text-red-600 px-1 rounded'>
                                                                                -{product.productInfo.discount}%
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className='lg:w-1/3'>
                            <div className='bg-white p-6 rounded-lg shadow-sm sticky top-4'>
                                <h2 className='text-xl font-bold text-gray-800 mb-6'>Tóm Tắt Đơn Hàng</h2>

                                <div className='space-y-3 mb-6'>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600'>Tạm tính ({products.length} sản phẩm)</span>
                                        <span className='font-medium'>{(price * 1000).toLocaleString('vi-VN')}₫</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600'>Phí vận chuyển</span>
                                        <span className={`font-medium ${isFreeShipping ? 'text-green-600' : ''}`}>
                                            {isFreeShipping ? 'Miễn phí' : `${(shippingFee * 1000).toLocaleString('vi-VN')}₫`}
                                        </span>
                                    </div>

                                    <div className='pt-3 border-t border-gray-200'>
                                        <div className='flex justify-between text-lg font-semibold'>
                                            <span>Tổng cộng</span>
                                            <span className='text-red-600'>{(totalPayment * 1000).toLocaleString('vi-VN')}₫</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Phương thức thanh toán */}
                                <div className='mb-6'>
                                    <h3 className='text-lg font-medium text-gray-800 mb-4'>Phương thức thanh toán</h3>
                                    <div className='space-y-3'>
                                        <label className='flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50'>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="cod"
                                                checked={paymentMethod === 'cod'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className='w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500'
                                            />
                                            <div className='ml-3'>
                                                <span className='block font-medium text-gray-700'>Thanh toán khi nhận hàng (COD)</span>
                                                <span className='block text-sm text-gray-500'>Thanh toán bằng tiền mặt khi nhận hàng</span>
                                            </div>
                                        </label>

                                        <label className='flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50'>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="stripe"
                                                checked={paymentMethod === 'stripe'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className='w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500'
                                            />
                                            <div className='ml-3'>
                                                <span className='block font-medium text-gray-700'>Thanh toán qua thẻ (Stripe)</span>
                                                <span className='block text-sm text-gray-500'>Thanh toán an toàn qua thẻ Visa, Mastercard</span>
                                                <div className='flex items-center gap-2 mt-2'>
                                                    <img src="/images/payment/visa.png" alt="Visa" className='h-6' />
                                                    <img src="/images/payment/mastercard.png" alt="Mastercard" className='h-6' />
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={placeOrder}
                                    disabled={!res}
                                    className={`w-full py-3 rounded-md font-medium transition ${
                                        res ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {paymentMethod === 'cod' ? 'Đặt hàng' : 'Thanh toán ngay'}
                                </button>

                                <div className="mt-4 space-y-2">
                                    <p className='text-xs text-gray-500 text-center'>
                                        Miễn phí vận chuyển cho đơn hàng trên 500.000₫
                                    </p>
                                    <p className='text-xs text-gray-500 text-center'>
                                        Phí vận chuyển: 40.000₫ cho đơn hàng dưới 500.000₫
                                    </p>
                                    <p className='text-xs text-gray-500 text-center'>
                                        Thời gian giao hàng dự kiến: 2-4 ngày làm việc
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Shipping;