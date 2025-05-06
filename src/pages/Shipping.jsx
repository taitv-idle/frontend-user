import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { place_order } from '../store/reducers/orderReducer';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const Shipping = () => {
    const { state: { products, price, shipping_fee, items } } = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo } = useSelector(state => state.auth);

    const [res, setRes] = useState(false);
    const [loading, setLoading] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [state, setState] = useState({
        name: userInfo.name || '',
        address: '',
        phone: '',
        post: '',
        province: '',
        provinceCode: '',
        city: '',
        cityCode: '',
        area: '',
        areaCode: ''
    });

    // Lấy danh sách tỉnh/thành phố từ API
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                setLoading(true);
                const response = await axios.get('https://provinces.open-api.vn/api/p/');
                setProvinces(response.data);
            } catch (error) {
                toast.error('Lỗi khi tải danh sách tỉnh/thành phố');
                console.error('Error fetching provinces:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProvinces();
    }, []);

    // Lấy danh sách quận/huyện khi tỉnh/thành phố thay đổi
    useEffect(() => {
        const fetchDistricts = async () => {
            if (!state.provinceCode) return;

            try {
                setLoading(true);
                const response = await axios.get(`https://provinces.open-api.vn/api/p/${state.provinceCode}?depth=2`);
                setDistricts(response.data.districts);
                setWards([]); // Reset phường/xã khi thay đổi quận/huyện
                setState(prev => ({ ...prev, city: '', cityCode: '', area: '', areaCode: '' }));
            } catch (error) {
                toast.error('Lỗi khi tải danh sách quận/huyện');
                console.error('Error fetching districts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDistricts();
    }, [state.provinceCode]);

    // Lấy danh sách phường/xã khi quận/huyện thay đổi
    useEffect(() => {
        const fetchWards = async () => {
            if (!state.cityCode) return;

            try {
                setLoading(true);
                const response = await axios.get(`https://provinces.open-api.vn/api/d/${state.cityCode}?depth=2`);
                setWards(response.data.wards);
                setState(prev => ({ ...prev, area: '', areaCode: '' }));
            } catch (error) {
                toast.error('Lỗi khi tải danh sách phường/xã');
                console.error('Error fetching wards:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWards();
    }, [state.cityCode]);

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

    const save = (e) => {
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

        setRes(true);
    };

    const placeOrder = () => {
        dispatch(place_order({
            price,
            products,
            shipping_fee,
            items,
            shippingInfo: state,
            userId: userInfo.id,
            navigate
        }));
    };

    const totalPayment = price + shipping_fee;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            {/* Banner */}
            <section className='bg-[url("http://localhost:3000/images/banner/shop.png")] h-[220px] bg-cover bg-no-repeat relative bg-center'>
                <div className='absolute inset-0 bg-[#2422228a] flex items-center justify-center'>
                    <div className='text-center text-white px-4'>
                        <h2 className='text-3xl font-bold mb-2'>Thông Tin Giao Hàng</h2>
                        <div className='flex justify-center items-center gap-2'>
                            <Link to='/' className='hover:text-green-300 transition'>Trang chủ</Link>
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
                                    <form onSubmit={save} className='space-y-4'>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                            <div>
                                                <label htmlFor="name" className='block text-sm font-medium text-gray-700 mb-1'>Họ và tên*</label>
                                                <input
                                                    onChange={inputHandle}
                                                    value={state.name}
                                                    type="text"
                                                    className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                                                    name="name"
                                                    id="name"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="phone" className='block text-sm font-medium text-gray-700 mb-1'>Số điện thoại*</label>
                                                <input
                                                    onChange={inputHandle}
                                                    value={state.phone}
                                                    type="tel"
                                                    className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                                                    name="phone"
                                                    id="phone"
                                                    placeholder="09xxxxxxx hoặc 03xxxxxxx"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="address" className='block text-sm font-medium text-gray-700 mb-1'>Địa chỉ cụ thể*</label>
                                            <input
                                                onChange={inputHandle}
                                                value={state.address}
                                                type="text"
                                                className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
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
                                                    className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                                                    name="province"
                                                    id="province"
                                                    required
                                                    disabled={loading || provinces.length === 0}
                                                >
                                                    <option value="">Chọn tỉnh/thành phố</option>
                                                    {provinces.map((province) => (
                                                        <option key={province.code} value={province.code}>
                                                            {province.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="city" className='block text-sm font-medium text-gray-700 mb-1'>Quận/Huyện*</label>
                                                <select
                                                    onChange={handleDistrictChange}
                                                    value={state.cityCode}
                                                    className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                                                    name="city"
                                                    id="city"
                                                    required
                                                    disabled={loading || !state.provinceCode || districts.length === 0}
                                                >
                                                    <option value="">Chọn quận/huyện</option>
                                                    {districts.map((district) => (
                                                        <option key={district.code} value={district.code}>
                                                            {district.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="area" className='block text-sm font-medium text-gray-700 mb-1'>Phường/Xã*</label>
                                                <select
                                                    onChange={handleWardChange}
                                                    value={state.areaCode}
                                                    className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                                                    name="area"
                                                    id="area"
                                                    required
                                                    disabled={loading || !state.cityCode || wards.length === 0}
                                                >
                                                    <option value="">Chọn phường/xã</option>
                                                    {wards.map((ward) => (
                                                        <option key={ward.code} value={ward.code}>
                                                            {ward.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="post" className='block text-sm font-medium text-gray-700 mb-1'>Mã bưu điện (nếu có)</label>
                                            <input
                                                onChange={inputHandle}
                                                value={state.post}
                                                type="text"
                                                className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                                                name="post"
                                                id="post"
                                            />
                                        </div>

                                        <div className='flex justify-end'>
                                            <button
                                                type="submit"
                                                className='px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition disabled:bg-gray-300 disabled:cursor-not-allowed'
                                                disabled={loading}
                                            >
                                                {loading ? 'Đang tải...' : 'Xác nhận địa chỉ'}
                                            </button>
                                        </div>
                                    </form>
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
                                        <span className='text-gray-600'>Tạm tính ({items} sản phẩm)</span>
                                        <span className='font-medium'>{(price * 1000).toLocaleString('vi-VN')}₫</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600'>Phí vận chuyển</span>
                                        <span className='font-medium'>{(shipping_fee * 1000).toLocaleString('vi-VN')}₫</span>
                                    </div>

                                    <div className='pt-3 border-t border-gray-200'>
                                        <div className='flex justify-between text-lg font-semibold'>
                                            <span>Tổng cộng</span>
                                            <span className='text-green-600'>{(totalPayment * 1000).toLocaleString('vi-VN')}₫</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={placeOrder}
                                    disabled={!res}
                                    className={`w-full py-3 rounded-md font-medium transition ${
                                        res ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    Đặt hàng
                                </button>

                                <p className='text-xs text-gray-500 mt-4 text-center'>
                                    Bằng cách đặt hàng, bạn đồng ý với Điều khoản dịch vụ của chúng tôi
                                </p>
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