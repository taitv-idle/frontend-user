import React from 'react';
import Carousel from 'react-multi-carousel';
import { Link } from 'react-router-dom';
import 'react-multi-carousel/lib/styles.css';
import { useSelector } from 'react-redux';

const Categorys = () => {
    const { categorys } = useSelector(state => state.home);

    const responsive = {
        superLargeDesktop: {
            breakpoint: { max: 4000, min: 3000 },
            items: 6
        },
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 6
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 4
        },
        mdtablet: {
            breakpoint: { max: 991, min: 464 },
            items: 4
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 3
        },
        smmobile: {
            breakpoint: { max: 640, min: 0 },
            items: 2
        },
        xsmobile: {
            breakpoint: { max: 440, min: 0 },
            items: 1
        },
    };

    return (
        <div className='w-[87%] mx-auto relative my-12'>
            <div className='w-full'>
                <div className='text-center mb-10'>
                    <h2 className='text-3xl font-bold text-gray-800 relative inline-block'>
                        Top Categories
                        <span className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-emerald-500 mt-4'></span>
                    </h2>
                </div>
            </div>

            <Carousel
                autoPlay={true}
                infinite={true}
                arrows={true}
                responsive={responsive}
                transitionDuration={500}
                containerClass="category-carousel"
                itemClass="category-item"
            >
                {categorys.map((c, i) => (
                    <Link
                        key={i}
                        to={`/products?category=${c.name}`}
                        className='block h-[185px] border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400'
                    >
                        <div className='w-full h-full relative p-3 group'>
                            <div className='w-full h-full flex items-center justify-center'>
                                <img
                                    src={c.image}
                                    alt={c.name}
                                    className='max-h-[120px] max-w-full object-contain transition-transform duration-300 group-hover:scale-105'
                                />
                            </div>
                            <div className='absolute bottom-4 left-0 right-0 mx-auto'>
                                <span className='inline-block py-2 px-6 bg-gray-800/80 text-white text-sm font-bold rounded-full backdrop-blur-sm transition-all duration-300 group-hover:bg-emerald-500 group-hover:shadow-lg'>
                                    {c.name}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </Carousel>
        </div>
    );
};

export default Categorys;