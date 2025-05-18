import React, { useEffect, useState } from 'react';
import Rating from './Rating';
import RatingTemp from './RatingTemp';
import Pagination from './Pagination';
import { Link } from 'react-router-dom';
import RatingReact from 'react-rating';
import { FaStar } from 'react-icons/fa';
import { CiStar } from 'react-icons/ci';
import { useDispatch, useSelector } from 'react-redux';
import { customer_review, get_reviews, messageClear } from '../store/reducers/homeReducer';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';

const Reviews = ({ product }) => {
    const dispatch = useDispatch();
    const parPage = 5;
    const [pageNumber, setPageNumber] = useState(1);
    const { userInfo } = useSelector(state => state.auth);
    const { successMessage, reviews, rating_review, totalReview, reviewLoading } = useSelector(state => state.home);
    const [rat, setRat] = useState('');
    const [re, setRe] = useState('');

    const review_submit = (e) => {
        e.preventDefault();
        if (!rat) {
            toast.error('Vui lòng chọn số sao đánh giá');
            return;
        }
        if (!re.trim()) {
            toast.error('Vui lòng nhập nội dung đánh giá');
            return;
        }
        
        const obj = {
            name: userInfo.name,
            review: re,
            rating: rat,
            productId: product._id
        };
        dispatch(customer_review(obj));
    };

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            setRat('');
            setRe('');
            dispatch(messageClear());
        }
    }, [successMessage, dispatch]);

    useEffect(() => {
        if (product._id) {
            dispatch(get_reviews({ productId: product._id, pageNumber, parPage }));
        }
    }, [pageNumber, product._id, parPage, dispatch]);

    return (
        <div className='mt-8'>
            {/* Tổng quan đánh giá */}
            <div className='flex gap-10 md-lg:flex-col'>
                <div className='flex flex-col gap-2 justify-start items-start py-4'>
                    <div>
                        <span className='text-6xl font-semibold'>{product.rating}</span>
                        <span className='text-3xl font-semibold text-slate-600'>/5</span>
                    </div>
                    <div className='flex text-3xl'>
                        <Rating ratings={product.rating} />
                    </div>
                    <p className='text-sm text-slate-600'>({totalReview || 0}) Đánh giá</p>
                </div>

                {/* Biểu đồ tỷ lệ đánh giá */}
                <div className='flex gap-2 flex-col py-4'>
                    {[5, 4, 3, 2, 1].map((rate, index) => (
                        <div key={rate} className='flex justify-start items-center gap-5'>
                            <div className='text-md flex gap-1 w-[93px]'>
                                <RatingTemp rating={rate} />
                            </div>
                            <div className='w-[200px] h-[14px] bg-slate-200 relative'>
                                <div
                                    style={{
                                        width: `${totalReview > 0 ? Math.floor((100 * (rating_review[index]?.sum || 0)) / totalReview) : 0}%`
                                    }}
                                    className='h-full bg-[#Edbb0E]'
                                ></div>
                            </div>
                            <p className='text-sm text-slate-600 w-[0%]'>{rating_review[index]?.sum}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Danh sách review */}
            <h2 className='text-slate-600 text-xl font-bold py-5'>Đánh giá sản phẩm ({totalReview || 0})</h2>
            <div className='flex flex-col gap-8 pb-10 pt-4'>
                {reviews.map((r, i) => (
                    <div 
                        key={i} 
                        className={`flex flex-col gap-1 p-4 rounded-lg ${i === 0 && reviewLoading === false && r.name === userInfo?.name ? 'bg-green-50 animate-pulse-once border border-green-100' : ''}`}
                    >
                        <div className='flex justify-between items-center'>
                            <div className='flex gap-1 text-xl'>
                                <RatingTemp rating={r.rating} />
                            </div>
                            <span className='text-slate-600'>{r.date}</span>
                        </div>
                        <span className='text-slate-600 text-md'>{r.name}</span>
                        <p className='text-slate-600 text-sm'>{r.review}</p>
                    </div>
                ))}

                {reviews.length === 0 && (
                    <p className="text-center text-gray-500 py-8">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                )}

                {/* Pagination */}
                <div className='flex justify-end'>
                    {totalReview > parPage && (
                        <Pagination
                            pageNumber={pageNumber}
                            setPageNumber={setPageNumber}
                            totalItem={totalReview}
                            parPage={parPage}
                            showItem={5}
                        />
                    )}
                </div>
            </div>

            {/* Form đánh giá */}
            <div>
                {userInfo ? (
                    <div className='flex flex-col gap-3'>
                        <div className='flex gap-1'>
                            <RatingReact
                                onChange={(e) => setRat(e)}
                                initialRating={rat}
                                emptySymbol={<span className='text-slate-600 text-4xl'><CiStar /></span>}
                                fullSymbol={<span className='text-[#Edbb0E] text-4xl'><FaStar /></span>}
                            />
                        </div>
                        <form onSubmit={review_submit}>
                            <textarea
                                value={re}
                                onChange={(e) => setRe(e.target.value)}
                                required
                                className='border outline-0 p-3 w-full'
                                cols="30"
                                rows="5"
                            ></textarea>
                            <div className='mt-2'>
                                <button
                                    disabled={reviewLoading}
                                    className='py-1 px-5 bg-indigo-500 text-white rounded-sm flex items-center gap-2 disabled:bg-indigo-300'
                                >
                                    {reviewLoading ? (
                                        <>
                                            <ClipLoader color="#ffffff" size={14} />
                                            <span>Đang gửi...</span>
                                        </>
                                    ) : (
                                        'Gửi đánh giá'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div>
                        <Link to='/login' className='py-1 px-5 bg-red-500 text-white rounded-sm'>Login First</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reviews;
