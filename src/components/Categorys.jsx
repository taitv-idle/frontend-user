import React, { useEffect, useState } from 'react';
import Carousel from 'react-multi-carousel';
import { Link } from 'react-router-dom';
import 'react-multi-carousel/lib/styles.css';
import { useSelector } from 'react-redux';
import CategorySkeleton from './CategorySkeleton';

const Categorys = () => {
    const { categorys } = useSelector(state => state.home);
    const [isLoading, setIsLoading] = useState(true);

    const responsive = {
        xxl: { breakpoint: { max: 4000, min: 1536 }, items: 6 },
        xl: { breakpoint: { max: 1536, min: 1280 }, items: 5 },
        lg: { breakpoint: { max: 1280, min: 1024 }, items: 4 },
        md: { breakpoint: { max: 1024, min: 768 }, items: 3 },
        sm: { breakpoint: { max: 768, min: 640 }, items: 2 },
        xs: { breakpoint: { max: 640, min: 0 }, items: 2 }
    };

    useEffect(() => {
        if(categorys.length > 0) setIsLoading(false);
    }, [categorys]);

    return (
        <section className="w-full py-12 lg:py-16 bg-gradient-to-b from-white to-rose-50/20">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 relative inline-block group">
                        Danh Mục Nổi Bật
                        <span className="absolute bottom-0 left-1/2 w-24 h-1 bg-rose-500 transform -translate-x-1/2 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-3 transition-all duration-300"></span>
                    </h2>
                </div>

                {isLoading ? (
                    <CategorySkeleton />
                ) : (
                    <Carousel
                        autoPlay
                        infinite
                        arrows={categorys.length > 6}
                        responsive={responsive}
                        transitionDuration={500}
                        containerClass="category-carousel gap-4"
                        itemClass="px-2"
                        sliderClass="h-full"
                        renderButtonGroupOutside
                        ssr
                        customLeftArrow={<CarouselArrow left />}
                        customRightArrow={<CarouselArrow />}
                    >
                        {categorys.map((c, i) => (
                            <Link
                                key={i}
                                to={`/products?category=${c.name}`}
                                className="block h-[220px] bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group relative isolate"
                            >
                                {/* Image container with hover effects */}
                                <div className="absolute inset-0 z-0">
                                    <div className="relative w-full h-full">
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 z-10 transition-opacity duration-300 group-hover:opacity-0"></div>
                                        <img
                                            src={c.image}
                                            alt={c.name}
                                            className="w-full h-full object-cover transform transition-all duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                </div>

                                {/* Category name with enhanced hover effects */}
                                <div className="absolute bottom-0 left-0 right-0 z-20 p-4 text-center">
                                    <span className="inline-block bg-white/90 backdrop-blur-sm text-gray-800 group-hover:text-rose-600 px-6 py-2 rounded-full text-lg font-semibold shadow-md transition-all duration-300 transform group-hover:-translate-y-1 group-hover:bg-white">
                                        {c.name}
                                    </span>
                                </div>

                                {/* Hover overlay effect */}
                                <div className="absolute inset-0 border-2 border-transparent group-hover:border-rose-300 transition-all duration-300 rounded-xl pointer-events-none"></div>
                            </Link>
                        ))}
                    </Carousel>
                )}
            </div>
        </section>
    );
};

const CarouselArrow = ({ onClick, left }) => (
    <button
        onClick={onClick}
        className={`absolute top-1/2 z-10 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-xl transition-all ${
            left ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'
        }`}
        aria-label={left ? 'Previous' : 'Next'}
    >
        <svg
            className={`w-6 h-6 text-rose-600 ${left ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
    </button>
);

export default Categorys;