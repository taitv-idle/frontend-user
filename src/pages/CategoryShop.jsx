import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link, useSearchParams } from 'react-router-dom';
import { IoIosArrowForward } from "react-icons/io";
import { Range } from 'react-range';
import { AiFillStar } from 'react-icons/ai';
import { CiStar } from 'react-icons/ci';
import Products from '../components/products/Products';
import { BsFillGridFill } from 'react-icons/bs';
import { FaThList } from 'react-icons/fa';
import ShopProducts from '../components/products/ShopProducts';
import Pagination from '../components/Pagination';
import { useDispatch, useSelector } from 'react-redux';
import { price_range_product, query_products } from '../store/reducers/homeReducer';

const CategoryShop = () => {
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category');

    const dispatch = useDispatch();
    const { products, priceRange, latest_product, totalProduct, parPage } = useSelector(state => state.home);

    useEffect(() => {
        dispatch(price_range_product());
    }, [dispatch]);

    const [state, setState] = useState({ values: [priceRange.low, priceRange.high] });
    useEffect(() => {
        setState({
            values: [priceRange.low, priceRange.high]
        });
    }, [priceRange]);

    const [filter, setFilter] = useState(true);
    const [rating, setRating] = useState('');
    const [styles, setStyles] = useState('grid');
    const [pageNumber, setPageNumber] = useState(1);
    const [sortPrice, setSortPrice] = useState('');

    const queryParams = useMemo(() => ({
        low: state.values[0] || '',
        high: state.values[1] || '',
        category,
        rating,
        sortPrice,
        pageNumber
    }), [state.values, category, rating, sortPrice, pageNumber]);

    useEffect(() => {
        dispatch(query_products(queryParams));
    }, [dispatch, queryParams]);

    const resetRating = () => {
        setRating('');
        dispatch(
            query_products({
                ...queryParams,
                rating: '',
            })
        );
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />
            {/* Banner */}
            <section className="bg-gradient-to-r from-red-400 to-red-500 py-12 mb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center text-white">
                        <h2 className="text-3xl font-bold mb-2">Danh mục sản phẩm</h2>
                        <div className="flex items-center gap-2 text-lg">
                            <Link to="/" className="hover:text-red-200">Trang chủ</Link>
                            <IoIosArrowForward />
                            <span>{category}</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Filter */}
                        <div className={`lg:w-1/4 ${!filter ? 'hidden lg:block' : ''}`}>
                            <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
                                {/* Price Filter */}
                                <div>
                                    <h3 className="text-lg font-semibold text-red-600 mb-4 relative after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-red-600">Khoảng giá</h3>
                                    <div className="py-2">
                                        <Range
                                            step={100000}
                                            min={priceRange.low}
                                            max={priceRange.high}
                                            values={state.values}
                                            onChange={(values) => setState({ values })}
                                            renderTrack={({ props, children }) => (
                                                <div {...props} className="w-full h-2 bg-red-100 rounded-full cursor-pointer">{children}</div>
                                            )}
                                            renderThumb={({ props }) => (
                                                <div {...props} className="w-5 h-5 bg-red-400 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500" />
                                            )}
                                        />
                                        <div className="flex justify-between mt-4 text-sm text-gray-600">
                                            <span>{formatPrice(state.values[0])}</span>
                                            <span>{formatPrice(state.values[1])}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Rating Filter */}
                                <div>
                                    <h3 className="text-lg font-semibold text-red-600 mb-4 relative after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-red-600">Đánh giá</h3>
                                    <div className="space-y-3">
                                        {[5, 4, 3, 2, 1].map((stars) => (
                                            <div
                                                key={stars}
                                                onClick={() => setRating(stars)}
                                                className={`flex items-center gap-2 cursor-pointer ${rating === stars ? 'text-red-500' : 'text-gray-300'}`}
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
                            </div>
                        </div>
                        {/* Main Content */}
                        <div className="lg:w-3/4">
                            {/* Toolbar */}
                            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setFilter(!filter)}
                                        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                    >
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
                                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    >
                                        <option value="">Sắp xếp</option>
                                        <option value="low-to-high">Giá thấp đến cao</option>
                                        <option value="high-to-low">Giá cao đến thấp</option>
                                    </select>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setStyles('grid')}
                                            className={`p-2 rounded-md ${
                                                styles === 'grid'
                                                    ? 'bg-red-100 text-red-500'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            <BsFillGridFill />
                                        </button>
                                        <button
                                            onClick={() => setStyles('list')}
                                            className={`p-2 rounded-md ${
                                                styles === 'list'
                                                    ? 'bg-red-100 text-red-500'
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
                                <ShopProducts products={products} styles={styles} />
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

export default CategoryShop;