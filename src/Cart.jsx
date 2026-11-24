
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import "./Cart.css";

/* =========================================================
   HELPERS
========================================================= */

const getProductImage = (product) => {
    if (!product || !Array.isArray(product.files)) return "";

    const imageFile = product.files.find(
        (file) =>
            file?.type === "image" &&
            typeof file.url === "string" &&
            file.url.trim() !== ""
    );

    return imageFile?.url || "";
};

const formatPrice = (price) => {
    return `${Number(price || 0).toLocaleString("en-US")} RWF`;
};

/* =========================================================
   CART COMPONENT
========================================================= */

function Cart() {
    const navigate = useNavigate();

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [deletingProduct, setDeletingProduct] = useState(null);
    const [clearingCart, setClearingCart] = useState(false);

    const [toast, setToast] = useState(null);

    /* =====================================================
       POPUP MESSAGE
    ===================================================== */

    const showToast = useCallback((message, type = "success") => {
        setToast({
            id: Date.now(),
            message,
            type
        });
    }, []);

    useEffect(() => {
        if (!toast) return;

        const timer = setTimeout(() => {
            setToast(null);
        }, 3500);

        return () => clearTimeout(timer);
    }, [toast]);

    /* =====================================================
       AUTHENTICATION
    ===================================================== */

    const authHeaders = useCallback(() => {
        const token = localStorage.getItem("token");

        if (!token) return null;

        return {
            Authorization: `Bearer ${token}`
        };
    }, []);

    /* =====================================================
       FETCH CART
    ===================================================== */

    const fetchCart = useCallback(async () => {
        const headers = authHeaders();

        if (!headers) {
            navigate("/login");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get("/getCart", {
                headers
            });

            if (response.data.success) {
                const items = response.data.cart?.items || [];

                setCart(Array.isArray(items) ? items : []);
            } else {
                setError(
                    response.data.message ||
                    "Unable to load your cart."
                );
            }

        } catch (err) {
            console.error("Fetch cart error:", err);

            if (err.response?.status === 401) {
                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load your cart. Please try again."
            );

        } finally {
            setLoading(false);
        }
    }, [authHeaders, navigate]);

    /* =====================================================
       LOAD CART
    ===================================================== */

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    /* =====================================================
       REMOVE ONE PRODUCT
    ===================================================== */

    const removeProduct = async (productId) => {
        if (!productId || deletingProduct || clearingCart) return;

        const confirmed = window.confirm(
            "Are you sure you want to remove this product from your cart?"
        );

        if (!confirmed) return;

        try {
            setDeletingProduct(productId);

            const response = await api.delete(
                `/removeCart/${productId}`,
                {
                    headers: authHeaders()
                }
            );

            if (response.data.success) {
                setCart((previousCart) =>
                    previousCart.filter(
                        (item) =>
                            item.product?._id !== productId
                    )
                );

                showToast(
                    response.data.message ||
                    "Product removed from your cart.",
                    "success"
                );
            } else {
                showToast(
                    response.data.message ||
                    "Unable to remove product.",
                    "error"
                );
            }

        } catch (err) {
            console.error("Remove product error:", err);

            if (err.response?.status === 401) {
                navigate("/login");
                return;
            }

            showToast(
                err.response?.data?.message ||
                "Failed to remove product. Please try again.",
                "error"
            );

        } finally {
            setDeletingProduct(null);
        }
    };

    /* =====================================================
       CLEAR ENTIRE CART
    ===================================================== */

    const clearCart = async () => {
        if (cart.length === 0 || clearingCart || deletingProduct) return;

        const confirmed = window.confirm(
            "Are you sure you want to remove ALL products from your cart? This action cannot be undone."
        );

        if (!confirmed) return;

        try {
            setClearingCart(true);

            const response = await api.delete("/clearCart", {
                headers: authHeaders()
            });

            if (response.data.success) {
                setCart([]);

                showToast(
                    response.data.message ||
                    "Your cart has been cleared successfully.",
                    "success"
                );
            } else {
                showToast(
                    response.data.message ||
                    "Unable to clear your cart.",
                    "error"
                );
            }

        } catch (err) {
            console.error("Clear cart error:", err);

            if (err.response?.status === 401) {
                navigate("/login");
                return;
            }

            showToast(
                err.response?.data?.message ||
                "Failed to clear your cart. Please try again.",
                "error"
            );

        } finally {
            setClearingCart(false);
        }
    };

    /* =====================================================
       CART CALCULATIONS
    ===================================================== */

    const validItems = cart.filter(
        (item) => item.product
    );

    const totalItems = validItems.reduce(
        (total, item) =>
            total + Number(item.quantity || 0),
        0
    );

    const totalPrice = validItems.reduce(
        (total, item) =>
            total +
            Number(item.product.price || 0) *
            Number(item.quantity || 0),
        0
    );

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <main className="cart-page">
                <div className="cart-loading">
                    <div className="cart-spinner"></div>
                    <h3>Loading your cart...</h3>
                    <p>Please wait while we retrieve your products.</p>
                </div>
            </main>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {
        return (
            <main className="cart-page">
                <div className="cart-error">
                    <div className="cart-error-icon">!</div>

                    <h2>Something went wrong</h2>

                    <p>{error}</p>

                    <button onClick={fetchCart}>
                        Try Again
                    </button>
                </div>
            </main>
        );
    }

    /* =====================================================
       MAIN UI
    ===================================================== */

    return (
        <main className="cart-page">

            {/* POPUP MESSAGE */}

            {toast && (
                <div
                    key={toast.id}
                    className={`cart-toast ${toast.type}`}
                    role={toast.type === "error" ? "alert" : "status"}
                >
                    <span className="cart-toast-icon">
                        {toast.type === "success" ? "✓" : "!"}
                    </span>

                    <span className="cart-toast-message">
                        {toast.message}
                    </span>

                    <button
                        type="button"
                        className="cart-toast-close"
                        onClick={() => setToast(null)}
                        aria-label="Close notification"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* HEADER */}

            <header className="cart-header">
                <div>
                    <span className="cart-eyebrow">
                        YOUR SHOPPING
                    </span>

                    <h1>My Shopping Cart</h1>

                    <p>
                        You have{" "}
                        <strong>{totalItems}</strong>{" "}
                        {totalItems === 1 ? "item" : "items"} in your cart.
                    </p>
                </div>

                <button
                    className="continue-shopping"
                    onClick={() => navigate("/dashboard")}
                >
                    <span>←</span>
                    Continue Shopping
                </button>
            </header>

            {/* EMPTY CART */}

            {validItems.length === 0 ? (
                <section className="empty-cart">

                    <div className="empty-cart-icon">
                        <svg
                            viewBox="0 0 24 24"
                            width="60"
                            height="60"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                    </div>

                    <h2>Your cart is empty</h2>

                    <p>
                        You haven't added any products to your cart yet.
                        Discover something you love.
                    </p>

                    <button
                        onClick={() => navigate("/dashboard")}
                    >
                        Start Shopping
                    </button>

                </section>
            ) : (

                <div className="cart-content">

                    {/* CART ITEMS */}

                    <section className="cart-items">

                        <div className="cart-items-heading">
                            <div>
                                <h2>Your Items</h2>
                                <span>{totalItems} items</span>
                            </div>

                            <button
                                type="button"
                                className="clear-cart-btn"
                                onClick={clearCart}
                                disabled={clearingCart || !!deletingProduct}
                            >
                                {clearingCart
                                    ? "Clearing..."
                                    : "Clear Cart"}
                            </button>
                        </div>

                        {validItems.map((item, index) => {
                            const product = item.product;
                            const quantity = Number(item.quantity || 0);
                            const price = Number(product.price || 0);
                            const image = getProductImage(product);

                            return (
                                <article
                                    className="cart-item"
                                    key={item._id || product._id || index}
                                >

                                    {/* PRODUCT IMAGE */}

                                    <div className="cart-product-image">

                                        {image && (
                                            <img
                                                src={image}
                                                alt={product.name || "Product"}
                                                loading="lazy"
                                                onError={(event) => {
                                                    event.currentTarget.style.display = "none";

                                                    const fallback =
                                                        event.currentTarget.parentElement.querySelector(
                                                            ".no-product-image"
                                                        );

                                                    if (fallback) {
                                                        fallback.style.display = "grid";
                                                    }
                                                }}
                                            />
                                        )}

                                        <div
                                            className="no-product-image"
                                            style={{
                                                display: image ? "none" : "grid"
                                            }}
                                        >
                                            <span>No Image Available</span>
                                        </div>

                                    </div>

                                    {/* PRODUCT DETAILS */}

                                    <div className="cart-product-details">

                                        <h3>{product.name}</h3>

                                        {product.category && (
                                            <span className="cart-product-category">
                                                {product.category}
                                            </span>
                                        )}

                                        <p className="cart-product-price">
                                            {formatPrice(price)}
                                        </p>

                                        <p className="cart-product-quantity">
                                            Quantity: {quantity}
                                        </p>

                                        <p className="cart-subtotal">
                                            Subtotal:{" "}
                                            <strong>
                                                {formatPrice(price * quantity)}
                                            </strong>
                                        </p>

                                        {/* REMOVE PRODUCT BUTTON */}

                                        <button
                                            type="button"
                                            className="remove-cart-item-btn"
                                            onClick={() =>
                                                removeProduct(product._id)
                                            }
                                            disabled={
                                                deletingProduct === product._id ||
                                                clearingCart
                                            }
                                        >
                                            {deletingProduct === product._id
                                                ? "Removing..."
                                                : "Remove"}
                                        </button>

                                    </div>

                                    {/* ITEM TOTAL */}

                                    <div className="cart-item-total">
                                        <span>Item Total</span>

                                        <strong>
                                            {formatPrice(price * quantity)}
                                        </strong>
                                    </div>

                                </article>
                            );
                        })}

                    </section>

                    {/* ORDER SUMMARY */}

                    <aside className="cart-summary">

                        <h2>Order Summary</h2>

                        <div className="summary-row">
                            <span>Total Items</span>
                            <span>{totalItems}</span>
                        </div>

                        <div className="summary-row">
                            <span>Different Products</span>
                            <span>{validItems.length}</span>
                        </div>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>{formatPrice(totalPrice)}</span>
                        </div>

                        <div className="summary-row">
                            <span>Delivery</span>
                            <span>At checkout</span>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-total">
                            <span>Total</span>
                            <strong>{formatPrice(totalPrice)}</strong>
                        </div>

                        <button
                            className="checkout-btn"
                            onClick={() => navigate("/checkout")}
                        >
                            Proceed to Checkout
                            <span>→</span>
                        </button>

                        <button
                            className="cart-refresh-btn"
                            onClick={fetchCart}
                        >
                            Refresh Cart
                        </button>

                        <p className="cart-secure-note">
                            Your cart is saved to your account.
                        </p>

                    </aside>

                </div>
            )}

        </main>
    );
}

export default Cart;
