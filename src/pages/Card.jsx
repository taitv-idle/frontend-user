import React, { useEffect } from 'react';
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
import toast from 'react-hot-toast';

const Card = () => {
    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);
    const {
        card_products,
        successMessage,
        price,
        buy_product_item,
        shipping_fee,
        outofstock_products
    } = useSelector(state => state.card);
    const navigate = useNavigate();

    // Lấy danh sách sản phẩm trong giỏ hàng khi component được tải
    useEffect(() => {
        dispatch(get_card_products(userInfo.id));
    }, [dispatch, userInfo.id]);

    // Xử lý thông báo thành công
    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            dispatch(get_card_products(userInfo.id));
        }
    }, [successMessage, dispatch, userInfo.id]);

    // Điều hướng đến trang thanh toán
    const redirect = () => {
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

    // Tính tổng giá tiền bao gồm phí vận chuyển
    const totalPrice = price + shipping_fee;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            {/* Banner giới thiệu */}
            <section className='bg-[url("http://localhost:3000/images/banner/shop.png")] h-[220px] bg-cover bg-no-repeat relative bg-center'>
                <div className='absolute inset-0 bg-[#2422228a] flex items-center justify-center'>
                    <div className='text-center text-white px-4'>
                        <h2 className='text-3xl font-bold mb-2'>Giỏ Hàng Của Bạn</h2>
                        <div className='flex justify-center items-center gap-2'>
                            <Link to='/' className='hover:text-green-300 transition'>Trang chủ</Link>
                            <IoIosArrowForward className="text-sm" />
                            <span>Giỏ hàng</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Nội dung chính giỏ hàng */}
            <section className='bg-gray-50 flex-grow py-12'>
                <div className='container mx-auto px-4 max-w-7xl'>
                    {card_products.length > 0 || outofstock_products.length > 0 ? (
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
                                                <h3 className='text-md font-medium text-gray-700 mb-3'>{shop.shopName}</h3>

                                                {shop.products.map((product) => (
                                                    <div key={product._id} className='flex flex-col sm:flex-row gap-4 py-4 border-t border-gray-100 first:border-0'>
                                                        <div className='flex flex-1 gap-4'>
                                                            <img
                                                                className='w-20 h-20 object-cover rounded border border-gray-200'
                                                                src={product.productInfo.images[0]}
                                                                alt={product.productInfo.name}
                                                            />
                                                            <div className='flex-1'>
                                                                <h3 className='font-medium text-gray-800 hover:text-green-600 transition'>
                                                                    {product.productInfo.name}
                                                                </h3>
                                                                <p className='text-sm text-gray-500'>Thương hiệu: {product.productInfo.brand}</p>
                                                                <p className='text-sm text-gray-500'>Màu sắc: {product.productInfo.color}</p>
                                                            </div>
                                                        </div>

                                                        <div className='sm:w-48 flex flex-col sm:items-end gap-3'>
                                                            <div className='text-right'>
                                                                <p className='text-lg font-semibold text-orange-500'>
                                                                    {((product.productInfo.price - (product.productInfo.price * product.productInfo.discount / 100)) * 1000).toLocaleString('vi-VN')}₫
                                                                </p>
                                                                {product.productInfo.discount > 0 && (
                                                                    <div className='flex gap-2 items-center justify-end'>
                                    <span className='text-sm text-gray-400 line-through'>
                                      {(product.productInfo.price * 1000).toLocaleString('vi-VN')}₫
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
                                                                        onClick={() => dec(product.quantity, product._id)}
                                                                        className='px-3 py-1 text-gray-500 hover:bg-gray-100'
                                                                        disabled={product.quantity <= 1}
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <span className='px-3 py-1 text-center w-8'>{product.quantity}</span>
                                                                    <button
                                                                        onClick={() => inc(product.quantity, product.productInfo.stock, product._id)}
                                                                        className='px-3 py-1 text-gray-500 hover:bg-gray-100'
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                                <button
                                                                    onClick={() => dispatch(delete_card_product(product._id))}
                                                                    className='p-1 text-red-500 hover:text-red-700 transition'
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
                                                    <img
                                                        className='w-20 h-20 object-cover rounded border border-gray-200'
                                                        src={product.products[0].images[0]}
                                                        alt={product.products[0].name}
                                                    />
                                                    <div>
                                                        <h3 className='font-medium text-gray-800'>{product.products[0].name}</h3>
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
                                                <span className='font-medium'>{(price * 1000).toLocaleString('vi-VN')}₫</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='text-gray-600'>Phí vận chuyển</span>
                                                <span className='font-medium'>{(shipping_fee * 1000).toLocaleString('vi-VN')}₫</span>
                                            </div>

                                            <div className='pt-3 border-t border-gray-100'>
                                                <div className='flex justify-between text-lg font-semibold'>
                                                    <span>Tổng cộng</span>
                                                    <span className='text-green-600'>{(totalPrice * 1000).toLocaleString('vi-VN')}₫</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='mb-4'>
                                            <label htmlFor="coupon" className='block text-sm font-medium text-gray-700 mb-1'>Mã giảm giá</label>
                                            <div className='flex gap-2'>
                                                <input
                                                    id="coupon"
                                                    type="text"
                                                    placeholder='Nhập mã giảm giá'
                                                    className='flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                                                />
                                                <button className='px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition'>
                                                    Áp dụng
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

                                        <p className='text-xs text-gray-500 mt-4 text-center'>
                                            Miễn phí vận chuyển cho đơn hàng trên 500.000₫
                                        </p>
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