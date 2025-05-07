import { Link } from 'react-router-dom';
import { FaHeartBroken } from 'react-icons/fa';

const EmptyWishlist = () => {
    return (
        <div className="container mx-auto px-4 py-12 text-center">
            <div className="max-w-md mx-auto">
                <FaHeartBroken className="mx-auto text-6xl text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Danh sách yêu thích trống</h2>
                <p className="text-gray-500 mb-6">Bạn chưa thêm sản phẩm nào vào danh sách yêu thích</p>
                <Link
                    to="/shops"
                    className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Khám phá sản phẩm
                </Link>
            </div>
        </div>
    );
};

export default EmptyWishlist;