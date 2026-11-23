import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import "./MyOrders.css";

const MyOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/buyer_login");
        return;
      }

      const response = await api.get("/myOrders", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setOrders(response.data.orders || []);

    } catch (err) {
      console.error("Fetching Orders Error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load your orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("en-RW") + " RWF";
  };

  if (loading) {
    return (
      <div className="orders-message">
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="my-orders-container">
      <div className="my-orders-header">
        <div>
          <h1>My Orders</h1>
          <p>Track and manage your purchases.</p>
        </div>

        <button
          className="shop-more-btn"
          onClick={() => navigate("/dashboard")}
        >
          Continue Shopping
        </button>
      </div>

      {error && (
        <div className="orders-error">
          <p>{error}</p>
          <button onClick={fetchOrders}>Try Again</button>
        </div>
      )}

      {!error && orders.length === 0 && (
        <div className="empty-orders">
          <div className="empty-orders-icon">🛍️</div>
          <h2>No orders yet</h2>
          <p>Your purchases will appear here after you place an order.</p>

          <button onClick={() => navigate("/dashboard")}>
            Start Shopping
          </button>
        </div>
      )}

      {!error && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-card-header">
                <div>
                  <span className="order-label">Order ID</span>
                  <h3>#{order._id.slice(-8).toUpperCase()}</h3>
                </div>

                <span
                  className={`order-status ${String(order.orderStatus || "Pending").toLowerCase()}`}
                >
                  {order.orderStatus}
                </span>
              </div>

              <div className="order-information">
                <div>
                  <span>Order Date</span>
                  <strong>{formatDate(order.createdAt)}</strong>
                </div>

                <div>
                  <span>Payment Method</span>
                  <strong>{order.paymentMethod}</strong>
                </div>

                <div>
                  <span>Payment Status</span>
                  <strong>{order.paymentStatus}</strong>
                </div>

                <div>
                  <span>Total Amount</span>
                  <strong className="order-total">
                    {formatPrice(order.totalAmount)}
                  </strong>
                </div>
              </div>

              <div className="ordered-products">
                <h4>Products</h4>

                {order.items?.map((item, index) => (
                  <div className="ordered-product" key={item._id || index}>
                    <div>
                      <strong>{item.productName}</strong>
                      <span>Quantity: {item.quantity}</span>
                    </div>

                    <strong>{formatPrice(item.subtotal)}</strong>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <span>
                  Delivering to: {order.shippingAddress?.city || "Address unavailable"}
                </span>
                <span>{order.items?.length || 0} product type(s)</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;