import React, { useEffect } from 'react';
import Carousel from 'react-multi-carousel';
import { Link } from 'react-router-dom';
import 'react-multi-carousel/lib/styles.css';
import { useDispatch, useSelector } from 'react-redux';
import { get_banners } from '../store/reducers/homeReducer';

// Note: Optimal banner image dimensions should be 1920x720px (16:9 aspect ratio)
// or 2560x960px (for higher resolution displays)

const CarouselArrow = ({ onClick, left }) => (
    <button
        onClick={onClick}
        className={`absolute top-1/2 z-20 transform -translate-y-1/2 bg-white/80 hover:bg-white transition-all duration-300 p-3 md:p-4 rounded-full shadow-2xl ${
            left ? 'left-2 md:left-6' : 'right-2 md:right-6'
        } hover:scale-110`}
        aria-label={left ? 'Previous slide' : 'Next slide'}
    >
        <svg
            className={`w-5 h-5 md:w-7 md:h-7 text-rose-600 ${left ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
            />
        </svg>
    </button>
);

const Banner = () => {
    const dispatch = useDispatch();
    const { banners } = useSelector(state => state.home);

    useEffect(() => {
        dispatch(get_banners());
    }, [dispatch]);

    const responsive = {
        superLargeDesktop: {
            breakpoint: { max: 4000, min: 1536 },
            items: 1,
            partialVisibilityGutter: 0
        },
        desktop: {
            breakpoint: { max: 1536, min: 1024 },
            items: 1,
            partialVisibilityGutter: 0
        },
        tablet: {
            breakpoint: { max: 1024, min: 640 },
            items: 1,
            partialVisibilityGutter: 0
        },
        mobile: {
            breakpoint: { max: 640, min: 0 },
            items: 1,
            partialVisibilityGutter: 0
        }
    };

    return (
        <section className="w-full bg-gradient-to-b from-pink-50/20 to-white/10 pt-4 pb-8 md:pt-6 md:pb-12">
            <div className="mx-auto px-0 sm:px-4 max-w-screen-2xl">
                <Carousel
                    autoPlay
                    autoPlaySpeed={5000}
                    infinite
                    arrows={banners.length > 1}
                    showDots={banners.length > 1}
                    responsive={responsive}
                    swipeable
                    draggable={false}
                    transitionDuration={600}
                    customTransition="all 600ms cubic-bezier(0.4, 0, 0.2, 1)"
                    containerClass="relative group"
                    dotListClass="flex justify-center space-x-2 mt-4 md:mt-6"
                    dotListContainerStyle={{ margin: 0 }}
                    itemClass="px-0 md:px-2"
                    renderDotsOutside={true}
                    ssr
                    renderArrowPrev={(onClick) => <CarouselArrow onClick={onClick} left />}
                    renderArrowNext={(onClick) => <CarouselArrow onClick={onClick} />}
                    customDot={<CustomDot />}
                >
                    {banners.map((banner, i) => (
                        <Link
                            key={i}
                            to={`/product/details/${banner.link}`}
                            className="block w-full rounded-lg md:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                        >
                            <div className="relative w-full">
                                {/* Fixed aspect ratio container */}
                                <div className="aspect-[21/9] w-full">
                                    <img
                                        src={banner.banner}
                                        alt={`Banner ${i + 1}`}
                                        className="w-full h-full object-contain md:object-cover transform transition-transform duration-700 group-hover:scale-102"
                                        loading={i === 0 ? "eager" : "lazy"}
                                    />
                                </div>

                                {/* Text Overlay */}
                                {banner.title && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent flex flex-col justify-center items-start px-6 sm:px-10 md:px-16 lg:px-24">
                                        <div className="max-w-3xl space-y-2 md:space-y-4 lg:space-y-6 animate-fadeIn">
                                            <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight drop-shadow-lg">
                                                {banner.title}
                                            </h2>
                                            {banner.subtitle && (
                                                <p className="text-white/90 text-sm sm:text-base md:text-xl lg:text-2xl font-medium max-w-2xl drop-shadow-md">
                                                    {banner.subtitle}
                                                </p>
                                            )}
                                            <button className="mt-3 md:mt-5 lg:mt-8 bg-rose-600 hover:bg-rose-700 text-white uppercase tracking-wider text-xs sm:text-sm md:text-base lg:text-lg font-semibold py-2 px-4 sm:py-3 sm:px-8 md:py-3 md:px-10 lg:py-4 lg:px-12 rounded-lg transition-all transform hover:scale-105 hover:-translate-y-1 shadow-xl">
                                                Khám Phá Ngay →
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </Carousel>
            </div>

            {/* Banner image size recommendation */}
            {process.env.NODE_ENV === 'development' && banners.length === 0 && (
                <div className="mt-8 p-6 bg-blue-50 rounded-lg mx-4">
                    <h3 className="text-blue-800 font-medium text-lg mb-2">Khuyến nghị kích thước banner:</h3>
                    <ul className="list-disc pl-5 text-blue-700 space-y-1">
                        <li>Kích thước tối ưu: <strong>1920×720px</strong> (tỷ lệ 16:9)</li>
                        <li>Kích thước cho màn hình lớn: <strong>2560×960px</strong></li>
                        <li>Định dạng: JPG hoặc PNG tối ưu hóa</li>
                        <li>Dung lượng: Dưới 500KB để tối ưu tốc độ tải trang</li>
                    </ul>
                </div>
            )}
        </section>
    );
};

// Custom dot component for better styling
const CustomDot = ({ onClick, ...rest }) => {
    const { active } = rest;
    return (
        <button
            className={`h-2 md:h-3 rounded-full mx-1 transition-all duration-300 ${
                active ? "w-6 md:w-8 bg-rose-600" : "w-2 md:w-3 bg-gray-300 hover:bg-gray-400"
            }`}
            onClick={() => onClick()}
        />
    );
};

export default Banner;