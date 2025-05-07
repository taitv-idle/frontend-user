import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Rating from '../components/Rating';
import Reviews from '../components/Reviews';
import SectionProducts from '../components/products/SectionProducts';
import { product_details } from '../store/reducers/homeReducer';
import { add_to_card, add_to_wishlist, messageClear } from '../store/reducers/cardReducer';
import { FaHeart, FaFacebookF, FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';
import { AiOutlineEye } from 'react-icons/ai';
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

  useEffect(() => {
    if (product && product._id) {
      let viewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
      viewed = viewed.filter(p => p._id !== product._id);
      viewed.unshift({
        _id: product._id,
        name: product.name,
        slug: product.slug,
        images: product.images,
        price: product.price,
        discount: product.discount,
        rating: product.rating,
      });
      if (viewed.length > 8) viewed = viewed.slice(0, 8);
      localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
    }
  }, [product]);

  if (!product && !errorMessage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          {errorMessage || 'Không tìm thấy sản phẩm'}
        </h2>
        <Link to="/" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(price);
  const salePrice = product.discount ? product.price - Math.floor(product.price * product.discount / 100) : product.price;

  const inc = () => { if (quantity < product.stock) setQuantity(q => q + 1); };
  const dec = () => { if (quantity > 1) setQuantity(q => q - 1); };
  const addCard = () => {
    if (userInfo) {
      dispatch(add_to_card({ userId: userInfo.id, quantity, productId: product._id }));
    } else navigate('/login');
  };
  const addWishlist = () => {
    if (userInfo) {
      dispatch(add_to_wishlist({ userId: userInfo.id, productId: product._id, name: product.name, price: product.price, image: product.images[0], discount: product.discount, rating: product.rating, slug: product.slug }));
    } else navigate('/login');
  };
  const buyNow = () => {
    if (!userInfo) return navigate('/login');
    // implement buy now flow
    addCard();
    navigate('/shipping');
  };

  return (
    <div className="bg-gray-50">
      <Header />

      {/* Hero / Breadcrumb */}
      <section className="bg-gradient-to-r from-emerald-500 to-emerald-600 py-6 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold text-white relative after:absolute after:bottom-0 after:left-0 after:w-20 after:h-1 after:bg-white">
            {product.name}
          </h1>
          <nav className="text-white text-sm mt-2 md:mt-0">
            <Link to="/" className="hover:text-emerald-200">Trang chủ</Link> /{' '}
            <Link to={`/products?category=${product.category}`} className="hover:text-emerald-200">{product.category}</Link> /{' '}
            <span>{product.name}</span>
          </nav>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Gallery */}
        <div>
          <div className="rounded-lg overflow-hidden shadow-lg mb-4">
            <img src={activeImage || product.images[0]} alt={product.name} className="w-full h-auto object-cover" loading="lazy" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img, idx) => (
              <button key={idx} onClick={() => setActiveImage(img)} className="border-2 border-transparent hover:border-emerald-500 rounded overflow-hidden focus:outline-none">
                <img src={img} alt={`${product.name} ${idx}`} className="w-full h-20 object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-start space-y-6">
          <div className="flex items-center space-x-4">
            <Rating ratings={product.rating} size="medium" />
            <span className="text-sm text-gray-600">({product.totalReview || 0} đánh giá)</span>
          </div>
          <div className="space-x-3">
            {product.discount > 0 && <span className="text-gray-400 line-through">{formatPrice(product.price)}</span>}
            <span className="text-3xl font-semibold text-emerald-600">{formatPrice(salePrice)}</span>
            {product.discount > 0 && <span className="inline-block px-2 py-1 bg-red-500 text-white text-xs rounded">-{product.discount}%</span>}
          </div>
          <p className="text-gray-700 leading-relaxed">{product.description}</p>
          <div className="flex items-center space-x-4">
            <button onClick={dec} className="w-10 h-10 bg-gray-200 rounded hover:bg-gray-300">-</button>
            <span className="w-8 text-center">{quantity}</span>
            <button onClick={inc} className="w-10 h-10 bg-gray-200 rounded hover:bg-gray-300">+</button>
          </div>
          <div className="flex space-x-4">
            <button onClick={addCard} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-md hover:from-emerald-600 hover:to-emerald-700 transition-colors">Thêm vào giỏ</button>
            <button onClick={buyNow} className="flex-1 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors">Mua ngay</button>
          </div>
          <div className="flex space-x-3 mt-4 text-gray-600">
            <button onClick={addWishlist} aria-label="Wishlist" className="p-2"><FaHeart className="text-red-500" size={32} /></button>
            <span className="p-2"><AiOutlineEye className="text-red-500" size={34} /></span>
            <button aria-label="Share Facebook"><FaFacebookF /></button>
            <button aria-label="Share Twitter"><FaTwitter /></button>
            <button aria-label="Share LinkedIn"><FaLinkedin /></button>
            <button aria-label="Share GitHub"><FaGithub /></button>
          </div>
        </div>
      </div>

      {/* Tabs: Description & Reviews */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex border-b border-gray-200">
          <button onClick={() => setTab('description')} className={`py-3 px-6 ${tab === 'description' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-600'}`}>Mô tả</button>
          <button onClick={() => setTab('reviews')} className={`py-3 px-6 ${tab === 'reviews' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-600'}`}>Đánh giá ({product.totalReview || 0})</button>
        </div>
        <div className="mt-6">
          {tab === 'description' ? <p className="prose max-w-none text-gray-700">{product.description}</p> : <Reviews product={product} />}
        </div>
      </div>

      {/* Related Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 relative after:absolute after:bottom-0 after:left-0 after:w-24 after:h-1 after:bg-emerald-600">Sản phẩm liên quan</h2>
        <SectionProducts title="" products={relatedProducts} />
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetail; 