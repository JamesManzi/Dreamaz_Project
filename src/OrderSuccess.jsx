
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./OrderSuccess.css";

const OrderSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const order = location.state?.order;

    if (!order) {
        return (
            <div className="order-success-empty">
                <h2>No order information found.</h2>
                <p>Please visit your orders to check your purchases.</p>

                <button onClick={() => navigate("/")}>
                    Back to Home
                </button>
            </div>
        );
    }

    const formatPrice = (price) =>
        Number(price || 0).toLocaleString("en-RW");

    const shipping = order.shippingAddress || {};

    return (
        <div className="order-success-page">

            <div className="success-card">

                <div className="success-icon">
                    <span>✓</span>
                </div>

                <h1>Order Placed Successfully!</h1>

                <p className="success-message">
                    Thank you for shopping with Dreamaz Ink.
                    Your order has been received.
                </p>

                <div className="order-reference">
                    <span>Order Reference</span>
                    <strong>{order._id}</strong>
                </div>

                <div className="order-status-section">
                    <div>
                        <span>Order Status</span>
                        <strong className="pending-status">
                            {order.orderStatus || "Pending"}
                        </strong>
                    </div>

                    <div>
                        <span>Payment Status</span>
                        <strong className="pending-status">
                            {order.paymentStatus || "Pending"}
                        </strong>
                    </div>
                </div>

                <div className="success-order-details">

                    <h2>Order Summary</h2>

                    {order.items?.map((item, index) => (
                        <div className="success-product" key={item._id || index}>
                            <div>
                                <h4>{item.productName}</h4>
                                <p>Quantity: {item.quantity}</p>
                                <p>
                                    Unit Price: {formatPrice(item.price)} RWF
                                </p>
                            </div>

                            <strong>
                                {formatPrice(item.subtotal)} RWF
                            </strong>
                        </div>
                    ))}

                    <div className="success-total">
                        <span>Total Amount</span>
                        <strong>
                            {formatPrice(order.totalAmount)} RWF
                        </strong>
                    </div>

                </div>

                <div className="success-delivery">

                    <h2>Delivery Information</h2>

                    <p><strong>Name:</strong> {shipping.fullName}</p>
                    <p><strong>Phone:</strong> {shipping.phone}</p>
                    <p><strong>Address:</strong> {shipping.address}</p>
                    <p><strong>City:</strong> {shipping.city}</p>

                    <p>
                        <strong>Payment Method:</strong>{" "}
                        {order.paymentMethod}
                    </p>

                </div>

                <div className="success-actions">

                    <button
                        className="success-home-btn"
                        onClick={() => navigate("/")}
                    >
                        Continue Shopping
                    </button>

                    <button
                        className="success-orders-btn"
                        onClick={() => navigate("/myOrders")}
                    >
                        View My Orders
                    </button>

                </div>

                <p className="success-footer">
                    Thank you for choosing Dreamaz Ink.
                    We appreciate your business!
                </p>

            </div>

        </div>
    );
};

export default OrderSuccess;
