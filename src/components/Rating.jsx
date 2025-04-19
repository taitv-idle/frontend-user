import React from 'react';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { CiStar } from 'react-icons/ci';

const Rating = ({ ratings }) => {
    // Tạo mảng 5 phần tử ứng với 5 sao
    const stars = Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;

        if (ratings >= starValue) {
            return <FaStar key={index} className="text-[#EDBB0E]" />;
        } else if (ratings >= starValue - 0.5) {
            return <FaStarHalfAlt key={index} className="text-[#EDBB0E]" />;
        } else {
            return <CiStar key={index} className="text-slate-600" />;
        }
    });

    return <div className="flex gap-1">{stars}</div>;
};

export default Rating;
