import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { IoIosArrowForward } from "react-icons/io";
import { Range } from 'react-range';
import { AiFillStar } from 'react-icons/ai';
import { CiStar } from 'react-icons/ci';
import { BsFillGridFill, BsFilter } from 'react-icons/bs';
import { FaThList } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ShopProducts from '../components/products/ShopProducts';
import Pagination from '../components/Pagination';
import { price_range_product, query_products } from '../store/reducers/homeReducer';
import Products from '../components/products/Products';
import RecentlyViewed from '../components/products/RecentlyViewed';

const Shops = () => {
    const dispatch = useDispatch();
    const { products, categorys, priceRange, latest_product, totalProduct, parPage } = useSelector(state => state.home);

    // States
    const [filter, setFilter] = useState(true);
    const [priceRangeState, setPriceRangeState] = useState({ values: [priceRange.low, priceRange.high] });
    const [rating, setRating] = useState('');
    const [viewStyle, setViewStyle] = useState('grid');
    const [pageNumber, setPageNumber] = useState(1);
    const [sortPrice, setSortPrice] = useState('');
    const [category, setCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch price range on mount
    useEffect(() => {
        dispatch(price_range_product());
    }, [dispatch]);

    // Update price range state when priceRange changes
    useEffect(() => {
        setPriceRangeState({
            values: [priceRange.low, priceRange.high]
        });
    }, [priceRange]);

    // Format price to VND
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(price);
    };

    // Handle category selection
    const handleCategoryChange = (e, value) => {
        setCategory(e.target.checked ? value : '');
    };

    // Fetch products with filters
    const fetchProducts = useCallback(() => {
        dispatch(
            query_products({
                low: priceRangeState.values[0],
                high: priceRangeState.values[1],
                category,
                rating,
                sortPrice,
                pageNumber,
                searchValue: searchQuery
            })
        );
    }, [dispatch, priceRangeState.values, category, rating, sortPrice, pageNumber, searchQuery]);

    // Fetch products when filters change
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Reset rating filter
    const resetRating = useCallback(() => {
        setRating('');
        dispatch(
            query_products({
                low: priceRangeState.values[0],
                high: priceRangeState.values[1],
                category,
                rating: '',
                sortPrice,
                pageNumber
            })
        );
    }, [dispatch, priceRangeState.values, category, sortPrice, pageNumber]);

    return (
        <div className="bg-gray-50">
            <Header />

            {/* Hero Banner */}
            <section className="bg-gradient-to-r from-red-400 to-red-500 py-12 mb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-white mb-4">Cửa Hàng</h1>
                        <nav className="flex justify-center items-center text-white text-sm">
                            <Link to="/" className="hover:text-emerald-200">Trang chủ</Link>
                            <IoIosArrowForward className="mx-2" />
                            <span>Cửa hàng</span>
                        </nav>
                    </div>
                </div>
            </section>

            {/* Search Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button
                        onClick={fetchProducts}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-red-400 to-red-500 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
                    >
                        Tìm kiếm
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Filters Sidebar */}
                        <div className={`lg:w-1/4 ${!filter ? 'hidden lg:block' : ''}`}>
                            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                                {/* Categories */}
                                <div>
                                    <h3 className="text-lg font-semibold text-red-600 mb-4 relative after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-red-600">
                                        Danh mục
                                    </h3>
                                    <div className="space-y-2">
                                        {categorys.map((cat, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id={cat.name}
                                                    checked={category === cat.name}
                                                    onChange={(e) => handleCategoryChange(e, cat.name)}
                                                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <label htmlFor={cat.name} className="text-gray-600 hover:text-red-600 cursor-pointer">
                                                    {cat.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <h3 className="text-lg font-semibold text-red-600 mb-4 relative after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-red-600">
                                        Khoảng giá
                                    </h3>
                                    <div className="py-4">
                                        <Range
                                            step={100000}
                                            min={priceRange.low}
                                            max={priceRange.high}
                                            values={priceRangeState.values}
                                            onChange={(values) => setPriceRangeState({ values })}
                                            renderTrack={({ props, children }) => (
                                                <div
                                                    {...props}
                                                    className="w-full h-2 bg-gray-200 rounded-full"
                                                >
                                                    {children}
                                                </div>
                                            )}
                                            renderThumb={({ props }) => (
                                                <div
                                                    {...props}
                                                    className="w-5 h-5 bg-red-600 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                                                />
                                            )}
                                        />
                                        <div className="flex justify-between mt-4 text-sm text-gray-600">
                                            <span>{formatPrice(priceRangeState.values[0])}</span>
                                            <span>{formatPrice(priceRangeState.values[1])}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Rating Filter */}
                                <div>
                                    <h3 className="text-lg font-semibold text-red-600 mb-4 relative after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-red-600">
                                        Đánh giá
                                    </h3>
                                    <div className="space-y-3">
                                        {[5, 4, 3, 2, 1].map((stars) => (
                                            <div
                                                key={stars}
                                                onClick={() => setRating(stars)}
                                                className={`flex items-center gap-2 cursor-pointer ${
                                                    rating === stars ? 'text-red-500' : 'text-gray-300'
                                                }`}
                                            >
                                                {[...Array(stars)].map((_, i) => (
                                                    <AiFillStar key={i} />
                                                ))}
                                                {[...Array(5 - stars)].map((_, i) => (
                                                    <CiStar key={i} />
                                                ))}
                                                <span className="text-sm text-gray-600 ml-2">
                                                    {stars} sao {stars === 5 ? '' : 'trở lên'}
                                                </span>
                                            </div>
                                        ))}
                                        <button
                                            onClick={resetRating}
                                            className="text-sm text-gray-600 hover:text-red-600"
                                        >
                                            Xóa bộ lọc
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Latest Products */}
                            <div className="mt-8">
                                <Products title="Sản phẩm mới nhất" products={latest_product} />
                                <RecentlyViewed />
                            </div>
                            
                        </div>

                        {/* Products Grid */}
                        <div className="lg:w-3/4">
                            {/* Toolbar */}
                            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setFilter(!filter)}
                                        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                                    >
                                        <BsFilter />
                                        {filter ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                                    </button>
                                    <span className="text-gray-600">
                                        Hiển thị {totalProduct} sản phẩm
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <select
                                        value={sortPrice}
                                        onChange={(e) => setSortPrice(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="">Sắp xếp</option>
                                        <option value="low-to-high">Giá thấp đến cao</option>
                                        <option value="high-to-low">Giá cao đến thấp</option>
                                    </select>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setViewStyle('grid')}
                                            className={`p-2 rounded-md ${
                                                viewStyle === 'grid'
                                                    ? 'bg-emerald-100 text-emerald-600'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            <BsFillGridFill />
                                        </button>
                                        <button
                                            onClick={() => setViewStyle('list')}
                                            className={`p-2 rounded-md ${
                                                viewStyle === 'list'
                                                    ? 'bg-emerald-100 text-emerald-600'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            <FaThList />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Products */}
                            <div className="mb-8">
                                <ShopProducts products={products} styles={viewStyle} />
                            </div>

                            {/* Pagination */}
                            {totalProduct > parPage && (
                                <div className="flex justify-center">
                                    <Pagination
                                        pageNumber={pageNumber}
                                        setPageNumber={setPageNumber}
                                        totalItem={totalProduct}
                                        parPage={parPage}
                                        showItem={Math.floor(totalProduct / parPage)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Shops;