import React from 'react';

/**
 * Hướng dẫn thêm và hiển thị thuộc tính màu sắc và kích thước trong toàn bộ ứng dụng
 * 
 * File này cung cấp các ví dụ code để thêm vào các component khác nhau trong ứng dụng
 * để hiển thị thông tin màu sắc và kích thước của sản phẩm
 */

const ProductAttributesGuide = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Hướng dẫn hiển thị màu sắc và kích thước sản phẩm</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Trang giỏ hàng (Cart.jsx)</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="mb-2 text-sm text-gray-600">Thêm vào phần hiển thị sản phẩm trong giỏ hàng:</p>
          <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
            {`<div className="flex items-center space-x-4 mb-4">
  <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
  <div>
    <h3 className="font-medium">{product.name}</h3>
    <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-1">
      {product.color && (
        <span className="text-gray-600">
          Màu: <span className="font-medium">{product.color}</span>
        </span>
      )}
      {product.size && (
        <span className="text-gray-600">
          Size: <span className="font-medium">{product.size}</span>
        </span>
      )}
    </div>
    <p className="text-red-600 font-medium">{formatPrice(product.price)}</p>
  </div>
</div>`}
          </pre>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. Trang đặt hàng (Checkout.jsx)</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="mb-2 text-sm text-gray-600">Thêm vào phần tóm tắt sản phẩm trong checkout:</p>
          <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
            {`<div className="py-3 border-b">
  <div className="flex justify-between">
    <div className="flex gap-3">
      <img
        src={product.image}
        alt={product.name}
        className="w-16 h-16 object-cover rounded"
      />
      <div>
        <h4 className="font-medium">{product.name}</h4>
        <div className="flex flex-col text-sm text-gray-500">
          <span>SL: {product.quantity}</span>
          {product.color && <span>Màu: {product.color}</span>}
          {product.size && <span>Size: {product.size}</span>}
        </div>
      </div>
    </div>
    <span className="font-medium">{formatPrice(product.price)}</span>
  </div>
</div>`}
          </pre>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. Chi tiết đơn hàng (OrderDetails.jsx)</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="mb-2 text-sm text-gray-600">Hiển thị thuộc tính trong chi tiết đơn hàng:</p>
          <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
            {`<div className="flex-grow">
  <p className="font-medium">{product.name}</p>
  <p className="text-sm text-gray-500">
    Số lượng: {product.quantity}
  </p>
  <div className="flex flex-wrap gap-2 text-xs mt-1">
    {product.color && (
      <span className="px-2 py-1 bg-gray-100 rounded-md">
        Màu: <span className="font-medium">{product.color}</span>
      </span>
    )}
    {product.size && (
      <span className="px-2 py-1 bg-gray-100 rounded-md">
        Size: <span className="font-medium">{product.size}</span>
      </span>
    )}
  </div>
</div>`}
          </pre>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">4. Danh sách đơn hàng (Orders.jsx)</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="mb-2 text-sm text-gray-600">Hiển thị thuộc tính trong danh sách sản phẩm của đơn hàng:</p>
          <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
            {`{order.products.map((product, idx) => (
  <div key={idx} className="flex items-center gap-3 py-2">
    <img
      src={product.image}
      alt={product.name}
      className="w-10 h-10 object-cover rounded"
    />
    <div>
      <p className="text-sm font-medium">{product.name}</p>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>SL: {product.quantity}</span>
        {product.color && <span>| Màu: {product.color}</span>}
        {product.size && <span>| Size: {product.size}</span>}
      </div>
    </div>
  </div>
))}`}
          </pre>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">5. Sửa API và Redux Store</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="mb-2 text-sm text-gray-600">Đảm bảo gửi thông tin màu sắc và kích thước lên API:</p>
          <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
            {`// Trong cardReducer.js khi thêm vào giỏ hàng
export const add_to_card = createAsyncThunk(
  'card/add_to_card',
  async (info, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post('/home/product/add-to-card', info);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Trong component khi gọi action
dispatch(add_to_card({ 
  userId: userInfo.id, 
  quantity, 
  productId: product._id,
  color: selectedColor,  // Thêm màu sắc
  size: selectedSize     // Thêm kích thước
}));`}
          </pre>
        </div>
      </section>
    </div>
  );
};

export default ProductAttributesGuide; 