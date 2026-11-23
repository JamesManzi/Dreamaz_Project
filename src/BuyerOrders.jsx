
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBoxOpen,
    faTruck,
    faCheckCircle,
    faClock,
    faTimesCircle,
    faEye,
    faShoppingBag,
    faRotate,
    faLocationDot,
    faCalendarDays,
    faCreditCard,
    faXmark
} from "@fortawesome/free-solid-svg-icons";

import api from "./api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./BuyerOrders.css";

function BuyerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/getBuyerOrders");

            const orderData = response.data.orders || response.data;

            setOrders(Array.isArray(orderData) ? orderData : []);

        } catch (err) {
            console.error("Buyer orders error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load your orders. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const getStatus = (status) => {
        const normalized = (status || "Pending").toLowerCase();

        if (normalized.includes("deliver")) return "Delivered";
        if (normalized.includes("cancel")) return "Cancelled";
        if (normalized.includes("ship") || normalized.includes("transit")) return "Shipped";
        if (normalized.includes("process")) return "Processing";
        if (normalized.includes("confirm")) return "Confirmed";

        return "Pending";
    };

    const getStatusIcon = (status) => {
        switch (getStatus(status)) {
            case "Delivered":
                return faCheckCircle;
            case "Cancelled":
                return faTimesCircle;
            case "Shipped":
                return faTruck;
            case "Processing":
                return faRotate;
            case "Confirmed":
                return faCheckCircle;
            default:
                return faClock;
        }
    };

    const getStatusClass = (status) => {
        return getStatus(status).toLowerCase();
    };

    const formatDate = (date) => {
        if (!date) return "Date unavailable";

        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const formatPrice = (amount) => {
        return `${Number(amount || 0).toLocaleString()} RWF`;
    };

    const getOrderId = (order) => {
        return order._id?.slice(-8).toUpperCase() || "N/A";
    };

    const getItems = (order) => {
        return order.items || order.products || [];
    };

    const getItemName = (item) => {
        return item.product?.name ||
            item.productName ||
            item.name ||
            "Product";
    };

    const getItemImage = (item) => {
        return item.product?.image ||
            item.productImage ||
            item.image ||
            "";
    };

    const getItemQuantity = (item) => {
        return item.quantity || 1;
    };

    const filteredOrders = orders.filter((order) => {
        const status = getStatus(order.status);

        const matchesFilter =
            activeFilter === "All" || status === activeFilter;

        const matchesSearch =
            getOrderId(order).toLowerCase().includes(searchTerm.toLowerCase()) ||
            getItems(order).some(item =>
                getItemName(item).toLowerCase().includes(searchTerm.toLowerCase())
            );

        return matchesFilter && matchesSearch;
    });

    const getProgress = (status) => {
        switch (getStatus(status)) {
            case "Confirmed":
                return 25;
            case "Processing":
                return 50;
            case "Shipped":
                return 75;
            case "Delivered":
                return 100;
            default:
                return 0;
        }
    };

    const filters = [
        "All",
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled"
    ];

    const totalSpent = orders
        .filter(order => getStatus(order.status) !== "Cancelled")
        .reduce((total, order) => total + Number(order.totalAmount || 0), 0);

    return (
        <div className="buyer-orders-page">

            <Navbar />

            <main className="buyer-orders-main">

                {/* PAGE HEADER */}
                <section className="buyer-orders-header">
                    <div>
                        <span className="buyer-orders-subtitle">
                            YOUR PURCHASES
                        </span>

                        <h1>My Orders</h1>

                        <p>
                            Track your purchases and stay updated on your deliveries.
                        </p>
                    </div>

                    <button
                        className="buyer-refresh-btn"
                        onClick={fetchOrders}
                    >
                        <FontAwesomeIcon icon={faRotate} />
                        Refresh Orders
                    </button>
                </section>

                {/* ORDER STATISTICS */}
                <section className="buyer-order-stats">

                    <div className="buyer-stat-card">
                        <div className="buyer-stat-icon blue">
                            <FontAwesomeIcon icon={faShoppingBag} />
                        </div>

                        <div>
                            <span>Total Orders</span>
                            <h2>{orders.length}</h2>
                        </div>
                    </div>

                    <div className="buyer-stat-card">
                        <div className="buyer-stat-icon orange">
                            <FontAwesomeIcon icon={faClock} />
                        </div>

                        <div>
                            <span>Pending Orders</span>
                            <h2>
                                {orders.filter(o => getStatus(o.status) === "Pending").length}
                            </h2>
                        </div>
                    </div>

                    <div className="buyer-stat-card">
                        <div className="buyer-stat-icon purple">
                            <FontAwesomeIcon icon={faTruck} />
                        </div>

                        <div>
                            <span>In Progress</span>
                            <h2>
                                {orders.filter(o =>
                                    ["Confirmed", "Processing", "Shipped"].includes(getStatus(o.status))
                                ).length}
                            </h2>
                        </div>
                    </div>

                    <div className="buyer-stat-card">
                        <div className="buyer-stat-icon green">
                            <FontAwesomeIcon icon={faCheckCircle} />
                        </div>

                        <div>
                            <span>Total Spent</span>
                            <h2>{formatPrice(totalSpent)}</h2>
                        </div>
                    </div>

                </section>

                {/* ORDERS SECTION */}
                <section className="buyer-orders-content">

                    <div className="buyer-orders-toolbar">
                        <div>
                            <h2>Order History</h2>
                            <p>Manage and track all your orders.</p>
                        </div>

                        <input
                            type="text"
                            placeholder="Search order or product..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* FILTERS */}
                    <div className="buyer-order-filters">
                        {filters.map(filter => (
                            <button
                                key={filter}
                                className={activeFilter === filter ? "active" : ""}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter}
                                {filter === "All" && (
                                    <span>{orders.length}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* LOADING */}
                    {loading && (
                        <div className="buyer-orders-loading">
                            <div className="buyer-loader"></div>
                            <p>Loading your orders...</p>
                        </div>
                    )}

                    {/* ERROR */}
                    {!loading && error && (
                        <div className="buyer-orders-error">
                            <p>{error}</p>
                            <button onClick={fetchOrders}>Try Again</button>
                        </div>
                    )}

                    {/* EMPTY ORDERS */}
                    {!loading && !error && filteredOrders.length === 0 && (
                        <div className="buyer-orders-empty">
                            <div>
                                <FontAwesomeIcon icon={faBoxOpen} />
                            </div>

                            <h3>
                                {orders.length === 0
                                    ? "No orders yet"
                                    : "No matching orders"}
                            </h3>

                            <p>
                                {orders.length === 0
                                    ? "Your purchases will appear here when you place an order."
                                    : "Try changing your search or order filter."}
                            </p>
                        </div>
                    )}

                    {/* ORDERS LIST */}
                    {!loading && !error && filteredOrders.length > 0 && (
                        <div className="buyer-orders-list">

                            {filteredOrders.map(order => {
                                const status = getStatus(order.status);
                                const items = getItems(order);

                                return (
                                    <article
                                        className="buyer-order-card"
                                        key={order._id}
                                    >

                                        <div className="buyer-order-top">

                                            <div>
                                                <span className="buyer-order-label">
                                                    ORDER ID
                                                </span>

                                                <h3>#{getOrderId(order)}</h3>
                                            </div>

                                            <span className={`buyer-order-status ${getStatusClass(order.status)}`}>
                                                <FontAwesomeIcon icon={getStatusIcon(order.status)} />
                                                {status}
                                            </span>

                                        </div>

                                        <div className="buyer-order-info">
                                            <span>
                                                <FontAwesomeIcon icon={faCalendarDays} />
                                                {formatDate(order.createdAt)}
                                            </span>

                                            <span>
                                                <FontAwesomeIcon icon={faBoxOpen} />
                                                {items.length} {items.length === 1 ? "Item" : "Items"}
                                            </span>
                                        </div>

                                        <div className="buyer-order-products">

                                            {items.slice(0, 3).map((item, index) => (
                                                <div
                                                    className="buyer-order-product"
                                                    key={item._id || index}
                                                >
                                                    {getItemImage(item) ? (
                                                        <img
                                                            src={getItemImage(item)}
                                                            alt={getItemName(item)}
                                                        />
                                                    ) : (
                                                        <div className="buyer-product-placeholder">
                                                            <FontAwesomeIcon icon={faBoxOpen} />
                                                        </div>
                                                    )}

                                                    <div>
                                                        <h4>{getItemName(item)}</h4>
                                                        <p>
                                                            Quantity: {getItemQuantity(item)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}

                                            {items.length > 3 && (
                                                <span className="buyer-more-items">
                                                    +{items.length - 3} more items
                                                </span>
                                            )}

                                        </div>

                                        {/* TRACKING PROGRESS */}
                                        {status !== "Cancelled" && (
                                            <div className="buyer-order-tracking">

                                                <div className="buyer-tracking-heading">
                                                    <span>Delivery Progress</span>
                                                    <strong>{getProgress(order.status)}%</strong>
                                                </div>

                                                <div className="buyer-progress-bar">
                                                    <div
                                                        style={{
                                                            width: `${getProgress(order.status)}%`
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="buyer-order-bottom">

                                            <div>
                                                <span>Total Amount</span>
                                                <h3>{formatPrice(order.totalAmount)}</h3>
                                            </div>

                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                                View Details
                                            </button>

                                        </div>

                                    </article>
                                );
                            })}

                        </div>
                    )}

                </section>

            </main>

            {/* ORDER DETAILS MODAL */}
            {selectedOrder && (
                <div
                    className="buyer-order-modal-overlay"
                    onClick={() => setSelectedOrder(null)}
                >
                    <div
                        className="buyer-order-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="buyer-modal-header">
                            <div>
                                <span>ORDER DETAILS</span>
                                <h2>#{getOrderId(selectedOrder)}</h2>
                            </div>

                            <button
                                onClick={() => setSelectedOrder(null)}
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>

                        <div className="buyer-modal-status">
                            <span className={`buyer-order-status ${getStatusClass(selectedOrder.status)}`}>
                                <FontAwesomeIcon icon={getStatusIcon(selectedOrder.status)} />
                                {getStatus(selectedOrder.status)}
                            </span>

                            <p>
                                Placed on {formatDate(selectedOrder.createdAt)}
                            </p>
                        </div>

                        <div className="buyer-modal-section">
                            <h3>Purchased Products</h3>

                            {getItems(selectedOrder).map((item, index) => (
                                <div
                                    className="buyer-modal-product"
                                    key={item._id || index}
                                >

                                    {getItemImage(item) ? (
                                        <img
                                            src={getItemImage(item)}
                                            alt={getItemName(item)}
                                        />
                                    ) : (
                                        <div className="buyer-product-placeholder">
                                            <FontAwesomeIcon icon={faBoxOpen} />
                                        </div>
                                    )}

                                    <div className="buyer-modal-product-info">
                                        <h4>{getItemName(item)}</h4>
                                        <p>Quantity: {getItemQuantity(item)}</p>
                                    </div>

                                    <strong>
                                        {formatPrice(
                                            item.price * getItemQuantity(item)
                                        )}
                                    </strong>

                                </div>
                            ))}
                        </div>

                        <div className="buyer-modal-section buyer-modal-summary">
                            <h3>Order Summary</h3>

                            <div>
                                <span>Total Amount</span>
                                <strong>{formatPrice(selectedOrder.totalAmount)}</strong>
                            </div>

                            <div>
                                <span>Payment Method</span>
                                <strong>
                                    {selectedOrder.paymentMethod || "Not specified"}
                                </strong>
                            </div>

                            <div>
                                <span>Payment Status</span>
                                <strong>
                                    {selectedOrder.paymentStatus || "Not specified"}
                                </strong>
                            </div>
                        </div>

                        {selectedOrder.shippingAddress && (
                            <div className="buyer-modal-section">
                                <h3>
                                    <FontAwesomeIcon icon={faLocationDot} />
                                    Delivery Address
                                </h3>

                                <p className="buyer-delivery-address">
                                    {typeof selectedOrder.shippingAddress === "string"
                                        ? selectedOrder.shippingAddress
                                        : [
                                            selectedOrder.shippingAddress.address,
                                            selectedOrder.shippingAddress.city,
                                            selectedOrder.shippingAddress.country
                                        ].filter(Boolean).join(", ")}
                                </p>
                            </div>
                        )}

                        <button
                            className="buyer-modal-close"
                            onClick={() => setSelectedOrder(null)}
                        >
                            Close Details
                        </button>

                    </div>
                </div>
            )}

            <Footer />

        </div>
    );
}

export default BuyerOrders;
