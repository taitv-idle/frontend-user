import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { IoIosArrowForward } from "react-icons/io";
import { Range } from 'react-range';
import { AiFillStar } from 'react-icons/ai'
import { CiStar } from 'react-icons/ci'
import Products from '../components/products/Products';
import { BsFillGridFill } from 'react-icons/bs'
import { FaThList } from 'react-icons/fa'
import ShopProducts from '../components/products/ShopProducts';
import Pagination from '../components/Pagination';
import { useDispatch, useSelector } from 'react-redux';
import { price_range_product, query_products } from '../store/reducers/homeReducer';

const Shops = () => {
    const dispatch = useDispatch()
    const { products, categorys, priceRange, latest_product, totalProduct, parPage } = useSelector(state => state.home)

    useEffect(() => {
        dispatch(price_range_product())
    }, [dispatch])

    useEffect(() => {
        setState({
            values: [priceRange.low, priceRange.high]
        })
    }, [priceRange])

    const [filter, setFilter] = useState(true)
    const [state, setState] = useState({ values: [priceRange.low, priceRange.high] })
    const [rating, setRating] = useState('')
    const [styles, setStyles] = useState('grid')
    const [pageNumber, setPageNumber] = useState(1)
    const [sortPrice, setSortPrice] = useState('')
    const [category, setCategory] = useState('')

    const queryCategory = (e, value) => {
        if (e.target.checked) {
            setCategory(value)
        } else {
            setCategory('')
        }
    }

    const fetchProducts = useCallback(() => {
        dispatch(
            query_products({
                low: state.values[0],
                high: state.values[1],
                category,
                rating,
                sortPrice,
                pageNumber
            })
        )
    }, [dispatch, state.values, category, rating, sortPrice, pageNumber])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    const resetRating = useCallback(() => {
        setRating('')
        dispatch(
            query_products({
                low: state.values[0],
                high: state.values[1],
                category,
                rating: '',
                sortPrice,
                pageNumber
            })
        )
    }, [dispatch, state.values, category, sortPrice, pageNumber])

    return (
        <div className="bg-gray-50">
            <Header />
            <section className='bg-[url("http://localhost:3000/images/banner/shop.png")] h-[220px] mt-6 bg-cover bg-no-repeat relative bg-left'>
                <div className='absolute left-0 top-0 w-full h-full bg-[#2422228a]'>
                    <div className='w-[85%] md:w-[80%] sm:w-[90%] lg:w-[90%] h-full mx-auto'>
                        <div className='flex flex-col justify-center gap-1 items-center h-full w-full text-white'>
                            <h2 className='text-3xl font-bold'>Cửa Hàng</h2>
                            <div className='flex justify-center items-center gap-2 text-2xl w-full'>
                                <Link to='/'>Trang chủ</Link>
                                <span className='pt-1'>
                                    <IoIosArrowForward />
                                </span>
                                <span>Cửa hàng</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className='py-16'>
                <div className='w-[85%] md:w-[80%] sm:w-[90%] lg:w-[90%] h-full mx-auto'>
                    <div className={`md:block hidden ${!filter ? 'mb-6' : 'mb-0'}`}>
                        <button
                            onClick={() => setFilter(!filter)}
                            className='text-center w-full py-2 px-3 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors rounded-md'
                        >
                            {filter ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                        </button>
                    </div>

                    <div className='w-full flex flex-wrap'>
                        <div className={`w-3/12 md-lg:w-4/12 md:w-full pr-8 ${filter ? 'md:h-0 md:overflow-hidden md:mb-6' : 'md:h-auto md:overflow-auto md:mb-0'}`}>
                            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                                <h2 className='text-xl font-bold mb-3 text-gray-800'>Danh mục sản phẩm</h2>
                                <div className='py-2 space-y-2'>
                                    {categorys.map((c, i) => (
                                        <div key={i} className='flex items-center gap-2 py-1'>
                                            <input
                                                checked={category === c.name}
                                                onChange={(e) => queryCategory(e, c.name)}
                                                type="checkbox"
                                                id={c.name}
                                                className="text-emerald-600 rounded border-gray-300"
                                            />
                                            <label className='text-gray-600 block cursor-pointer hover:text-emerald-600 transition-colors' htmlFor={c.name}>
                                                {c.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                                <h2 className='text-xl font-bold mb-3 text-gray-800'>Lọc theo giá</h2>
                                <div className='py-2 flex flex-col gap-5'>
                                    <Range
                                        step={5}
                                        min={priceRange.low}
                                        max={priceRange.high}
                                        values={(state.values)}
                                        onChange={(values) => setState({ values })}
                                        renderTrack={({ props, children }) => (
                                            <div {...props} className='w-full h-[6px] bg-gray-200 rounded-full cursor-pointer'>
                                                {children}
                                            </div>
                                        )}
                                        renderThumb={({ props }) => (
                                            <div className='w-[15px] h-[15px] bg-emerald-600 rounded-full' {...props} />
                                        )}
                                    />
                                    <div className="flex justify-between items-center">
                                        <span className='text-gray-800 font-medium'>
                                            {Math.floor(state.values[0]).toLocaleString()}đ
                                        </span>
                                        <span className='text-gray-800 font-medium'>
                                            {Math.floor(state.values[1]).toLocaleString()}đ
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                                <h2 className='text-xl font-bold mb-3 text-gray-800'>Đánh giá</h2>
                                <div className='flex flex-col gap-3'>
                                    <div
                                        onClick={() => setRating(5)}
                                        className={`flex items-center gap-1 text-xl cursor-pointer ${rating === 5 ? 'text-amber-400' : 'text-gray-300'}`}
                                    >
                                        {[...Array(5)].map((_, i) => <AiFillStar key={i} />)}
                                        <span className="text-sm ml-2 text-gray-600">5 sao</span>
                                    </div>

                                    <div
                                        onClick={() => setRating(4)}
                                        className={`flex items-center gap-1 text-xl cursor-pointer ${rating === 4 ? 'text-amber-400' : 'text-gray-300'}`}
                                    >
                                        {[...Array(4)].map((_, i) => <AiFillStar key={i} />)}
                                        <CiStar />
                                        <span className="text-sm ml-2 text-gray-600">4 sao trở lên</span>
                                    </div>

                                    <div
                                        onClick={() => setRating(3)}
                                        className={`flex items-center gap-1 text-xl cursor-pointer ${rating === 3 ? 'text-amber-400' : 'text-gray-300'}`}
                                    >
                                        {[...Array(3)].map((_, i) => <AiFillStar key={i} />)}
                                        {[...Array(2)].map((_, i) => <CiStar key={i} />)}
                                        <span className="text-sm ml-2 text-gray-600">3 sao trở lên</span>
                                    </div>

                                    <div
                                        onClick={() => setRating(2)}
                                        className={`flex items-center gap-1 text-xl cursor-pointer ${rating === 2 ? 'text-amber-400' : 'text-gray-300'}`}
                                    >
                                        {[...Array(2)].map((_, i) => <AiFillStar key={i} />)}
                                        {[...Array(3)].map((_, i) => <CiStar key={i} />)}
                                        <span className="text-sm ml-2 text-gray-600">2 sao trở lên</span>
                                    </div>

                                    <div
                                        onClick={() => setRating(1)}
                                        className={`flex items-center gap-1 text-xl cursor-pointer ${rating === 1 ? 'text-amber-400' : 'text-gray-300'}`}
                                    >
                                        <AiFillStar />
                                        {[...Array(4)].map((_, i) => <CiStar key={i} />)}
                                        <span className="text-sm ml-2 text-gray-600">1 sao trở lên</span>
                                    </div>

                                    <div
                                        onClick={resetRating}
                                        className={`flex items-center gap-1 text-xl cursor-pointer ${!rating ? 'text-gray-600' : 'text-gray-300'}`}
                                    >
                                        <span className="text-sm">Tất cả đánh giá</span>
                                    </div>
                                </div>
                            </div>

                            <div className='py-5 flex flex-col gap-4 md:hidden'>
                                <Products title='Sản phẩm mới nhất' products={latest_product} />
                            </div>
                        </div>

                        <div className='w-9/12 md-lg:w-8/12 md:w-full'>
                            <div className='pl-8 md:pl-0'>
                                <div className='py-4 bg-white mb-6 px-4 rounded-lg shadow-sm flex justify-between items-center border border-gray-100'>
                                    <h2 className='text-lg font-medium text-gray-700'>
                                        Hiển thị {totalProduct} sản phẩm
                                    </h2>
                                    <div className='flex items-center gap-4'>
                                        <select
                                            onChange={(e) => setSortPrice(e.target.value)}
                                            className='p-2 border border-gray-300 outline-0 text-gray-600 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                                            value={sortPrice}
                                        >
                                            <option value="">Sắp xếp</option>
                                            <option value="low-to-high">Giá thấp đến cao</option>
                                            <option value="high-to-low">Giá cao đến thấp</option>
                                        </select>
                                        <div className='flex items-center gap-2 md-lg:hidden'>
                                            <button
                                                onClick={() => setStyles('grid')}
                                                className={`p-2 rounded-md ${styles === 'grid' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            >
                                                <BsFillGridFill />
                                            </button>
                                            <button
                                                onClick={() => setStyles('list')}
                                                className={`p-2 rounded-md ${styles === 'list' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            >
                                                <FaThList />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className='pb-8'>
                                    <ShopProducts products={products} styles={styles} />
                                </div>

                                <div>
                                    {totalProduct > parPage && (
                                        <Pagination
                                            pageNumber={pageNumber}
                                            setPageNumber={setPageNumber}
                                            totalItem={totalProduct}
                                            parPage={parPage}
                                            showItem={Math.floor(totalProduct / parPage)}
                                        />
                                    )}
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

export default Shops;