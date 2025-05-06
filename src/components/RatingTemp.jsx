import React from 'react';
import { FaStar } from 'react-icons/fa';
import { CiStar } from 'react-icons/ci';

const getStarColor = (rating) => {
    if (rating === 5) return '#00C851';       // xanh lá
    if (rating === 4) return '#33b5e5';       // xanh dương
    if (rating === 3) return '#ffbb33';       // cam nhạt
    if (rating === 2) return '#ff4444';       // đỏ cam
    if (rating === 1) return '#CC0000';       // đỏ đậm
    return '#9e9e9e';                         // xám mặc định
};

const RatingTemp = ({ rating }) => {
    const starColor = getStarColor(rating);

    const stars = Array.from({ length: 5 }, (_, index) => {
        return index < rating
            ? <FaStar key={index} className="transition-all duration-300" style={{ color: starColor }} />
            : <CiStar key={index} style={{ color: '#cfd8dc' }} />; // màu xám nhạt cho sao trống
    });

    return <div className="flex gap-1">{stars}</div>;
};

export default RatingTemp;
