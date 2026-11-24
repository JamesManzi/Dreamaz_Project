
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import AdminNavbar from "./AdminNavbar";
import api from "./api";
import "./ManageOrders.css";

const STATUSES = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled"
];

function ManageOrders() {

    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editStatus, setEditStatus] = useState("Pending");
    const [orderToDelete, setOrderToDelete] = useState(null);

    const navigate = useNavigate();

    // AUTH CONFIGURATION
    const getAuthConfig = () => {
        const token = localStorage.getItem("token");

        if (!token) return null;

        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    };

    // FETCH ALL ORDERS
    const fetchOrders = useCallback(async () => {

        try {

            setLoading(true);

            const config = getAuthConfig();

            if (!config) {
                navigate("/login");
                return;
            }

            const res = await api.get("/getAllOrders", config);

            if (res.data.success) {

                setOrders(res.data.orders || []);

            } else {

                console.error("Fetching orders:", res.data.message);

            }

        } catch (error) {

            console.error(
                "Fetching Orders Error:",
                error.response?.data || error.message
            );

            if (error.response?.status === 401) {
                navigate("/login");
            }

        } finally {

            setLoading(false);

        }

    }, [navigate]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);


    // GET CUSTOMER NAME
    const getCustomerName = (order) => {

        return (
            order.buyer?.username ||
            order.buyer?.name ||
            order.buyer?.fullName ||
            order.shippingAddress?.fullName ||
            order.customerName ||
            "Unknown Customer"
        );

    };


    // OPEN ORDER DETAILS
    const openOrder = (order) => {

        setSelectedOrder(order);

        setEditStatus(order.orderStatus || "Pending");

    };


    // CLOSE ORDER MODAL
    const closeModal = () => {

        if (saving) return;

        setSelectedOrder(null);

    };


    // UPDATE ORDER STATUS
    const saveStatus = async () => {

        if (!selectedOrder || saving) return;

        try {

            setSaving(true);

            const config = getAuthConfig();

            if (!config) {
                navigate("/login");
                return;
            }

            const res = await api.put(
                `/updateOrder/${selectedOrder._id}`,
                {
                    orderStatus: editStatus
                },
                config
            );

            if (!res.data.success || !res.data.order) {

                throw new Error(
                    res.data.message || "Order update failed"
                );

            }

            // Use the updated order returned by MongoDB
            const updatedOrder = res.data.order;

            // Update React state
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === updatedOrder._id
                        ? updatedOrder
                        : order
                )
            );

            // Update selected order
            setSelectedOrder(updatedOrder);

            // Update selected status
            setEditStatus(updatedOrder.orderStatus);

            alert("Order status updated successfully!");

        } catch (error) {

            console.error(
                "Updating Order Error:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                error.message ||
                "Unable to update order."
            );

        } finally {

            setSaving(false);

        }

    };


    // DELETE ORDER
    const confirmDelete = async () => {

        if (!orderToDelete || deleting) return;

        try {

            setDeleting(true);

            const config = getAuthConfig();

            if (!config) {
                navigate("/login");
                return;
            }

            const res = await api.delete(
                `/order/${orderToDelete._id}`,
                config
            );

            if (res.data.success) {

                setOrders((prevOrders) =>
                    prevOrders.filter(
                        (order) => order._id !== orderToDelete._id
                    )
                );

                if (selectedOrder?._id === orderToDelete._id) {
                    setSelectedOrder(null);
                }

                setOrderToDelete(null);

                alert("Order deleted successfully!");

            }

        } catch (error) {

            console.error(
                "Deleting Order Error:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Unable to delete order."
            );

        } finally {

            setDeleting(false);

        }

    };


    // SEARCH AND FILTER
    const filteredOrders = orders.filter((order) => {

        const customer = getCustomerName(order).toLowerCase();

        const term = search.toLowerCase();

        const matchesSearch =
            customer.includes(term) ||
            order._id.toLowerCase().includes(term);

        const matchesFilter =
            filter === "All" ||
            (order.orderStatus || "Pending") === filter;

        return matchesSearch && matchesFilter;

    });


    // ORDER STATISTICS
    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
        (order) => (order.orderStatus || "Pending") === "Pending"
    ).length;

    const processingOrders = orders.filter(
        (order) => order.orderStatus === "Processing"
    ).length;

    const completedOrders = orders.filter(
        (order) => order.orderStatus === "Delivered"
    ).length;

    const cancelledOrders = orders.filter(
        (order) => order.orderStatus === "Cancelled"
    ).length;


    // FORMAT CURRENCY
    const formatPrice = (amount) => {

        return `${Number(amount || 0).toLocaleString()} RWF`;

    };


    return (

        <div className="Manage-orders-page">

            <AdminNavbar />

            <main className="manage-orders-container">

                {/* HEADER */}
                <div className="orders-header">

                    <div>

                        <span className="orders-subtitle">
                            ADMINISTRATION
                        </span>

                        <h1>Manage Orders</h1>

                        <p>
                            Track, update and manage customer orders.
                        </p>

                    </div>

                    <button
                        className="refresh-orders"
                        onClick={fetchOrders}
                        disabled={loading}
                    >
                        ↻ {loading ? "Refreshing..." : "Refresh Orders"}
                    </button>

                </div>


                {/* STATISTICS */}
                <div className="orders-stats">

                    <div className="order-stat-card">

                        <span>Total Orders</span>

                        <h2>{totalOrders}</h2>

                    </div>

                    <div className="order-stat-card pending">

                        <span>Pending Orders</span>

                        <h2>{pendingOrders}</h2>

                    </div>

                    <div className="order-stat-card">

                        <span>Processing Orders</span>

                        <h2>{processingOrders}</h2>

                    </div>

                    <div className="order-stat-card completed">

                        <span>Delivered Orders</span>

                        <h2>{completedOrders}</h2>

                    </div>

                    <div className="order-stat-card cancelled">

                        <span>Cancelled Orders</span>

                        <h2>{cancelledOrders}</h2>

                    </div>

                </div>


                {/* ORDERS TABLE */}
                <section className="orders-table-section">

                    <div className="orders-toolbar">

                        <div>

                            <h2>Customer Orders</h2>

                            <p>
                                View, update and delete all placed orders.
                            </p>

                        </div>


                        <div className="orders-controls">

                            <input
                                type="text"
                                placeholder="Search customer or order ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >

                                <option value="All">All Orders</option>

                                {STATUSES.map((status) => (

                                    <option key={status} value={status}>
                                        {status}
                                    </option>

                                ))}

                            </select>

                        </div>

                    </div>


                    {loading ? (

                        <div className="orders-message">
                            Loading orders...
                        </div>

                    ) : filteredOrders.length === 0 ? (

                        <div className="orders-message">

                            <h3>No orders found</h3>

                            <p>
                                Customer orders will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="orders-table-wrapper">

                            <table className="orders-table">

                                <thead>

                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredOrders.map((order) => (

                                        <tr key={order._id}>

                                            <td>
                                                #{order._id.slice(-7).toUpperCase()}
                                            </td>

                                            <td>
                                                {getCustomerName(order)}
                                            </td>

                                            <td>
                                                {order.createdAt
                                                    ? new Date(order.createdAt).toLocaleDateString()
                                                    : "N/A"}
                                            </td>

                                            <td>
                                                {order.items?.length || 0}
                                            </td>

                                            <td>
                                                {formatPrice(order.totalAmount)}
                                            </td>

                                            <td>

                                                <span
                                                    className={`order-status ${(order.orderStatus || "Pending").toLowerCase()}`}
                                                >
                                                    {order.orderStatus || "Pending"}
                                                </span>

                                            </td>

                                            <td>

                                                <div className="order-actions">

                                                    <button
                                                        className="view-order-btn"
                                                        onClick={() => openOrder(order)}
                                                    >
                                                        View / Update
                                                    </button>

                                                    <button
                                                        className="delete-order-btn"
                                                        onClick={() => setOrderToDelete(order)}
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>


                {/* ORDER DETAILS MODAL */}
                {selectedOrder && (

                    <div
                        className="order-modal-overlay"
                        onClick={closeModal}
                    >

                        <div
                            className="order-modal"
                            onClick={(e) => e.stopPropagation()}
                        >

                            <button
                                className="close-order-modal"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                ×
                            </button>


                            <h2>Order Details</h2>

                            <p>
                                Order ID: #{selectedOrder._id}
                            </p>

                            <p>
                                Customer: {getCustomerName(selectedOrder)}
                            </p>

                            <p>
                                Date: {
                                    selectedOrder.createdAt
                                        ? new Date(selectedOrder.createdAt).toLocaleString()
                                        : "N/A"
                                }
                            </p>

                            <p>
                                Total: {formatPrice(selectedOrder.totalAmount)}
                            </p>


                            <h3>Shipping Address</h3>

                            <p>
                                {selectedOrder.shippingAddress?.address || "N/A"}
                            </p>

                            <p>
                                {selectedOrder.shippingAddress?.city || "N/A"}
                            </p>

                            <p>
                                Phone: {selectedOrder.shippingAddress?.phone || "N/A"}
                            </p>


                            <h3>Order Items</h3>

                            {selectedOrder.items?.map((item, index) => (

                                <div
                                    className="order-detail-item"
                                    key={item._id || index}
                                >

                                    <span>
                                        {item.productName || "Product"}
                                    </span>

                                    <span>
                                        Qty: {item.quantity || 1}
                                    </span>

                                    <span>
                                        {formatPrice(item.subtotal)}
                                    </span>

                                </div>

                            ))}


                            <h3>Update Order Status</h3>

                            <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                disabled={saving}
                            >

                                {STATUSES.map((status) => (

                                    <option key={status} value={status}>
                                        {status}
                                    </option>

                                ))}

                            </select>


                            <div className="order-modal-actions">

                                <button
                                    className="save-order-btn"
                                    onClick={saveStatus}
                                    disabled={
                                        saving ||
                                        editStatus === (selectedOrder.orderStatus || "Pending")
                                    }
                                >

                                    {saving ? "Saving..." : "Save Changes"}

                                </button>


                                <button
                                    className="delete-order-btn"
                                    onClick={() => setOrderToDelete(selectedOrder)}
                                    disabled={saving}
                                >
                                    Delete Order
                                </button>

                            </div>

                        </div>

                    </div>

                )}


                {/* DELETE CONFIRMATION MODAL */}
                {orderToDelete && (

                    <div
                        className="order-modal-overlay confirm-overlay"
                        onClick={() => !deleting && setOrderToDelete(null)}
                    >

                        <div
                            className="order-modal confirm-modal"
                            onClick={(e) => e.stopPropagation()}
                        >

                            <h2>Delete Order?</h2>

                            <p>
                                This will permanently delete order{" "}
                                <strong>
                                    #{orderToDelete._id.slice(-7).toUpperCase()}
                                </strong>{" "}
                                from{" "}
                                <strong>
                                    {getCustomerName(orderToDelete)}
                                </strong>.
                                This cannot be undone.
                            </p>


                            <div className="order-modal-actions">

                                <button
                                    className="cancel-btn"
                                    onClick={() => setOrderToDelete(null)}
                                    disabled={deleting}
                                >
                                    Cancel
                                </button>


                                <button
                                    className="delete-order-btn solid"
                                    onClick={confirmDelete}
                                    disabled={deleting}
                                >

                                    {deleting ? "Deleting..." : "Yes, Delete"}

                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </main>

        </div>

    );

}

export default ManageOrders;
