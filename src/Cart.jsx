
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import "./Cart.css";

function Cart(){
    const navigate = useNavigate();

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Get authentication headers
    const authHeaders = () => {
        const token = localStorage.getItem("token");

        if (!token) return null;

        return {
            Authorization: `Bearer ${token}`
        };
    };

    // Fetch buyer's cart
    const fetchCart = async () => {
        const headers = authHeaders();

        if (!headers) {
            navigate("/login");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get("/getCart", { headers });

            if (response.data.success) {
                setCart(response.data.cart?.items || []);
            } else {
                setError(response.data.message || "Unable to load cart.");
            }

        } catch (err) {
            console.error("Fetch cart error:", err);

            if (err.response?.status === 401) {
                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load your cart."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // Calculate total quantity
    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    // Calculate total price
    const totalPrice = cart.reduce((total, item) => {
        const product = item.product;
        const price = Number(product?.price || 0);

        return total + price * item.quantity;
    }, 0);

    if (loading) {
        return (
            <div className="cart-loading">
                <div className="cart-spinner"></div>
                <p>Loading your cart...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cart-error">
                <h2>Something went wrong</h2>
                <p>{error}</p>
                <button onClick={fetchCart}>Try Again</button>
            </div>
        );
    }
    return(
        <>
        <div className="cart-page">

            <div className="cart-header">
                <div>
                    <h1>My Shopping Cart</h1>
                    <p>
                        You have {totalItems} item(s) in your cart.
                    </p>
                </div>

                <button
                    className="continue-shopping"
                    onClick={() => navigate("/dashboard")}
                >
                    Continue Shopping
                </button>
            </div>

            {cart.length === 0 ? (

                <div className="empty-cart">
                    <div className="empty-cart-icon">🛒</div>

                    <h2>Your cart is empty</h2>

                    <p>
                        You haven't added any products to your cart yet.
                    </p>

                    <button onClick={() => navigate("/")}>
                        Start Shopping
                    </button>
                </div>

            ) : (

                <div className="cart-content">

                    <div className="cart-items">

                        {cart.map((item) => {
                            const product = item.product;

                            if (!product) return null;

                            const price = Number(product.price || 0);

                            const image =
                                product.image ||
                                product.images?.[0] ||
                                product.imageUrl;

                            return (
                                <div
                                    className="cart-item"
                                    key={product._id}
                                >

                                    <div className="cart-product-image">
                                        {image ? (
                                            <img
                                                src={image}
                                                alt={product.name || product.title}
                                            />
                                        ) : (
                                            <div className="no-product-image">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    <div className="cart-product-details">

                                        <h3>
                                            {product.name || product.title || "Unnamed Product"}
                                        </h3>

                                        <p className="cart-product-price">
                                            {price.toLocaleString()} RWF
                                        </p>

                                        <p className="cart-product-quantity">
                                            Quantity: {item.quantity}
                                        </p>

                                        <p className="cart-subtotal">
                                            Subtotal: {(price * item.quantity).toLocaleString()} RWF
                                        </p>

                                    </div>

                                </div>
                            );
                        })}

                    </div>

                    <div className="cart-summary">

                        <h2>Order Summary</h2>

                        <div className="summary-row">
                            <span>Total Items</span>
                            <span>{totalItems}</span>
                        </div>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>
                                {totalPrice.toLocaleString()} RWF
                            </span>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-total">
                            <span>Total</span>
                            <strong>
                                {totalPrice.toLocaleString()} RWF
                            </strong>
                        </div>

                        <button
                            className="checkout-btn"
                            onClick={() => navigate("/checkout")}
                        >
                            Proceed to Checkout
                        </button>

                    </div>

                </div>

            )}

        </div>
        </>
    )
}

export default Cart;
