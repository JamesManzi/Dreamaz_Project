
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    faXmark,
    faCreditCard,
    faMagnifyingGlass,
    faArrowRight,
    faReceipt,
    faShieldAlt
} from "@fortawesome/free-solid-svg-icons";

import api from "./api";
import DashboardNavbar from "./DashboardNavbar";
import Footer from "./Footer";
import "./BuyerOrders.css";

const FILTERS = [
    "All",
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled"
];

function BuyerOrders() {
    const navigate = useNavigate();

    // ==========================================
    // AUTHENTICATION
    // ==========================================

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    // ==========================================
    // STATE
    // ==========================================

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");

    // ==========================================
    // FETCH ORDERS
    // ==========================================

    const fetchOrders = useCallback(async (isRefresh = false) => {
        if (!token || !userId) {
            navigate("/login");
            return;
        }

        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await api.get("/myOrders", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log("Buyer orders response:", response.data);

            const receivedOrders = response.data?.orders;

            setOrders(
                Array.isArray(receivedOrders)
                    ? receivedOrders
                    : []
            );

        } catch (err) {
            console.error("Fetch orders error:", err);

            const statusCode = err.response?.status;

            if (statusCode === 401) {
                setError(
                    "Your session could not be authenticated. Please log in again."
                );
            } else if (statusCode === 403) {
                setError(
                    "You are not authorized to view these orders."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    "Unable to load your orders. Please try again."
                );
            }

            setOrders([]);

        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token, userId, navigate]);

    // ==========================================
    // INITIAL FETCH
    // ==========================================

    useEffect(() => {
        if (!token || !userId) {
            navigate("/login");
            return;
        }

        fetchOrders();
    }, [token, userId, navigate, fetchOrders]);

    // ==========================================
    // HELPERS
    // ==========================================

    const getStatus = (order) => {
        const value = String(
            order?.orderStatus ||
            order?.status ||
            "Pending"
        ).toLowerCase();

        if (value.includes("deliver")) return "Delivered";
        if (value.includes("cancel")) return "Cancelled";

        if (
            value.includes("ship") ||
            value.includes("transit")
        ) {
            return "Shipped";
        }

        if (value.includes("process")) return "Processing";
        if (value.includes("confirm")) return "Confirmed";

        return "Pending";
    };

    const getStatusIcon = (status) => {
        switch (status) {
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

    const getOrderId = (order) => {
        return order?._id
            ? order._id.slice(-8).toUpperCase()
            : "N/A";
    };

    const getItems = (order) => {
        return Array.isArray(order?.items)
            ? order.items
            : [];
    };

    const getItemName = (item) => {
        return (
            item?.productName ||
            item?.product?.name ||
            item?.product?.title ||
            "Product"
        );
    };

    const getItemImage = (item) => {
        const images = item?.product?.images;

        return (
            item?.product?.image ||
            item?.product?.imageUrl ||
            (Array.isArray(images) ? images[0] : images) ||
            item?.productImage ||
            item?.image ||
            ""
        );
    };

    const getItemQuantity = (item) => {
        return Math.max(1, Number(item?.quantity) || 1);
    };

    const getItemPrice = (item) => {
        return Number(item?.price) || 0;
    };

    const getOrderTotal = (order) => {
        if (
            order?.totalAmount !== undefined &&
            order?.totalAmount !== null
        ) {
            return Number(order.totalAmount) || 0;
        }

        return getItems(order).reduce((sum, item) => {
            const subtotal = item?.subtotal;

            return sum + (
                subtotal !== undefined && subtotal !== null
                    ? Number(subtotal) || 0
                    : getItemPrice(item) * getItemQuantity(item)
            );
        }, 0);
    };

    const formatPrice = (amount) => {
        return `${Number(amount || 0).toLocaleString("en-RW")} RWF`;
    };

    const formatDate = (date) => {
        if (!date) return "Date unavailable";

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
            return "Date unavailable";
        }

        return value.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const getProgress = (status) => {
        switch (status) {
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

    const getShippingAddress = (order) => {
        const address = order?.shippingAddress;

        if (!address) return "";

        if (typeof address === "string") {
            return address;
        }

        return [
            address.fullName,
            address.phone,
            address.address,
            address.city,
            address.country
        ].filter(Boolean).join(", ");
    };

    // ==========================================
    // FILTER ORDERS
    // ==========================================

    const filteredOrders = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();

        return orders.filter((order) => {
            const status = getStatus(order);

            const matchesFilter =
                activeFilter === "All" ||
                status === activeFilter;

            const matchesSearch =
                !search ||
                getOrderId(order).toLowerCase().includes(search) ||
                getItems(order).some((item) =>
                    getItemName(item).toLowerCase().includes(search)
                );

            return matchesFilter && matchesSearch;
        });
    }, [orders, activeFilter, searchTerm]);

    // ==========================================
    // STATISTICS
    // ==========================================

    const totalSpent = orders
        .filter(order => getStatus(order) !== "Cancelled")
        .reduce(
            (sum, order) => sum + getOrderTotal(order),
            0
        );

    const pendingCount = orders.filter(
        order => getStatus(order) === "Pending"
    ).length;

    const progressCount = orders.filter(
        order => [
            "Confirmed",
            "Processing",
            "Shipped"
        ].includes(getStatus(order))
    ).length;

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="buyer-orders-page">

            <DashboardNavbar />

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
                        type="button"
                        className="buyer-refresh-btn"
                        onClick={() => fetchOrders(true)}
                        disabled={loading || refreshing}
                    >
                        <FontAwesomeIcon
                            icon={faRotate}
                            spin={refreshing}
                        />

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh Orders"}
                    </button>

                </section>

                {/* STATISTICS */}

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
                            <h2>{pendingCount}</h2>
                        </div>
                    </div>

                    <div className="buyer-stat-card">
                        <div className="buyer-stat-icon purple">
                            <FontAwesomeIcon icon={faTruck} />
                        </div>

                        <div>
                            <span>In Progress</span>
                            <h2>{progressCount}</h2>
                        </div>
                    </div>

                    <div className="buyer-stat-card">
                        <div className="buyer-stat-icon green">
                            <FontAwesomeIcon icon={faCreditCard} />
                        </div>

                        <div>
                            <span>Total Spent</span>
                            <h2>{formatPrice(totalSpent)}</h2>
                        </div>
                    </div>

                </section>

                {/* ORDER HISTORY */}

                <section className="buyer-orders-content">

                    <div className="buyer-orders-toolbar">

                        <div>
                            <h2>Order History</h2>
                            <p>
                                Manage and track all your orders.
                            </p>
                        </div>

                        <div className="buyer-search">

                            <FontAwesomeIcon icon={faMagnifyingGlass} />

                            <input
                                type="text"
                                placeholder="Search order or product..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    aria-label="Clear search"
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            )}

                        </div>

                    </div>

                    {/* FILTER BUTTONS */}

                    <div className="buyer-order-filters">

                        {FILTERS.map(filter => (
                            <button
                                key={filter}
                                type="button"
                                className={
                                    activeFilter === filter
                                        ? "active"
                                        : ""
                                }
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

                            <FontAwesomeIcon icon={faTimesCircle} />

                            <h3>Unable to load orders</h3>

                            <p>{error}</p>

                            <button
                                type="button"
                                onClick={() => fetchOrders()}
                            >
                                <FontAwesomeIcon icon={faRotate} />
                                Try Again
                            </button>

                        </div>
                    )}

                    {/* EMPTY STATE */}

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

                            {orders.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveFilter("All");
                                        setSearchTerm("");
                                    }}
                                >
                                    Clear Filters
                                </button>
                            )}

                        </div>
                    )}

                    {/* ORDERS */}

                    {!loading && !error && filteredOrders.length > 0 && (
                        <div className="buyer-orders-list">

                            {filteredOrders.map(order => {
                                const status = getStatus(order);
                                const items = getItems(order);

                                return (
                                    <article
                                        className="buyer-order-card"
                                        key={order._id}
                                    >

                                        {/* ORDER TOP */}

                                        <div className="buyer-order-top">

                                            <div>
                                                <span className="buyer-order-label">
                                                    ORDER ID
                                                </span>

                                                <h3>
                                                    #{getOrderId(order)}
                                                </h3>
                                            </div>

                                            <span
                                                className={`buyer-order-status ${status.toLowerCase()}`}
                                            >
                                                <FontAwesomeIcon
                                                    icon={getStatusIcon(status)}
                                                />

                                                {status}
                                            </span>

                                        </div>

                                        {/* ORDER INFO */}

                                        <div className="buyer-order-info">

                                            <span>
                                                <FontAwesomeIcon icon={faCalendarDays} />
                                                {formatDate(order.createdAt)}
                                            </span>

                                            <span>
                                                <FontAwesomeIcon icon={faBoxOpen} />
                                                {items.length}{" "}
                                                {items.length === 1
                                                    ? "Item"
                                                    : "Items"}
                                            </span>

                                        </div>

                                        {/* PRODUCTS */}

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
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="buyer-product-placeholder">
                                                            <FontAwesomeIcon icon={faBoxOpen} />
                                                        </div>
                                                    )}

                                                    <div>
                                                        <h4>
                                                            {getItemName(item)}
                                                        </h4>

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

                                        {/* DELIVERY PROGRESS */}

                                        {status !== "Cancelled" && (
                                            <div className="buyer-order-tracking">

                                                <div className="buyer-tracking-heading">
                                                    <span>Delivery Progress</span>

                                                    <strong>
                                                        {getProgress(status)}%
                                                    </strong>
                                                </div>

                                                <div className="buyer-progress-bar">
                                                    <div
                                                        style={{
                                                            width: `${getProgress(status)}%`
                                                        }}
                                                    />
                                                </div>

                                            </div>
                                        )}

                                        {/* ORDER BOTTOM */}

                                        <div className="buyer-order-bottom">

                                            <div>
                                                <span>Total Amount</span>

                                                <h3>
                                                    {formatPrice(getOrderTotal(order))}
                                                </h3>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                                View Details
                                                <FontAwesomeIcon icon={faArrowRight} />
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

                        {/* MODAL HEADER */}

                        <div className="buyer-modal-header">

                            <div>
                                <span>ORDER DETAILS</span>

                                <h2>
                                    #{getOrderId(selectedOrder)}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedOrder(null)}
                                aria-label="Close modal"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>

                        </div>

                        {/* MODAL STATUS */}

                        <div className="buyer-modal-status">

                            <span
                                className={`buyer-order-status ${getStatus(selectedOrder).toLowerCase()}`}
                            >
                                <FontAwesomeIcon
                                    icon={getStatusIcon(getStatus(selectedOrder))}
                                />

                                {getStatus(selectedOrder)}
                            </span>

                            <p>
                                Placed on {formatDate(selectedOrder.createdAt)}
                            </p>

                        </div>

                        {/* PURCHASED PRODUCTS */}

                        <div className="buyer-modal-section">

                            <h3>
                                <FontAwesomeIcon icon={faReceipt} />
                                {" "}Purchased Products
                            </h3>

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

                                        <h4>
                                            {getItemName(item)}
                                        </h4>

                                        <p>
                                            Quantity: {getItemQuantity(item)}
                                        </p>

                                        <p>
                                            Unit price: {formatPrice(getItemPrice(item))}
                                        </p>

                                    </div>

                                    <strong>
                                        {formatPrice(
                                            item.subtotal ??
                                            getItemPrice(item) * getItemQuantity(item)
                                        )}
                                    </strong>

                                </div>
                            ))}

                        </div>

                        {/* ORDER SUMMARY */}

                        <div className="buyer-modal-section buyer-modal-summary">

                            <h3>Order Summary</h3>

                            <div>
                                <span>Total Amount</span>

                                <strong>
                                    {formatPrice(getOrderTotal(selectedOrder))}
                                </strong>
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

                        {/* DELIVERY ADDRESS */}

                        {getShippingAddress(selectedOrder) && (
                            <div className="buyer-modal-section">

                                <h3>
                                    <FontAwesomeIcon icon={faLocationDot} />
                                    {" "}Delivery Address
                                </h3>

                                <p className="buyer-delivery-address">
                                    {getShippingAddress(selectedOrder)}
                                </p>

                            </div>
                        )}

                        {/* MODAL FOOTER */}

                        <div className="buyer-modal-footer">

                            <span>
                                <FontAwesomeIcon icon={faShieldAlt} />
                                {" "}Your order information is protected.
                            </span>

                            <button
                                className="buyer-modal-close"
                                type="button"
                                onClick={() => setSelectedOrder(null)}
                            >
                                Close Details
                            </button>

                        </div>

                    </div>

                </div>
            )}

            <Footer />

        </div>
    );
}

export default BuyerOrders;
