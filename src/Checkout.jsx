
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import "./Checkout.css";

const Checkout = () => {
    const navigate = useNavigate();

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        paymentMethod: "Cash on Delivery"
    });

    const authHeaders = () => {
        const token = localStorage.getItem("token");

        return token
            ? { Authorization: `Bearer ${token}` }
            : null;
    };

    // Load cart
    useEffect(() => {
        const fetchCart = async () => {
            const headers = authHeaders();

            if (!headers) {
                navigate("/login");
                return;
            }

            try {
                const response = await api.get("/getCart", { headers });

                if (response.data.success) {
                    setCart(response.data.cart?.items || []);
                }
            } catch (err) {
                console.error("Checkout cart error:", err);
                setError(
                    err.response?.data?.message ||
                    "Unable to load your cart."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const totalPrice = cart.reduce((total, item) => {
        return total +
            Number(item.product?.price || 0) * item.quantity;
    }, 0);

    // Submit order
    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        if (!formData.fullName.trim() ||
            !formData.phone.trim() ||
            !formData.address.trim() ||
            !formData.city.trim()) {
            setError("Please complete all delivery information.");
            return;
        }

        const headers = authHeaders();

        if (!headers) {
            navigate("/login");
            return;
        }

        try {
            setPlacingOrder(true);
            setError("");

            const response = await api.post(
                "/createOrder",
                formData,
                { headers }
            );

            if (response.data.success) {
                navigate("/order-success", {
                    state: {
                        order: response.data.order
                    }
                });
            }

        } catch (err) {
            console.error("Place order error:", err);

            if (err.response?.status === 401) {
                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Unable to place your order."
            );
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) {
        return <div className="checkout-message">Loading checkout...</div>;
    }

    if (cart.length === 0) {
        return (
            <div className="checkout-message">
                <h2>Your cart is empty</h2>
                <button onClick={() => navigate("/")}>
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-heading">
                <h1>Checkout</h1>
                <p>Complete your information to place your order.</p>
            </div>

            <form onSubmit={handlePlaceOrder}>
                <div className="checkout-layout">

                    <div className="checkout-form-section">

                        <div className="checkout-card">
                            <h2>Delivery Information</h2>

                            <label>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />

                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+250 7XX XXX XXX"
                                required
                            />

                            <label>Delivery Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter your street, sector or location"
                                required
                            />

                            <label>City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="e.g. Kigali"
                                required
                            />
                        </div>

                        <div className="checkout-card">
                            <h2>Payment Method</h2>

                            <label className="payment-option">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="Cash on Delivery"
                                    checked={formData.paymentMethod === "Cash on Delivery"}
                                    onChange={handleChange}
                                />
                                <span>
                                    <strong>Cash on Delivery</strong>
                                    <small>Pay when your order arrives.</small>
                                </span>
                            </label>

                            <label className="payment-option">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="MTN MoMo"
                                    checked={formData.paymentMethod === "MTN MoMo"}
                                    onChange={handleChange}
                                />
                                <span>
                                    <strong>MTN Mobile Money</strong>
                                    <small>Payment confirmation will be required.</small>
                                </span>
                            </label>
                        </div>

                    </div>

                    <div className="checkout-card order-summary">
                        <h2>Your Order</h2>

                        {cart.map((item) => (
                            <div className="checkout-product" key={item.product?._id}>
                                <div>
                                    <strong>
                                        {item.product?.name ||
                                            item.product?.title ||
                                            "Product"}
                                    </strong>
                                    <small>Quantity: {item.quantity}</small>
                                </div>

                                <span>
                                    {(Number(item.product?.price || 0) *
                                        item.quantity).toLocaleString()} RWF
                                </span>
                            </div>
                        ))}

                        <div className="checkout-total">
                            <span>Total items</span>
                            <strong>{totalItems}</strong>
                        </div>

                        <div className="checkout-total final-total">
                            <span>Total Amount</span>
                            <strong>{totalPrice.toLocaleString()} RWF</strong>
                        </div>

                        {error && (
                            <p className="checkout-error">{error}</p>
                        )}

                        <button
                            type="submit"
                            className="place-order-btn"
                            disabled={placingOrder}
                        >
                            {placingOrder
                                ? "Processing..."
                                : "Place Order"}
                        </button>

                        <p className="checkout-security">
                            Your order information is securely submitted.
                        </p>
                    </div>

                </div>
            </form>
        </div>
    );
};

export default Checkout;
