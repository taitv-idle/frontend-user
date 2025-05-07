import React, { useEffect, useState } from 'react';
import { MdEmail, MdSearch } from "react-icons/md";
import { IoMdPhonePortrait, IoMdArrowDropdown } from "react-icons/io";
import {
    FaFacebookF,
    FaUser,
    FaLock,
    FaList,
    FaPhoneAlt,
    FaYoutube,
    FaInstagram
} from "react-icons/fa";
import { FaHeart, FaCartShopping } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_card_products, get_wishlist_products } from '../store/reducers/cardReducer';

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { categorys } = useSelector(state => state.home);
    const { userInfo } = useSelector(state => state.auth);
    const { card_product_count, wishlist_count } = useSelector(state => state.card);
    const { pathname } = useLocation();

    const [showSidebar, setShowSidebar] = useState(true);
    const [categoryShow, setCategoryShow] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const [category, setCategory] = useState('');

    const search = () => {
        navigate(`/products/search?category=${category}&&value=${searchValue}`);
    }

    const redirect_card_page = () => {
        if (userInfo) {
            navigate('/card');
        } else {
            navigate('/login');
        }
    }

    useEffect(() => {
        if (userInfo) {
            dispatch(get_card_products(userInfo.id));
            dispatch(get_wishlist_products(userInfo.id));
        }
    }, [userInfo, dispatch]);

    return (
        <div className='w-full bg-white shadow-sm'>
            {/* Phần đầu trang */}
            <div className='bg-gradient-to-r from-pink-50 to-rose-50 md-lg:hidden'>
                <div className='w-[85%] lg:w-[90%] mx-auto'>
                    <div className='flex w-full justify-between items-center h-[42px] text-gray-600'>
                        <ul className='flex justify-start items-center gap-6 text-sm'>
                            <li className='flex relative justify-center items-center gap-2 after:absolute after:h-[14px] after:w-[1px] after:bg-gray-300 after:-right-[12px]'>
                                <MdEmail className="text-rose-600" />
                                <span>hotro@thoitrang.com</span>
                            </li>

                            <li className='flex justify-center items-center gap-2'>
                                <IoMdPhonePortrait className="text-rose-600" />
                                <span>1900 1234</span>
                            </li>
                        </ul>

                        <div className='flex justify-center items-center gap-6'>
                            <div className='flex justify-center items-center gap-4'>
                                <a href="https://www.facebook.com/dev.tvtai" className="text-blue-600 hover:text-blue-800 transition-colors"><FaFacebookF /></a>
                                <a href="https://www.facebook.com/dev.tvtai" className="text-pink-600 hover:text-pink-700 transition-colors"><FaInstagram /></a>
                                <a href="https://www.facebook.com/dev.tvtai" className="text-red-600 hover:text-red-700 transition-colors"><FaYoutube /></a>
                            </div>

                            <div className='flex group cursor-pointer text-gray-700 text-sm justify-center items-center gap-1 relative mx-4'>
                                <img src="http://localhost:3000/images/language.png" alt="" className="w-5 h-5" />
                                <span><IoMdArrowDropdown /></span>
                                <ul className='absolute invisible transition-all top-12 rounded-md duration-200 text-gray-800 p-2 w-[100px] flex flex-col gap-2 group-hover:visible group-hover:top-6 group-hover:bg-white group-hover:shadow-md z-10'>
                                    <li className="hover:text-rose-600 transition-colors">Tiếng Việt</li>
                                    <li className="hover:text-rose-600 transition-colors">English</li>
                                </ul>
                            </div>

                            {userInfo ? (
                                <Link className='flex cursor-pointer justify-center items-center gap-2 text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors' to='/dashboard'>
                                    <FaUser className="text-rose-600" />
                                    <span>{userInfo.name}</span>
                                </Link>
                            ) : (
                                <Link to='/login' className='flex cursor-pointer justify-center items-center gap-2 text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors'>
                                    <FaLock className="text-rose-600" />
                                    <span>Đăng nhập</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Phần chính */}
            <div className='bg-white border-b'>
                <div className='w-[85%] lg:w-[90%] mx-auto'>
                    <div className='h-[70px] md-lg:h-[80px] flex justify-between items-center flex-wrap'>
                        <div className='md-lg:w-full w-3/12 md-lg:pt-4'>
                            <div className='flex justify-between items-center'>
                                <Link to='/' className="flex items-center">
                                    <img src="http://localhost:3000/images/logo.png" alt="Logo" className="h-12" />
                                </Link>
                                <div
                                    className='justify-center items-center w-[36px] h-[36px] bg-gray-100 text-gray-600 rounded-md cursor-pointer lg:hidden md-lg:flex xl:hidden hidden hover:bg-rose-50 transition-colors'
                                    onClick={() => setShowSidebar(false)}
                                >
                                    <FaList className="mx-auto" />
                                </div>
                            </div>
                        </div>

                        <div className='md-lg:w-full w-9/12'>
                            <div className='flex justify-between md-lg:justify-center items-center flex-wrap pl-8'>
                                <ul className='flex justify-start items-start gap-8 text-sm font-medium md-lg:hidden'>
                                    <li>
                                        <Link to='/' className={`p-2 block transition-colors ${pathname === '/' ? 'text-rose-600 font-semibold' : 'text-gray-700 hover:text-rose-600'}`}>
                                            Trang chủ
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to='/shops' className={`p-2 block transition-colors ${pathname === '/shops' ? 'text-rose-600 font-semibold' : 'text-gray-700 hover:text-rose-600'}`}>
                                            Cửa hàng
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className={`p-2 block transition-colors ${pathname === '/blog' ? 'text-rose-600 font-semibold' : 'text-gray-700 hover:text-rose-600'}`}>
                                            Blog
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className={`p-2 block transition-colors ${pathname === '/about' ? 'text-rose-600 font-semibold' : 'text-gray-700 hover:text-rose-600'}`}>
                                            Về chúng tôi
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className={`p-2 block transition-colors ${pathname === '/contact' ? 'text-rose-600 font-semibold' : 'text-gray-700 hover:text-rose-600'}`}>
                                            Liên hệ
                                        </Link>
                                    </li>
                                </ul>

                                <div className='flex md-lg:hidden justify-center items-center gap-5'>
                                    <div className='flex justify-center gap-4'>
                                        <div
                                            onClick={() => navigate(userInfo ? '/dashboard/my-wishlist' : '/login')}
                                            className='relative flex justify-center items-center cursor-pointer w-[40px] h-[40px] rounded-full bg-gray-100 hover:bg-rose-50 transition-colors'
                                        >
                                            <span className='text-lg text-rose-600'><FaHeart /></span>
                                            {wishlist_count !== 0 && (
                                                <div className='w-[20px] h-[20px] absolute bg-red-500 rounded-full text-white flex justify-center items-center -top-[5px] -right-[5px] text-xs font-bold'>
                                                    {wishlist_count}
                                                </div>
                                            )}
                                        </div>

                                        <div
                                            onClick={redirect_card_page}
                                            className='relative flex justify-center items-center cursor-pointer w-[40px] h-[40px] rounded-full bg-gray-100 hover:bg-rose-50 transition-colors'
                                        >
                                            <span className='text-lg text-rose-600'><FaCartShopping /></span>
                                            {card_product_count !== 0 && (
                                                <div className='w-[20px] h-[20px] absolute bg-red-500 rounded-full text-white flex justify-center items-center -top-[5px] -right-[5px] text-xs font-bold'>
                                                    {card_product_count}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className='hidden md-lg:block'>
                <div
                    onClick={() => setShowSidebar(true)}
                    className={`fixed duration-200 transition-all ${showSidebar ? 'invisible' : 'visible'} hidden md-lg:block w-screen h-screen bg-[rgba(0,0,0,0.5)] top-0 left-0 z-20`}
                ></div>

                <div className={`w-[280px] z-[9999] transition-all duration-300 fixed ${showSidebar ? '-left-[300px]' : 'left-0 top-0'} overflow-y-auto bg-white h-screen py-6 px-6 shadow-xl`}>
                    <div className='flex justify-start flex-col gap-6'>
                        <div className="flex justify-between items-center">
                            <Link to='/'>
                                <img src="http://localhost:3000/images/logo.png" alt="Logo" className="h-10" />
                            </Link>
                            <button
                                onClick={() => setShowSidebar(true)}
                                className="text-gray-500 hover:text-gray-800 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className='flex justify-start items-center gap-4 py-2'>
                            <div className='flex group cursor-pointer text-gray-700 text-sm justify-center items-center gap-1 relative'>
                                <img src="http://localhost:3000/images/language.png" alt="" className="w-5 h-5" />
                                <span><IoMdArrowDropdown /></span>
                                <ul className='absolute invisible transition-all left-0 rounded-md duration-200 text-gray-800 p-2 w-[100px] flex flex-col gap-2 group-hover:visible group-hover:top-6 group-hover:bg-white group-hover:shadow-md z-10'>
                                    <li className="hover:text-rose-600 transition-colors">Tiếng Việt</li>
                                    <li className="hover:text-rose-600 transition-colors">English</li>
                                </ul>
                            </div>

                            {userInfo ? (
                                <Link className='flex cursor-pointer justify-center items-center gap-2 text-sm font-medium text-gray-700' to='/dashboard'>
                                    <FaUser className="text-rose-600" />
                                    <span>{userInfo.name}</span>
                                </Link>
                            ) : (
                                <Link className='flex cursor-pointer justify-center items-center gap-2 text-sm font-medium text-gray-700' to='/login'>
                                    <FaLock className="text-rose-600" />
                                    <span>Đăng nhập</span>
                                </Link>
                            )}
                        </div>

                        <ul className='flex flex-col justify-start items-start gap-1 text-gray-700 font-medium'>
                            <li className="w-full">
                                <Link className={`py-2 block w-full rounded px-2 transition-colors ${pathname === '/' ? 'text-rose-600 bg-rose-50' : 'hover:bg-gray-50'}`}>
                                    Trang chủ
                                </Link>
                            </li>
                            <li className="w-full">
                                <Link to='/shops' className={`py-2 block w-full rounded px-2 transition-colors ${pathname === '/shops' ? 'text-rose-600 bg-rose-50' : 'hover:bg-gray-50'}`}>
                                    Cửa hàng
                                </Link>
                            </li>
                            <li className="w-full">
                                <Link className={`py-2 block w-full rounded px-2 transition-colors ${pathname === '/blog' ? 'text-rose-600 bg-rose-50' : 'hover:bg-gray-50'}`}>
                                    Blog
                                </Link>
                            </li>
                            <li className="w-full">
                                <Link className={`py-2 block w-full rounded px-2 transition-colors ${pathname === '/about' ? 'text-rose-600 bg-rose-50' : 'hover:bg-gray-50'}`}>
                                    Về chúng tôi
                                </Link>
                            </li>
                            <li className="w-full">
                                <Link className={`py-2 block w-full rounded px-2 transition-colors ${pathname === '/contact' ? 'text-rose-600 bg-rose-50' : 'hover:bg-gray-50'}`}>
                                    Liên hệ
                                </Link>
                            </li>
                        </ul>

                        <div className='flex justify-start items-center gap-4 text-gray-700 mt-2'>
                            <a href="https://www.facebook.com/dev.tvtai" className="hover:text-blue-600 transition-colors"><FaFacebookF /></a>
                            <a href="https://www.facebook.com/dev.tvtai" className="hover:text-pink-600 transition-colors"><FaInstagram /></a>
                            <a href="https://www.facebook.com/dev.tvtai" className="hover:text-red-600 transition-colors"><FaYoutube /></a>
                        </div>

                        <div className='w-full flex justify-start gap-3 items-center mt-4 bg-gray-50 p-3 rounded-lg'>
                            <div className='w-[42px] h-[42px] rounded-full flex bg-rose-100 justify-center items-center'>
                                <FaPhoneAlt className="text-rose-600" />
                            </div>
                            <div className='flex justify-end flex-col'>
                                <h2 className='text-sm font-medium text-gray-800'>1900 1234</h2>
                                <span className='text-xs text-gray-500'>Hỗ trợ 24/7</span>
                            </div>
                        </div>

                        <div className='flex justify-start items-center gap-2 text-sm text-gray-700'>
                            <MdEmail className="text-rose-600" />
                            <span>hotro@thoitrang.com</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Thanh tìm kiếm và danh mục */}
            <div className='w-[85%] lg:w-[90%] mx-auto py-4'>
                <div className='flex w-full flex-wrap md-lg:gap-6'>
                    <div className='w-3/12 md-lg:w-full'>
                        <div className='bg-white relative'>
                            <div
                                onClick={() => setCategoryShow(!categoryShow)}
                                className='h-[50px] bg-rose-600 hover:bg-rose-700 transition-colors text-white flex justify-center md-lg:justify-between md-lg:px-6 items-center gap-3 font-medium text-md cursor-pointer rounded-t-md'
                            >
                                <div className='flex justify-center items-center gap-3'>
                                    <FaList />
                                    <span>Tất cả danh mục</span>
                                </div>
                                <span className={`transition-transform duration-300 ${categoryShow ? '' : 'rotate-180'}`}>
                                    <IoIosArrowDown />
                                </span>
                            </div>

                            <div className={`${categoryShow ? 'h-0' : 'h-[400px]'} overflow-hidden transition-all md-lg:relative duration-500 absolute z-[99999] bg-white w-full border border-gray-100 rounded-b-md shadow-lg`}>
                                <ul className='py-2'>
                                    {categorys.map((c, i) => (
                                        <li key={i} className='flex justify-start items-center gap-3 px-5 py-2 hover:bg-gray-50 transition-colors'>
                                            <img src={c.image} className='w-[30px] h-[30px] rounded-full overflow-hidden object-cover' alt={c.name} />
                                            <Link to={`/products?category=${c.name}`} className='text-sm block text-gray-700 hover:text-rose-600 transition-colors'>{c.name}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className='w-9/12 pl-6 md-lg:pl-0 md-lg:w-full'>
                        <div className='flex flex-wrap w-full justify-between items-center md-lg:gap-6'>
                            <div className='w-8/12 md-lg:w-full'>
                                <div className='flex border border-gray-200 h-[50px] items-center relative gap-6 rounded-md overflow-hidden shadow-sm'>
                                    <div className='relative after:absolute after:h-[25px] after:w-[1px] after:bg-gray-200 after:-right-[15px] md:hidden'>
                                        <select
                                            onChange={(e) => setCategory(e.target.value)}
                                            className='w-[150px] text-gray-700 font-medium bg-transparent px-4 h-full outline-0 border-none cursor-pointer'
                                            name=""
                                            id=""
                                        >
                                            <option value="">Chọn danh mục</option>
                                            {categorys.map((c, i) => (
                                                <option key={i} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <input
                                        className='w-full relative bg-transparent text-gray-700 outline-0 px-4 h-full'
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        type="text"
                                        name=''
                                        id=''
                                        placeholder='Tìm kiếm sản phẩm...'
                                    />
                                    <button
                                        onClick={search}
                                        className='bg-rose-600 hover:bg-rose-700 transition-colors right-0 absolute px-8 h-full font-medium text-white flex items-center gap-2'
                                    >
                                        <MdSearch className="text-xl" />
                                        <span>Tìm kiếm</span>
                                    </button>
                                </div>
                            </div>

                            <div className='w-4/12 block md-lg:hidden pl-4 md-lg:w-full md-lg:pl-0'>
                                <div className='w-full flex justify-end md-lg:justify-start gap-3 items-center'>
                                    <div className='w-[48px] h-[48px] rounded-full flex bg-gray-100 justify-center items-center'>
                                        <FaPhoneAlt className="text-rose-600" />
                                    </div>
                                    <div className='flex justify-end flex-col'>
                                        <h2 className='text-md font-medium text-gray-800'>1900 1234</h2>
                                        <span className='text-sm text-gray-500'>Hỗ trợ 24/7</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;