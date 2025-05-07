import React from 'react';
import Carousel from 'react-multi-carousel';
import { Link } from 'react-router-dom';
import 'react-multi-carousel/lib/styles.css'
import { IoIosArrowBack,IoIosArrowForward } from "react-icons/io";

const Products = ({title,products}) => {

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
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(price);
    };

    const ButtonGroup = ({next,previous}) => {
        return (
            <div className='flex justify-between items-center mb-2'>
                <div className='text-lg font-bold text-red-500 tracking-wide'>{title}</div>
                <div className='flex justify-center items-center gap-3 text-red-400'>
                    <button onClick={()=>previous()} className='w-8 h-8 flex justify-center items-center bg-red-100 border border-red-200 rounded-full hover:bg-red-200 transition'>
                        <IoIosArrowBack />
                    </button>
                    <button onClick={()=>next()} className='w-8 h-8 flex justify-center items-center bg-red-100 border border-red-200 rounded-full hover:bg-red-200 transition'>
                    <IoIosArrowForward />

                    </button>
                </div>

            </div>
        )

    }


    return (
        <div className='flex gap-8 flex-col-reverse'>
            <Carousel
                    autoPlay={false}
                    infinite={false}
                    arrows={false}
                    responsive={responsive}
                    transitionDuration={500}
                    renderButtonGroupOutside={true}
                    customButtonGroup={<ButtonGroup/>}
                >
       {
        products.map((p,i)=> {
            return(
                <div key={i} className='flex flex-col justify-start gap-2'>
               {
                p.map((pl, j) =>  <Link key={j} className='flex items-center gap-3 p-2 rounded-lg bg-white hover:shadow-lg transition group border border-gray-100 hover:border-red-200' to={`/product/${pl.slug}`}>
                <img className='w-[80px] h-[80px] object-cover rounded-lg border border-gray-100 group-hover:scale-105 transition-transform duration-300' src={pl.images[0]} alt={pl.name} />
                <div className='flex flex-col gap-1 flex-1'>
                    <h2 className='font-medium text-gray-800 text-sm line-clamp-2 group-hover:text-red-500 transition-colors'>{pl.name}</h2>
                    <span className='text-base font-bold text-red-400'>{formatPrice(pl.price)}</span>
                </div>
            </Link>
                 )
               }
            </div>
            )
        })
       }

                </Carousel>
        </div>
    );
};

export default Products;