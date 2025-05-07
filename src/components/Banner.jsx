import React, { useEffect } from 'react';
import Carousel from 'react-multi-carousel';
import { Link } from 'react-router-dom';
import 'react-multi-carousel/lib/styles.css';
import { useDispatch, useSelector } from 'react-redux';
import { get_banners } from '../store/reducers/homeReducer';

const CarouselArrow = ({ onClick, left }) => (
    <button
        onClick={onClick}
        className={`absolute top-1/2 z-20 transform -translate-y-1/2 bg-white/90 hover:bg-white transition-all duration-300 p-4 rounded-full shadow-2xl ${
            left ? 'left-6' : 'right-6'
        } hover:scale-110`}
        aria-label={left ? 'Previous slide' : 'Next slide'}
    >
        <svg
            className={`w-8 h-8 text-rose-600 ${left ? 'rotate-180' : ''}`}
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
        <section className="w-full bg-gradient-to-b from-pink-50/20 to-white/10 py-10 md:py-16">
            <div className="mx-auto px-0 sm:px-4 max-w-[1800px]">
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
                    dotListClass="flex justify-center space-x-3 mt-6"
                    itemClass="px-2"
                    ssr
                    renderArrowPrev={(onClick) => <CarouselArrow onClick={onClick} left />}
                    renderArrowNext={(onClick) => <CarouselArrow onClick={onClick} />}
                >
                    {banners.map((banner, i) => (
                        <Link
                            key={i}
                            to={`/product/details/${banner.link}`}
                            className="block w-full rounded-3xl overflow-hidden shadow-3xl hover:shadow-4xl transition-all duration-300"
                        >
                            <div className="relative aspect-[21/9] w-full h-[500px] md:h-[650px] lg:h-[800px]">
                                <img
                                    src={banner.banner}
                                    alt={`Banner ${i + 1}`}
                                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />

                                {/* Text Overlay */}
                                {banner.title && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/45 to-black/25 flex flex-col justify-center items-start px-12 md:px-24 lg:px-32">
                                        <div className="max-w-3xl space-y-6">
                                            <h2 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-2xl">
                                                {banner.title}
                                            </h2>
                                            {banner.subtitle && (
                                                <p className="text-white/95 text-xl md:text-2xl lg:text-3xl font-medium max-w-2xl">
                                                    {banner.subtitle}
                                                </p>
                                            )}
                                            <button className="mt-8 bg-rose-600 hover:bg-rose-700 text-white uppercase tracking-wider text-lg md:text-xl font-semibold py-4 px-12 rounded-xl transition-all transform hover:scale-110 shadow-xl">
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
        </section>
    );
};

export default Banner;