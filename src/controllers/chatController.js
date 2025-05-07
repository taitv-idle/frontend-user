/**
 * Tìm kiếm người bán theo tên shop
 */
search_sellers = async (req, res) => {
    const { query } = req.query;
    
    try {
        // Tìm kiếm theo tên shop hoặc tên người bán
        const sellers = await sellerModel.find({
            $or: [
                { 'shopInfo.shopName': { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } }
            ]
        }).select('_id shopInfo.shopName image name');

        // Kiểm tra và format dữ liệu trả về
        const formattedSellers = sellers.map(seller => ({
            _id: seller._id,
            shopInfo: {
                shopName: seller.shopInfo?.shopName || seller.name
            },
            image: seller.image || '/images/default-seller.png'
        }));

        responseReturn(res, 200, {
            success: true,
            sellers: formattedSellers
        });
    } catch (error) {
        console.log(error);
        responseReturn(res, 500, { 
            success: false,
            error: error.message 
        });
    }
} 