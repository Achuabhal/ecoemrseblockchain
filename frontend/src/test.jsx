import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/orders')
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        console.error('Error fetching orders:', err);
      });
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Order List</h1>

      {orders.map((order, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-md p-6 mb-6 hover:shadow-lg transition-shadow"
        >
          <div className="mb-4">
            <p><span className="font-semibold">Name:</span> {order.firstName} {order.lastName}</p>
            <p><span className="font-semibold">Email:</span> {order.email}</p>
            <p><span className="font-semibold">City:</span> {order.city}</p>
            <p><span className="font-semibold">Seller Address:</span> {order.sellerAddress}</p>
            <p><span className="font-semibold">Address:</span> {order.address}</p>
            <p><span className="font-semibold">Postal Code:</span> {order.postalCode}</p>
            <p><span className="font-semibold">Order ID:</span> {order._id}</p>
\\            <p><span className="font-semibold">Total Price:</span> {order.product.reduce((total, item) => total + (item.price * item.quantity), 0)} ETH</p>
            <p><span className="font-semibold">Status:</span> {order.status || 'Pending'}</p>
          </div>

          <h4 className="text-lg font-semibold mb-2">Products:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {order.product.map((item, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                <p><span className="font-semibold">Product Name:</span> {item.name}</p>
                <p><span className="font-semibold">Description:</span> {item.description}</p>
                <p><span className="font-semibold">Price:</span> {item.price} ETH</p>
                <p><span className="font-semibold">Quantity:</span> {item.quantity}</p>

                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-24 h-24 mt-2 object-cover rounded"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;
