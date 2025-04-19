import React, { useEffect } from 'react';
import Carousel from 'react-multi-carousel';
import { Link } from 'react-router-dom';
import 'react-multi-carousel/lib/styles.css';
import { useDispatch, useSelector } from 'react-redux';
import { get_banners } from '../store/reducers/homeReducer';

const Banner = () => {
    const dispatch = useDispatch();
    const { banners } = useSelector(state => state.home);

    const responsive = {
        superLargeDesktop: {
            breakpoint: { max: 4000, min: 3000 },
            items: 1
        },
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 1
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 1
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1
        },
    };

    useEffect(() => {
        dispatch(get_banners());
    }, [dispatch]);

    return (
        <div className="w-full bg-gray-50 py-2 md:py-4">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="rounded-xl overflow-hidden shadow-md">
                    <Carousel
                        autoPlay={true}
                        autoPlaySpeed={5000}
                        infinite={true}
                        arrows={true}
                        showDots={true}
                        responsive={responsive}
                        swipeable={true}
                        draggable={true}
                        containerClass="carousel-container"
                        dotListClass="custom-dot-list"
                        itemClass="carousel-item"
                    >
                        {banners.length > 0 && banners.map((banner, index) => (
                            <Link
                                key={index}
                                to={`/product/details/${banner.link}`}
                                className="block w-full h-full"
                            >
                                <div className="aspect-[3/1] w-full h-auto md:aspect-[4/1]">
                                    <img
                                        src={banner.banner}
                                        alt={`Banner ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            </Link>
                        ))}
                    </Carousel>
                </div>
            </div>
        </div>
    );
};

export default Banner;