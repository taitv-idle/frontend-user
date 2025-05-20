import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Rating from '../components/Rating';
import Reviews from '../components/Reviews';
import { product_details } from '../store/reducers/homeReducer';
import { add_to_card, add_to_wishlist, messageClear } from '../store/reducers/cardReducer';
import { FaFacebookF, FaTwitter, FaLinkedin, FaGithub, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';
import { AiOutlineEye, AiOutlineShoppingCart, AiOutlineHeart } from 'react-icons/ai';
import { formatPriceWithDiscount, formatPrice } from '../utils/format';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, relatedProducts, errorMessage } = useSelector(state => state.home);
  const { userInfo } = useSelector(state => state.auth);
  const { errorMessage: cardError, successMessage } = useSelector(state => state.card);

  const [activeImage, setActiveImage] = useState('');
  const [tab, setTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const imageRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  
  // Xử lý dữ liệu màu sắc và kích thước
  const [processedColors, setProcessedColors] = useState([]);
  const [processedSizes, setProcessedSizes] = useState([]);

  useEffect(() => {
    dispatch(product_details(slug));
  }, [dispatch, slug]);

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

  // Chỉ giữ một useEffect để xử lý dữ liệu sản phẩm
  useEffect(() => {
    if (product) {
      // Hàm xử lý đơn giản để trích xuất dữ liệu từ chuỗi phức tạp
      const parseNestedData = (input) => {
        // Nếu không có dữ liệu, trả về mảng rỗng
        if (!input) return [];
        
        // Kiểm tra nếu input là mảng đơn giản (như tags: ['áo'])
        if (Array.isArray(input) && !input.some(item => typeof item === 'object')) {
          console.log("Input is a simple array:", input);
          return input;
        }
        
        try {
          // Nếu là mảng với 1 phần tử (trường hợp từ API)
          if (Array.isArray(input) && input.length === 1) {
            const rawStr = input[0];
            
            // Nếu là chuỗi JSON, thử parse
            if (typeof rawStr === 'string') {
              try {
                // Thử parse chuỗi JSON
                const parsed = JSON.parse(rawStr.replace(/\\/g, ''));
                if (Array.isArray(parsed)) {
                  return parsed;
                }
              } catch (e) {
                // Nếu không parse được, thử cách khác
                console.log("First parse failed:", e);
              }
              
              // Xử lý thủ công
              return rawStr
                .replace(/\[|\]/g, '')  // Loại bỏ [ ]
                .replace(/\\"/g, '')    // Loại bỏ \"
                .replace(/"/g, '')      // Loại bỏ "
                .split(',')             // Tách theo dấu phẩy
                .map(s => s.trim())     // Loại bỏ khoảng trắng
                .filter(s => s);        // Loại bỏ chuỗi rỗng
            }
          }
          
          // Trường hợp là chuỗi đơn
          if (typeof input === 'string') {
            return input
              .replace(/\[|\]/g, '')
              .replace(/\\"/g, '')
              .replace(/"/g, '')
              .split(',')
              .map(s => s.trim())
              .filter(s => s);
          }
          
          // Trường hợp là mảng thông thường
          if (Array.isArray(input)) {
            return input;
          }
        } catch (e) {
          console.error("Error parsing data:", e);
        }
        
        return [];
      };
      
      // Xử lý màu sắc
      try {
        const colors = parseNestedData(product.color);
        console.log("Extracted colors:", colors);
        setProcessedColors(colors);
      } catch (e) {
        console.error("Error processing colors:", e);
        setProcessedColors([]);
      }
      
      // Xử lý kích thước
      try {
        const sizes = parseNestedData(product.size);
        console.log("Extracted sizes:", sizes);
        setProcessedSizes(sizes);
      } catch (e) {
        console.error("Error processing sizes:", e);
        setProcessedSizes([]);
      }

      // Khởi tạo cửa hàng đã xem gần đây
      let viewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
      viewed = viewed.filter(p => p._id !== product._id);
      viewed.unshift({
        _id: product._id,
        name: product.name,
        slug: product.slug,
        images: product.images || [],
        price: product.price,
        discount: product.discount,
        rating: product.rating,
      });
      if (viewed.length > 8) viewed = viewed.slice(0, 8);
      localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
    }
  }, [product]);

  // Xóa các useEffect thừa và chỉ giữ những cái cần thiết
  useEffect(() => {
    if (processedColors.length > 0 && !selectedColor) {
      setSelectedColor(processedColors[0]);
    }
  }, [processedColors, selectedColor]);

  useEffect(() => {
    if (processedSizes.length > 0 && !selectedSize) {
      setSelectedSize(processedSizes[0]);
    }
  }, [processedSizes, selectedSize]);

  const handleZoom = (e) => {
    if (!isZoomed) return;
    
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    
    imageRef.current.style.transformOrigin = `${x * 100}% ${y * 100}%`;
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
    setZoomLevel(isZoomed ? 1 : 2);
  };

  if (!product && !errorMessage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          {errorMessage || 'Không tìm thấy sản phẩm'}
        </h2>
        <Link to="/" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  const { price, discountedPrice } = formatPriceWithDiscount(product.price, product.discount);

  const inc = () => { if (quantity < product.stock) setQuantity(q => q + 1); };
  const dec = () => { if (quantity > 1) setQuantity(q => q - 1); };
  const addCard = () => {
    if (userInfo) {
      if (processedColors.length > 0 && !selectedColor) {
        toast.error('Vui lòng chọn màu sắc');
        return;
      }
      
      if (processedSizes.length > 0 && !selectedSize) {
        toast.error('Vui lòng chọn kích thước');
        return;
      }
      
      dispatch(add_to_card({ 
        userId: userInfo.id, 
        quantity, 
        productId: product._id,
        color: selectedColor,
        size: selectedSize
      }));
    } else navigate('/login');
  };
  
  const addWishlist = () => {
    if (userInfo) {
      dispatch(add_to_wishlist({ 
        userId: userInfo.id, 
        productId: product._id, 
        name: product.name, 
        price: product.price, 
        image: product.images?.[0] || '', 
        discount: product.discount, 
        rating: product.rating, 
        slug: product.slug 
      }));
    } else navigate('/login');
  };
  
  const buyNow = () => {
    if (!userInfo) return navigate('/login');
    
    if (processedColors.length > 0 && !selectedColor) {
      toast.error('Vui lòng chọn màu sắc');
      return;
    }
    
    if (processedSizes.length > 0 && !selectedSize) {
      toast.error('Vui lòng chọn kích thước');
      return;
    }
    
    addCard();
    navigate('/shipping');
  };

  return (
    <div className="bg-gray-50">
      <Header />
      
      {/* Hero / Breadcrumb */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-800 py-6 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold text-white relative after:absolute after:bottom-0 after:left-0 after:w-20 after:h-1 after:bg-white">
            {product.name}
          </h1>
          <nav className="text-white text-sm mt-2 md:mt-0">
            <Link to="/" className="hover:text-indigo-200">Trang chủ</Link> /{' '}
            <Link to={`/products?category=${product.category}`} className="hover:text-indigo-200">{product.category}</Link> /{' '}
            <span>{product.name}</span>
          </nav>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Gallery */}
        <div className="relative">
          <div 
            className="rounded-lg overflow-hidden shadow-lg mb-4 cursor-zoom-in"
            onMouseMove={handleZoom}
            onClick={toggleZoom}
          >
            <img 
              ref={imageRef}
              src={activeImage || (product.images?.[0] || '')} 
              alt={product.name} 
              className="w-full h-auto object-cover transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
              loading="lazy" 
            />
            <button 
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                toggleZoom();
              }}
            >
              {isZoomed ? <FaSearchMinus /> : <FaSearchPlus />}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(product.images || []).map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => {
                  setActiveImage(img);
                  setIsZoomed(false);
                  setZoomLevel(1);
                }} 
                className={`border-2 rounded overflow-hidden focus:outline-none transition-all duration-200 ${
                  activeImage === img ? 'border-indigo-500' : 'border-transparent hover:border-indigo-300'
                }`}
              >
                <img 
                  src={img} 
                  alt={`${product.name} ${idx}`} 
                  className="w-full h-20 object-cover" 
                />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-start space-y-6">
          <div className="flex items-center space-x-4">
            <Rating ratings={product.rating} size="medium" />
            <span className="text-sm text-gray-600">({product.rating || 0} sao)</span>
          </div>
          <div className="space-x-3">
            {product.discount > 0 && <span className="text-gray-400 line-through">{price}</span>}
            <span className="text-3xl font-semibold text-indigo-600">{discountedPrice}</span>
            {product.discount > 0 && <span className="inline-block px-2 py-1 bg-red-500 text-white text-xs rounded">-{product.discount}%</span>}
          </div>
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <h2 className='text-2xl font-bold text-gray-800'>{product.name}</h2>
              {product.discount > 0 && (
                <span className='px-2 py-1 bg-red-100 text-red-600 text-sm rounded-full'>
                  -{product.discount}%
                </span>
              )}
            </div>

            <div className='flex items-center gap-2'>
              <div className='flex items-center'>
                <span className='text-2xl font-bold text-orange-500'>
                  {formatPrice(product.price - (product.price * product.discount / 100))}
                </span>
                {product.discount > 0 && (
                  <span className='ml-2 text-gray-400 line-through'>
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="font-medium text-gray-700">Tình trạng:</span>
                {product.stock > 0 ? (
                  <span className="text-green-500">Còn hàng ({product.stock})</span>
                ) : (
                  <span className="text-red-500">Hết hàng</span>
                )}
                <span className="mx-2">|</span>
                <span className="font-medium text-gray-700">Đã bán:</span>
                <span>{product.sold || 0}</span>
              </div>
              <p className='text-gray-600 line-clamp-2'>
                {product?.description 
                  ? (product.description.length > 200 
                      ? `${product.description.substring(0, 200)}...` 
                      : product.description)
                  : 'Chưa có mô tả sản phẩm'}
              </p>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm border-t border-gray-100 pt-2 mt-2'>
                <div className='flex items-center gap-2'>
                  <span className="font-medium text-gray-700">Thương hiệu:</span>
                  <span className="text-gray-600">{product.brand || 'Không có'}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className="font-medium text-gray-700">Còn lại:</span>
                  <span className="text-gray-600">{product.stock} sản phẩm</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className="font-medium text-gray-700">Cửa hàng:</span>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <Link 
                      to={`/shop/${product.sellerId}`} 
                      className="text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
                    >
                      {product.shopName}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Màu sắc */}
          {processedColors.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-indigo-500 rounded-full"></span>
                Màu sắc
              </h3>
              <div className="flex flex-wrap gap-2">
                {processedColors.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`px-3 py-1 rounded-full border text-sm ${
                      selectedColor === c 
                        ? 'border-indigo-500 text-indigo-500 bg-indigo-50' 
                        : 'border-gray-300 text-gray-700 hover:border-indigo-300'
                    }`}
                    onClick={() => setSelectedColor(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Kích thước */}
          {processedSizes.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-indigo-500 rounded-full"></span>
                Kích thước
              </h3>
              <div className="flex flex-wrap gap-2">
                {processedSizes.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`px-3 py-1 rounded-full border text-sm ${
                      selectedSize === s 
                        ? 'border-indigo-500 text-indigo-500 bg-indigo-50' 
                        : 'border-gray-300 text-gray-700 hover:border-indigo-300'
                    }`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <button onClick={dec} className="w-10 h-10 bg-gray-200 rounded hover:bg-gray-300">-</button>
            <span className="w-8 text-center">{quantity}</span>
            <button onClick={inc} className="w-10 h-10 bg-gray-200 rounded hover:bg-gray-300">+</button>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={addCard} 
              className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-md hover:from-indigo-700 hover:to-indigo-800 transition-colors flex items-center justify-center space-x-2"
            >
              <AiOutlineShoppingCart size={20} />
              <span>Thêm vào giỏ</span>
            </button>
            <button 
              onClick={buyNow} 
              className="flex-1 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
            >
              Mua ngay
            </button>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <button 
              onClick={addWishlist} 
              aria-label="Wishlist" 
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <AiOutlineHeart size={20} />
              <span>Yêu thích</span>
            </button>
            <Link 
              to={`/dashboard/chat/${product.shopId}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
            >
              <AiOutlineEye size={20} />
              <span>Chat với người bán</span>
            </Link>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-gray-600">Chia sẻ:</span>
              <div className="flex gap-2">
                <button aria-label="Share Facebook" className="p-1 hover:text-blue-600 transition-colors"><FaFacebookF /></button>
                <button aria-label="Share Twitter" className="p-1 hover:text-blue-400 transition-colors"><FaTwitter /></button>
                <button aria-label="Share LinkedIn" className="p-1 hover:text-blue-700 transition-colors"><FaLinkedin /></button>
                <button aria-label="Share GitHub" className="p-1 hover:text-gray-800 transition-colors"><FaGithub /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description & Reviews */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex border-b border-gray-200">
          <button 
            onClick={() => setTab('description')} 
            className={`py-3 px-6 ${tab === 'description' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-600'}`}
          >
            Mô tả
          </button>
          <button 
            onClick={() => setTab('reviews')} 
            className={`py-3 px-6 ${tab === 'reviews' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-600'}`}
          >
            Đánh giá
          </button>
        </div>
        <div className="mt-6">
          {tab === 'description' ? (
            <div className="prose max-w-none text-gray-700 bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-100">Chi tiết sản phẩm</h3>
              
              <div className="text-base leading-relaxed">
                {product.description && (
                  <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
                )}
              </div>
              {product.specifications && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h4 className="text-lg font-semibold mb-3">Thông số kỹ thuật</h4>
                  <ul className="list-disc pl-5 space-y-2 text-base">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <li key={key} className="leading-relaxed">
                        <span className="font-medium">{key}:</span> {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Reviews product={product} />
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 relative after:absolute after:bottom-0 after:left-0 after:w-24 after:h-1 after:bg-indigo-600">
          Sản phẩm liên quan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(relatedProducts || []).map((product) => {
            const { price, discountedPrice, discount } = formatPriceWithDiscount(product.price, product.discount);
            
            return (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <Link to={`/product-details/${product.slug}`}>
                  <img 
                    src={product.images?.[0] || ''} 
                    alt={product.name} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-600 font-semibold">
                        {discountedPrice}
                      </span>
                      {discount > 0 && (
                        <span className="text-sm text-gray-500 line-through">
                          {price}
                        </span>
                      )}
                    </div>
                    
                    {/* Tên cửa hàng */}
                    {product.shopName && (
                      <div className="mt-2 text-xs text-gray-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {product.shopName}
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetail; 