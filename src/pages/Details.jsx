import React, { useEffect, useState, useRef, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { IoIosArrowForward } from "react-icons/io"; 
import { FaHeart, FaFacebookF, FaTwitter, FaLinkedin } from "react-icons/fa";
import { RiShoppingCartLine } from "react-icons/ri";
import { FiShare2, FiMessageSquare, FiCopy, } from "react-icons/fi";
import Rating from '../components/Rating';
import Reviews from '../components/Reviews';
import { useDispatch, useSelector } from 'react-redux';
import { product_details } from '../store/reducers/homeReducer';
import { add_to_card, messageClear, add_to_wishlist } from '../store/reducers/cardReducer';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
 
const Details = () => {
    const navigate = useNavigate();
    const { slug } = useParams();
    const dispatch = useDispatch();
    const { product, relatedProducts, errorMessage } = useSelector(state => state.home);
    const { userInfo } = useSelector(state => state.auth);
    const { errorMessage: cardError, successMessage } = useSelector(state => state.card);

    const [image, setImage] = useState('');
    const [state, setState] = useState('reviews');
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const shareMenuRef = useRef(null);
    const [showZoom, setShowZoom] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const imageContainerRef = useRef(null);
    const zoomContainerRef = useRef(null);
    const requestRef = useRef();

    useEffect(() => {
        dispatch(product_details(slug));
    }, [slug, dispatch]);

    useEffect(() => { 
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());  
        } 
        if (cardError) {
            toast.error(cardError);
            dispatch(messageClear());  
        } 
    }, [successMessage, cardError, dispatch]);

    const inc = () => {
        if (quantity >= product?.stock) {
            toast.error('Sản phẩm đã hết hàng');
        } else {
            setQuantity(quantity + 1);
        }
    }

    const dec = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    }

    const add_card = async () => {
        if (!userInfo) {
            toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
            navigate('/login');
            return;
        }
        setIsLoading(true);
        try {
            await dispatch(add_to_card({
                userId: userInfo.id,
                quantity,
                productId: product._id
            }));
        } finally {
            setIsLoading(false);
        }
    }

    const add_wishlist = async () => {
        if (!userInfo) {
            toast.error('Vui lòng đăng nhập để thêm vào yêu thích');
            navigate('/login');
            return;
        }
        setIsLoading(true);
        try {
            await dispatch(add_to_wishlist({
                userId: userInfo.id,
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.images[0],
                discount: product.discount,
                rating: product.rating,
                slug: product.slug
            }));
        } finally {
            setIsLoading(false);
        }
    }

   const buynow = () => {
        if (!userInfo) {
            toast.error('Vui lòng đăng nhập để mua hàng');
            navigate('/login');
            return;
        }

        let price = product.discount !== 0 
            ? product.price - Math.floor((product.price * product.discount) / 100)
            : product.price;

        const obj = [{
                sellerId: product.sellerId,
                shopName: product.shopName,
            price: quantity * (price - Math.floor((price * 5) / 100)),
            products: [{
                        quantity,
                        productInfo: product
            }]
        }];

        navigate('/shipping', {
            state: {
                products: obj,
                price: price * quantity,
                shipping_fee: 50,
                items: 1
            }
        }); 
   }

    // Add share functionality
    const handleShare = async (platform) => {
        const productUrl = window.location.href;
        const shareText = `Xem sản phẩm ${product.name} tại ${productUrl}`;

        switch (platform) {
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`, '_blank');
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`, '_blank');
                break;
            case 'copy':
                await navigator.clipboard.writeText(productUrl);
                toast.success('Đã sao chép link sản phẩm');
                break;
            default:
                console.warn('Platform không được hỗ trợ:', platform);
                break;
        }
        setShowShareMenu(false);
    };

    // Close share menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
                setShowShareMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Add quick actions for related products
    const handleQuickAddToCart = async (product) => {
        if (!userInfo) {
            toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
            navigate('/login');
            return;
        }
        setIsLoading(true);
        try {
            await dispatch(add_to_card({
                userId: userInfo.id,
                quantity: 1,
                productId: product._id
            }));
            toast.success('Đã thêm vào giỏ hàng');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAddToWishlist = async (product) => {
        if (!userInfo) {
            toast.error('Vui lòng đăng nhập để thêm vào yêu thích');
            navigate('/login');
            return;
        }
        setIsLoading(true);
        try {
            await dispatch(add_to_wishlist({
                userId: userInfo.id,
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.images[0],
                discount: product.discount,
                rating: product.rating,
                slug: product.slug
            }));
            toast.success('Đã thêm vào yêu thích');
        } finally {
            setIsLoading(false);
        }
    };

    // Sử dụng useCallback để tối ưu hàm xử lý di chuyển chuột
    const handleMouseMove = useCallback((e) => {
        if (!imageContainerRef.current) return;

        const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
        const x = Math.min(Math.max(((e.clientX - left) / width) * 100, 0), 100);
        const y = Math.min(Math.max(((e.clientY - top) / height) * 100, 0), 100);
        
        // Sử dụng requestAnimationFrame để tối ưu hiệu suất
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
        
        requestRef.current = requestAnimationFrame(() => {
            setZoomPosition({ x, y });
        });
    }, []);

    // Cleanup khi component unmount
    useEffect(() => {
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, []);

    if (!product && !errorMessage) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <ClipLoader color="#ef4444" size={40} />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-bold text-red-500 mb-4">
                    {errorMessage || "Không tìm thấy sản phẩm"}
                </h2>
                <Link
                    to="/"
                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    Quay về trang chủ
                </Link>
                            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            {/* Breadcrumb */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center text-sm text-gray-600">
                        <Link to="/" className="hover:text-red-500">Trang chủ</Link>
                        <IoIosArrowForward className="mx-2" />
                        <Link to="/" className="hover:text-red-500">{product.category}</Link>
                        <IoIosArrowForward className="mx-2" />
                        <span className="text-gray-800">{product.name}</span>
                    </div>
                </div>
          </div> 

            {/* Product Details */}
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Product Images */}
                        <div className="space-y-3">
                            <div className="flex gap-4">
                                {/* Main Image Container */}
                                <div 
                                    ref={imageContainerRef}
                                    className="relative flex-1 aspect-square rounded-lg overflow-hidden bg-gray-100"
                                    onMouseEnter={() => setShowZoom(true)}
                                    onMouseLeave={() => setShowZoom(false)}
                                    onMouseMove={handleMouseMove}
                                >
                                    <img
                                        src={image || product.images?.[0]}
                                        alt={product.name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/images/default-product.png';
                                        }}
                                    />
           </div> 

                                {/* Zoom Container */}
                                <div 
                                    ref={zoomContainerRef}
                                    className={`hidden lg:block w-[400px] h-[400px] rounded-lg overflow-hidden border border-gray-200 transition-opacity duration-200 ${
                                        showZoom ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                    }`}
                                >
                                    <div 
                                        className="w-full h-full transform-gpu"
                                        style={{
                                            backgroundImage: `url(${image || product.images?.[0]})`,
                                            backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                            backgroundSize: '200%',
                                            backgroundRepeat: 'no-repeat',
                                            willChange: 'background-position'
                                        }}
                                    />
        </div>
                    </div>
                    
                            {/* Thumbnails */}
                            <Swiper
                                modules={[Pagination, Navigation]}
                                spaceBetween={8}
                                slidesPerView={5}
                                navigation
                                className="product-thumbs"
                            >
                                {product.images?.map((img, i) => (
                                    <SwiperSlide key={i}>
                                        <div
                                            onClick={() => setImage(img)}
                                            className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                                                (image || product.images?.[0]) === img 
                                                    ? 'ring-2 ring-red-500' 
                                                    : 'hover:ring-2 hover:ring-gray-300'
                                            }`}
                                        >
                                            <div className="w-full h-full flex items-center justify-center">
                                                <img
                                                    src={img}
                                                    alt={`${product.name} - ${i + 1}`}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/images/default-product.png';
                                                    }}
                                                />
                    </div> 
                </div> 
                                    </SwiperSlide>
                                ))}
                            </Swiper>
            </div>  

                        {/* Product Info */}
                        <div className="space-y-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                <div className="flex items-center gap-3">
                                    <Rating ratings={product.rating} />
                                    <span className="text-sm text-gray-500">({product.rating || 0} sao)</span>
                                </div>
          </div>

                            <div className="flex items-center gap-3">
                                <div className="text-2xl font-bold text-red-500">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                        product.discount !== 0
                                            ? product.price - Math.floor((product.price * product.discount) / 100)
                                            : product.price
                                    )}
                                </div>
                                {product.discount !== 0 && (
                                    <>
                                        <div className="text-lg text-gray-400 line-through">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                        </div>
                                        <div className="bg-red-500 text-white px-2 py-0.5 rounded-full text-sm">
                                            -{product.discount}%
                                        </div>
                                    </>
                                )}
            </div>

                            <div className="border-t border-b py-3">
                                <p className="text-sm text-gray-800 font-medium mt-2">
                                    Cửa hàng: <span className="text-red-500">{product.shopName}</span>
                                </p>
             </div>   

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600">Số lượng:</span>
                                    <div className="flex items-center border rounded-lg">
                                        <button
                                            onClick={dec}
                                            className="px-3 py-1.5 text-gray-600 hover:bg-gray-100"
                                        >
                                            -
                                        </button>
                                        <span className="px-3 py-1.5 border-x">{quantity}</span>
                                        <button
                                            onClick={inc}
                                            className="px-3 py-1.5 text-gray-600 hover:bg-gray-100"
                                        >
                                            +
                                        </button>
            </div> 
                                    <span className="text-sm text-gray-500">
                                        {product.stock} sản phẩm có sẵn
                                    </span>
       </div> 

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={add_card}
                                        disabled={isLoading || !product.stock}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <ClipLoader color="#ffffff" size={16} />
                                        ) : (
                                            <>
                                                <RiShoppingCartLine size={18} />
                                                Thêm vào giỏ
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={buynow}
                                        disabled={isLoading || !product.stock}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Mua ngay
                                    </button>
                                    <button
                                        onClick={add_wishlist}
                                        disabled={isLoading}
                                        className="p-2 border border-gray-300 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FaHeart size={18} />
                                    </button>
                    </div>

                                <div className="flex items-center gap-3 pt-3">
                                    <Link
                                        to={`/dashboard/chat/${product.sellerId}`}
                                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500"
                                    >
                                        <FiMessageSquare size={16} />
                                        Chat với người bán
                                    </Link>
                                    <div className="relative" ref={shareMenuRef}>
                                        <button
                                            onClick={() => setShowShareMenu(!showShareMenu)}
                                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500"
                                        >
                                            <FiShare2 size={16} />
                                            Chia sẻ
                                        </button>
                                        {showShareMenu && (
                                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 z-50">
                                                <button
                                                    onClick={() => handleShare('facebook')}
                                                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <FaFacebookF className="text-blue-600" />
                                                    Facebook
                                                </button>
                                                <button
                                                    onClick={() => handleShare('twitter')}
                                                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <FaTwitter className="text-blue-400" />
                                                    Twitter
                                                </button>
                                                <button
                                                    onClick={() => handleShare('linkedin')}
                                                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <FaLinkedin className="text-blue-700" />
                                                    LinkedIn
                                                </button>
                                                <button
                                                    onClick={() => handleShare('copy')}
                                                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <FiCopy size={14} />
                                                    Sao chép link
                                                </button>
                                            </div>
                                        )}
    </div> 
         </div> 
         </div>
            </div>
                </div>
            </div>
            
                {/* Tabs */}
                <div className="mt-8 bg-white rounded-xl shadow-sm">
                    <div className="border-b">
                        <div className="flex">
                            <button
                                onClick={() => setState('reviews')}
                                className={`px-6 py-4 font-medium ${
                                    state === 'reviews'
                                        ? 'text-red-500 border-b-2 border-red-500'
                                        : 'text-gray-600 hover:text-red-500'
                                }`}
                            >
                                Đánh giá sản phẩm
                            </button>
                            <button
                                onClick={() => setState('description')}
                                className={`px-6 py-4 font-medium ${
                                    state === 'description'
                                        ? 'text-red-500 border-b-2 border-red-500'
                                        : 'text-gray-600 hover:text-red-500'
                                }`}
                            >
                                Mô tả chi tiết
                            </button>
    </div>
</div>
                    <div className="p-6">
                        {state === 'reviews' ? (
                            <Reviews product={product} />
                        ) : (
                            <div className="prose max-w-none">
                                <div 
                                    className="product-description"
                                    dangerouslySetInnerHTML={{ __html: product.description }} 
                                />
                                <style jsx>{`
                                    .product-description img {
                                        max-width: 100%;
                                        height: auto;
                                        margin: 1rem 0;
                                        border-radius: 0.5rem;
                                    }
                                    .product-description p {
                                        margin-bottom: 1rem;
                                    }
                                    .product-description h1, 
                                    .product-description h2, 
                                    .product-description h3, 
                                    .product-description h4, 
                                    .product-description h5, 
                                    .product-description h6 {
                                        margin-top: 1.5rem;
                                        margin-bottom: 1rem;
                                        font-weight: 600;
                                    }
                                    .product-description ul, 
                                    .product-description ol {
                                        margin: 1rem 0;
                                        padding-left: 1.5rem;
                                    }
                                    .product-description li {
                                        margin: 0.5rem 0;
                                    }
                                    .product-description blockquote {
                                        border-left: 4px solid #e5e7eb;
                                        padding-left: 1rem;
                                        margin: 1rem 0;
                                        font-style: italic;
                                    }
                                    .product-description table {
                                        width: 100%;
                                        border-collapse: collapse;
                                        margin: 1rem 0;
                                    }
                                    .product-description th,
                                    .product-description td {
                                        border: 1px solid #e5e7eb;
                                        padding: 0.5rem;
                                    }
                                    .product-description th {
                                        background-color: #f9fafb;
                                    }
                                `}</style>
                            </div> 
                        )}
    </div>  
        </div>

                {/* Related Products */}
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
    <Swiper
                        modules={[Pagination, Navigation]}
                        spaceBetween={20}
                        slidesPerView={1}
                        pagination={{ clickable: true }}
                        navigation
    breakpoints={{
                            640: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            1024: { slidesPerView: 4 }
                        }}
                        className="related-products"
                    >
                        {relatedProducts.map((p, i) => (
                            <SwiperSlide key={i}>
                                <Link to={`/product/details/${p.slug}`} className="block">
                                    <div className="bg-white rounded-xl shadow-sm overflow-hidden group">
                                        <div className="relative aspect-square">
                                            <img
                                                src={p.images[0]}
                                                alt={p.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {p.discount !== 0 && (
                                                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                    -{p.discount}%
                                                </div>
                                            )}
                                            {/* Quick action buttons */}
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleQuickAddToCart(p);
                                                    }}
                                                    className="p-2 bg-white rounded-full text-gray-700 hover:bg-red-500 hover:text-white transition-colors"
                                                    title="Thêm vào giỏ"
                                                >
                                                    <RiShoppingCartLine size={20} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleQuickAddToWishlist(p);
                                                    }}
                                                    className="p-2 bg-white rounded-full text-gray-700 hover:bg-red-500 hover:text-white transition-colors"
                                                    title="Thêm vào yêu thích"
                                                >
                                                    <FaHeart size={20} />
                                                </button>
                    </div>
                           </div>
                                        <div className="p-4">
                                            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                                                {p.name}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-lg font-bold text-red-500">
                                                        {new Intl.NumberFormat('vi-VN', {
                                                            style: 'currency',
                                                            currency: 'VND'
                                                        }).format(
                                                            p.discount !== 0
                                                                ? p.price - Math.floor((p.price * p.discount) / 100)
                                                                : p.price
                                                        )}
                                                    </div>
                                                    {p.discount !== 0 && (
                                                        <div className="text-sm text-gray-400 line-through">
                                                            {new Intl.NumberFormat('vi-VN', {
                                                                style: 'currency',
                                                                currency: 'VND'
                                                            }).format(p.price)}
            </div>
                                                    )}
                </div>
                                                <Rating ratings={p.rating} />
                </div>
            </div>
            </div>
                    </Link>
                </SwiperSlide>
                        ))}
    </Swiper>
</div>
        </div>

            <Footer />
        </div>
    );
};

export default Details;