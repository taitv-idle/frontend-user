import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { product_details } from '../../store/reducers/homeReducer';

const Details = () => {
    const { product, errorMessage } = useSelector(state => state.home);
    const dispatch = useDispatch();
    const { slug } = useParams();

    useEffect(() => {
        dispatch(product_details(slug));
    }, [slug, dispatch]);

    // Kiểm tra nếu đang loading
    if (!product && !errorMessage) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Kiểm tra nếu có lỗi hoặc không tìm thấy sản phẩm
    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-bold text-red-500 mb-4">
                    {errorMessage || "Không tìm thấy sản phẩm"}
                </h2>
                <Link 
                    to="/"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Quay về trang chủ
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="product-details">
                <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                {product.category && (
                    <p className="text-gray-600 mb-4">Category: {product.category}</p>
                )}
                {/* Thêm các thông tin chi tiết sản phẩm khác ở đây */}
            </div>
        </div>
    );
};

export default Details; 