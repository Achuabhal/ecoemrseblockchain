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
    <div className="container mt-5">
      <h1 className="text-center mb-4">Order List</h1>

      {orders.map((order, index) => (
        <div key={index} className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="mb-3">
              <p><span className="fw-bold">Name:</span> {order.firstName} {order.lastName}</p>
              <p><span className="fw-bold">Email:</span> {order.email}</p>
              <p><span className="fw-bold">City:</span> {order.city}</p>
              <p><span className="fw-bold">Seller Address:</span> {order.sellerAddress}</p>
              <p><span className="fw-bold">Address:</span> {order.address}</p>
              <p><span className="fw-bold">Postal Code:</span> {order.postalCode}</p>
              <p><span className="fw-bold">Order ID:</span> {order._id}</p>
              <p><span className="fw-bold">Total Price:</span> {order.product.reduce((total, item) => total + (item.price * item.quantity), 0)} ETH</p>
              <p><span className="fw-bold">Status:</span> <span className={`badge bg-${order.status === 'Delivered' ? 'success' : order.status === 'Shipped' ? 'info' : 'warning'}`}>{order.status || 'Pending'}</span></p>
            </div>

            <h4 className="card-title mb-3">Products:</h4>
            <div className="row">
              {order.product.map((item, idx) => (
                <div key={idx} className="col-md-6 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <p><span className="fw-bold">Product Name:</span> {item.name}</p>
                      <p><span className="fw-bold">Description:</span> {item.description}</p>
                      <p><span className="fw-bold">Price:</span> {item.price} ETH</p>
                      <p><span className="fw-bold">Quantity:</span> {item.quantity}</p>
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="img-fluid rounded mt-2"
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;
