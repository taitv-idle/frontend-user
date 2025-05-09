import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { IoIosArrowForward } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import {
    get_card_products,
    delete_card_product,
    messageClear,
    quantity_inc,
    quantity_dec
} from '../store/reducers/cardReducer';
import { formatPrice } from '../utils/format';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';

const Card = () => {
    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);
    const {
        card_products,
        successMessage,
        price,
        buy_product_item,
        shipping_fee,
        outofstock_products,
        loading
    } = useSelector(state => state.card);
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    // Lấy danh sách sản phẩm trong giỏ hàng khi component được tải
    useEffect(() => {
        if (userInfo?.id) {
            dispatch(get_card_products(userInfo.id));
        }
    }, [dispatch, userInfo?.id]);

    // Xử lý thông báo thành công
    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            if (userInfo?.id) {
                dispatch(get_card_products(userInfo.id));
            }
        }
    }, [successMessage, dispatch, userInfo?.id]);

    // Điều hướng đến trang thanh toán
    const redirect = () => {
        if (!userInfo) {
            toast.error('Vui lòng đăng nhập để tiếp tục');
            navigate('/login');
            return;
        }
        navigate('/shipping', {
            state: {
                products: card_products,
                price: price,
                shipping_fee: shipping_fee,
                items: buy_product_item
            }
        });
    };

    // Tăng số lượng sản phẩm nếu còn hàng
    const inc = (quantity, stock, card_id) => {
        const temp = quantity + 1;
        if (temp <= stock) {
            dispatch(quantity_inc(card_id));
        } else {
            toast.error('Đã đạt số lượng tối đa có sẵn');
        }
    };

    // Giảm số lượng sản phẩm (tối thiểu 1)
    const dec = (quantity, card_id) => {
        const temp = quantity - 1;
        if (temp !== 0) {
            dispatch(quantity_dec(card_id));
        }
    };

    // Xử lý áp dụng mã giảm giá
    const handleApplyCoupon = () => {
        if (!couponCode.trim()) {
            toast.error('Vui lòng nhập mã giảm giá');
            return;
        }
        setApplyingCoupon(true);
        // TODO: Implement coupon logic
        setTimeout(() => {
            toast.error('Mã giảm giá không hợp lệ');
            setApplyingCoupon(false);
        }, 1000);
    };

    // Tính tổng giá tiền bao gồm phí vận chuyển
    const totalPrice = price + (price >= 500000 ? 0 : 40000);
    const freeShipping = price >= 500000;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            {/* Banner giới thiệu */}
            <section className='bg-gradient-to-r from-red-500 to-red-600 h-[220px] relative'>
                <div className='absolute inset-0 bg-black/20'></div>
                <div className='container mx-auto px-4 h-full flex items-center justify-center'>
                    <div className='text-center text-white relative z-10'>
                        <h2 className='text-3xl font-bold mb-3'>Giỏ Hàng Của Bạn</h2>
                        <div className='flex justify-center items-center gap-2'>
                            <Link to='/' className='hover:text-red-200 transition'>Trang chủ</Link>
                            <IoIosArrowForward className="text-sm" />
                            <span>Giỏ hàng</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Nội dung chính giỏ hàng */}
            <section className='bg-gray-50 flex-grow py-12'>
                <div className='container mx-auto px-4 max-w-7xl'>
                    {loading ? (
                        <div className="flex justify-center items-center min-h-[400px]">
                            <ClipLoader color="#22c55e" size={40} />
                        </div>
                    ) : card_products.length > 0 || outofstock_products.length > 0 ? (
                        <div className='flex flex-col lg:flex-row gap-8'>
                            {/* Danh sách sản phẩm */}
                            <div className='lg:w-2/3'>
                                {/* Sản phẩm còn hàng */}
                                {card_products.length > 0 && (
                                    <div className='bg-white rounded-lg shadow-sm mb-6 overflow-hidden'>
                                        <div className='p-4 border-b border-gray-100'>
                                            <h2 className='text-lg font-semibold text-green-600'>
                                                Sản phẩm còn hàng ({card_products.length})
                                            </h2>
                                        </div>

                                        {card_products.map((shop) => (
                                            <div key={shop.shopId} className='p-4 border-b border-gray-100 last:border-0'>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <h3 className='text-md font-medium text-gray-700'>{shop.shopName}</h3>
                                                    <Link 
                                                        to={`/dashboard/chat/${shop.shopId}`}
                                                        className="text-sm text-blue-600 hover:text-blue-700"
                                                    >
                                                        Chat với người bán
                                                    </Link>
                                                </div>

                                                {shop.products.map((product) => (
                                                    <div key={product._id} className='flex flex-col sm:flex-row gap-4 py-4 border-t border-gray-100 first:border-0'>
                                                        <div className='flex flex-1 gap-4'>
                                                            <Link 
                                                                to={`/product/details/${product.productInfo.slug}`}
                                                                className="w-20 h-20 flex-shrink-0"
                                                            >
                                                                <img
                                                                    className='w-full h-full object-cover rounded border border-gray-200 hover:opacity-90 transition'
                                                                    src={product.productInfo.images[0]}
                                                                    alt={product.productInfo.name}
                                                                />
                                                            </Link>
                                                            <div className='flex-1'>
                                                                <Link 
                                                                    to={`/product/details/${product.productInfo.slug}`}
                                                                    className='font-medium text-gray-800 hover:text-green-600 transition block mb-1'
                                                                >
                                                                    {product.productInfo.name}
                                                                </Link>
                                                                <p className='text-sm text-gray-500'>Thương hiệu: {product.productInfo.brand}</p>
                                                                <p className='text-sm text-gray-500'>Màu sắc: {product.productInfo.color}</p>
                                                                <p className='text-sm text-gray-500 mt-1'>
                                                                    Còn lại: <span className="text-green-600">{product.productInfo.stock}</span> sản phẩm
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className='sm:w-48 flex flex-col sm:items-end gap-3'>
                                                            <div className='text-right'>
                                                                <p className='text-lg font-semibold text-orange-500'>
                                                                    {formatPrice(product.productInfo.price - (product.productInfo.price * product.productInfo.discount / 100))}
                                                                </p>
                                                                {product.productInfo.discount > 0 && (
                                                                    <div className='flex gap-2 items-center justify-end'>
                                                                        <span className='text-sm text-gray-400 line-through'>
                                                                            {formatPrice(product.productInfo.price)}
                                                                        </span>
                                                                        <span className='text-xs bg-red-100 text-red-600 px-1 rounded'>
                                                                            -{product.productInfo.discount}%
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className='flex items-center gap-4'>
                                                                <div className='flex items-center border border-gray-200 rounded'>
                                                                    <button
                                                                        onClick={() => dec(product.quantity, product.productInfo.stock, product._id)}
                                                                        className='px-3 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                                                                        disabled={product.quantity <= 1}
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <span className='px-3 py-1 text-center w-8'>{product.quantity}</span>
                                                                    <button
                                                                        onClick={() => inc(product.quantity, product.productInfo.stock, product._id)}
                                                                        className='px-3 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                                                                        disabled={product.quantity >= product.productInfo.stock}
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                                <button
                                                                    onClick={() => dispatch(delete_card_product(product._id))}
                                                                    className='p-1 text-red-500 hover:text-red-700 transition'
                                                                    title="Xóa sản phẩm"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Sản phẩm hết hàng */}
                                {outofstock_products.length > 0 && (
                                    <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                                        <div className='p-4 border-b border-gray-100'>
                                            <h2 className='text-lg font-semibold text-red-500'>
                                                Hết hàng ({outofstock_products.length})
                                            </h2>
                                        </div>

                                        {outofstock_products.map((product) => (
                                            <div key={product._id} className='p-4 border-b border-gray-100 last:border-0 flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
                                                <div className='flex flex-1 gap-4'>
                                                    <Link 
                                                        to={`/product/details/${product.products[0].slug}`}
                                                        className="w-20 h-20 flex-shrink-0"
                                                    >
                                                        <img
                                                            className='w-full h-full object-cover rounded border border-gray-200 hover:opacity-90 transition'
                                                            src={product.products[0].images[0]}
                                                            alt={product.products[0].name}
                                                        />
                                                    </Link>
                                                    <div>
                                                        <Link 
                                                            to={`/product/details/${product.products[0].slug}`}
                                                            className='font-medium text-gray-800 hover:text-green-600 transition block mb-1'
                                                        >
                                                            {product.products[0].name}
                                                        </Link>
                                                        <p className='text-sm text-gray-500'>Thương hiệu: {product.products[0].brand}</p>
                                                        <p className='text-sm text-red-500'>Hiện không có sẵn</p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => dispatch(delete_card_product(product._id))}
                                                    className='px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded transition'
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Tóm tắt đơn hàng */}
                            <div className='lg:w-1/3'>
                                {card_products.length > 0 && (
                                    <div className='bg-white rounded-lg shadow-sm p-6 sticky top-4'>
                                        <h2 className='text-xl font-bold text-gray-800 mb-4'>Tóm Tắt Đơn Hàng</h2>

                                        <div className='space-y-3 mb-6'>
                                            <div className='flex justify-between'>
                                                <span className='text-gray-600'>Tạm tính ({buy_product_item} sản phẩm)</span>
                                                <span className='font-medium'>{formatPrice(price)}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='text-gray-600'>Phí vận chuyển</span>
                                                <span className={`font-medium ${freeShipping ? 'text-green-600' : ''}`}>
                                                    {freeShipping ? 'Miễn phí' : formatPrice(40000)}
                                                </span>
                                            </div>

                                            <div className='pt-3 border-t border-gray-100'>
                                                <div className='flex justify-between text-lg font-semibold'>
                                                    <span>Tổng cộng</span>
                                                    <span className='text-green-600'>{formatPrice(totalPrice)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='mb-4'>
                                            <label htmlFor="coupon" className='block text-sm font-medium text-gray-700 mb-1'>Mã giảm giá</label>
                                            <div className='flex gap-2'>
                                                <input
                                                    id="coupon"
                                                    type="text"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value)}
                                                    placeholder='Nhập mã giảm giá'
                                                    className='flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                                                />
                                                <button 
                                                    onClick={handleApplyCoupon}
                                                    disabled={applyingCoupon}
                                                    className='px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                                                >
                                                    {applyingCoupon ? (
                                                        <>
                                                            <ClipLoader color="#ffffff" size={16} />
                                                            <span>Đang áp dụng...</span>
                                                        </>
                                                    ) : 'Áp dụng'}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={redirect}
                                            className='w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded shadow-md transition flex items-center justify-center gap-2'
                                        >
                                            Tiến hành thanh toán
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
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
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className='bg-white rounded-lg shadow-sm p-8 text-center'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className='text-xl font-medium text-gray-700 mb-2'>Giỏ hàng của bạn đang trống</h3>
                            <p className='text-gray-500 mb-6'>Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng</p>
                            <Link
                                to='/shops'
                                className='inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition'
                            >
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Card;