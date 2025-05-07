import React, { useState } from 'react';
import Carousel from 'react-multi-carousel';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CategorySkeleton from './CategorySkeleton';
import 'react-multi-carousel/lib/styles.css';

const responsive = {
    xl: { breakpoint: { max: 4000, min: 1280 }, items: 6 },
    lg: { breakpoint: { max: 1280, min: 1024 }, items: 5 },
    md: { breakpoint: { max: 1024, min: 768 }, items: 4 },
    sm: { breakpoint: { max: 768, min: 640 }, items: 3 },
    xs: { breakpoint: { max: 640, min: 0 }, items: 2 }
};

const Categorys = () => {
    const { categorys } = useSelector(state => state.home);
    const [autoPlay, setAutoPlay] = useState(true);

    if (!categorys || categorys.length === 0) {
        return <CategorySkeleton />;
    }

    return (
        <section className="w-full py-12 lg:py-16 bg-gradient-to-b from-white to-rose-50/20">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 relative inline-block group">
                        Danh Mục Nổi Bật
                        <span className="absolute bottom-0 left-1/2 w-24 h-1 bg-rose-500 transform -translate-x-1/2 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-3 transition-all duration-300"></span>
                    </h2>
                </div>
                <Carousel
                    responsive={responsive}
                    infinite
                    autoPlay={autoPlay}
                    autoPlaySpeed={2000}
                    arrows={categorys.length > 6}
                    containerClass="category-carousel"
                    itemClass="px-2"
                    pauseOnHover
                    removeArrowOnDeviceType={["xs", "sm"]}
                    beforeChange={() => {}}
                    afterChange={() => {}}
                    onMouseEnter={() => setAutoPlay(false)}
                    onMouseLeave={() => setAutoPlay(true)}
                >
                    {categorys.map((c, i) => (
                        <Link
                            key={i}
                            to={`/products?category=${c.name}`}
                            className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all flex flex-col items-center p-4"
                        >
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center mb-4 border-2 border-rose-100 group-hover:border-rose-400 transition-all">
                                <img
                                    src={c.image}
                                    alt={c.name}
                                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <span className="text-base font-semibold text-gray-800 group-hover:text-rose-600 transition-colors text-center">
                                {c.name}
                            </span>
                        </Link>
                    ))}
                </Carousel>
            </div>
        </section>
    );
};

export default Categorys;