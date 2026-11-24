import { useEffect, useState } from "react";
import AdminNavbar from "./AdminNavbar";
import api from "./api";
import "./ManageOrders.css";
import { useNavigate } from "react-router-dom";

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

function ManageOrders() {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editStatus, setEditStatus] = useState("Pending");
    const [saving, setSaving] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const navigate = useNavigate();

    const getAuthConfig = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchOrders = async () => {
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
                console.log(res.data.message);
            }
        } catch (error) {
            console.error(
                "Fetching Orders Error:",
                error.response?.status,
                error.response?.data || error.message
            );
            if (error.response?.status === 401) navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const getCustomerName = (order) =>
        order.customer?.username ||
        order.customer?.name ||
        order.customerName ||
        "Unknown";

    /* ---------- UPDATE ---------- */
    const openOrder = (order) => {
        setSelectedOrder(order);
        setEditStatus(order.status || "Pending");
    };

    const closeModal = () => {
        setSelectedOrder(null);
        setSaving(false);
    };

    
const saveStatus = async () => {
    if (!selectedOrder) return;

    try {
        setSaving(true);

        const config = getAuthConfig();

        if (!config) {
            navigate("/login");
            return;
        }

        const res = await api.put(
            `/updateOrder/${selectedOrder._id}`,
            { status: editStatus },
            config
        );

        if (res.data.success) {
            setOrders((prev) =>
                prev.map((order) =>
                    order._id === selectedOrder._id
                        ? res.data.order
                        : order
                )
            );

            setSelectedOrder(res.data.order);

            alert("Order updated successfully.");
        }

    } catch (error) {
        console.error(
            "Updating order error:",
            error.response?.data || error.message
        );

        alert(error.response?.data?.message || "Unable to update order.");

    } finally {
        setSaving(false);
    }
};

   
const confirmDelete = async () => {
    if (!orderToDelete) return;

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
            setOrders((prev) =>
                prev.filter((order) => order._id !== orderToDelete._id)
            );

            if (selectedOrder?._id === orderToDelete._id) {
                setSelectedOrder(null);
            }

            setOrderToDelete(null);

            alert("Order deleted successfully.");
        }

    } catch (error) {
        console.error(
            "Deleting order error:",
            error.response?.data || error.message
        );

        alert(error.response?.data?.message || "Unable to delete order.");

    } finally {
        setDeleting(false);
    }
};

    /* ---------- FILTER + STATS ---------- */
    const filteredOrders = orders.filter((order) => {
        const customer = getCustomerName(order);
        const term = search.toLowerCase();

        const matchesSearch =
            customer.toLowerCase().includes(term) ||
            order._id.toLowerCase().includes(term);

        const matchesFilter = filter === "All" || order.status === filter;

        return matchesSearch && matchesFilter;
    });

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => (o.status || "Pending") === "Pending").length;
    const completedOrders = orders.filter((o) => o.status === "Delivered").length;
    const cancelledOrders = orders.filter((o) => o.status === "Cancelled").length;

    return (
        <div className="Manage-orders-page">
            <AdminNavbar />

            <main className="manage-orders-container">
                <div className="orders-header">
                    <div>
                        <span className="orders-subtitle">ADMINISTRATION</span>
                        <h1>Manage Orders</h1>
                        <p>Track, update and delete customer orders.</p>
                    </div>

                    <button className="refresh-orders" onClick={fetchOrders}>
                        ↻ Refresh Orders
                    </button>
                </div>

                {/* Statistics */}
                <div className="orders-stats">
                    <div className="order-stat-card">
                        <span>Total Orders</span>
                        <h2>{totalOrders}</h2>
                    </div>
                    <div className="order-stat-card pending">
                        <span>Pending Orders</span>
                        <h2>{pendingOrders}</h2>
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

                {/* Orders Table */}
                <section className="orders-table-section">
                    <div className="orders-toolbar">
                        <div>
                            <h2>Customer Orders</h2>
                            <p>View, update and delete all placed orders.</p>
                        </div>

                        <div className="orders-controls">
                            <input
                                type="text"
                                placeholder="Search customer or order ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                                <option value="All">All Orders</option>
                                {STATUSES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="orders-message">Loading orders...</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="orders-message">
                            <h3>No orders found</h3>
                            <p>Customer orders will appear here.</p>
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
                                            <td>#{order._id.slice(-7).toUpperCase()}</td>
                                            <td>{getCustomerName(order)}</td>
                                            <td>
                                                {order.createdAt
                                                    ? new Date(order.createdAt).toLocaleDateString()
                                                    : "N/A"}
                                            </td>
                                            <td>{order.items?.length || 0}</td>
                                            <td>{Number(order.totalAmount || 0).toLocaleString()} RWF</td>
                                            <td>
                                                <span className={`order-status ${(order.status || "pending").toLowerCase()}`}>
                                                    {order.status || "Pending"}
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

                {/* Order Details / Update Modal */}
                {selectedOrder && (
                    <div className="order-modal-overlay" onClick={closeModal}>
                        <div className="order-modal" onClick={(e) => e.stopPropagation()}>
                            <button className="close-order-modal" onClick={closeModal}>×</button>

                            <h2>Order Details</h2>

                            <p>Order ID: #{selectedOrder._id}</p>
                            <p>Customer: {getCustomerName(selectedOrder)}</p>
                            <p>
                                Date:{" "}
                                {selectedOrder.createdAt
                                    ? new Date(selectedOrder.createdAt).toLocaleString()
                                    : "N/A"}
                            </p>
                            <p>Total: {Number(selectedOrder.totalAmount || 0).toLocaleString()} RWF</p>

                            <h3>Order Items</h3>

                            {selectedOrder.items?.map((item, index) => (
                                <div className="order-detail-item" key={index}>
                                    <span>
                                        {item.product?.name || item.productName || item.name || "Product"}
                                    </span>
                                    <span>Qty: {item.quantity || 1}</span>
                                </div>
                            ))}

                            <label>Update Order Status</label>

                            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                                {STATUSES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>

                            <div className="order-modal-actions">
                                <button
                                    className="save-order-btn"
                                    onClick={saveStatus}
                                    disabled={saving || editStatus === (selectedOrder.status || "Pending")}
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                    className="delete-order-btn"
                                    onClick={() => setOrderToDelete(selectedOrder)}
                                >
                                    Delete Order
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation */}
                {orderToDelete && (
                    <div
                        className="order-modal-overlay confirm-overlay"
                        onClick={() => !deleting && setOrderToDelete(null)}
                    >
                        <div className="order-modal confirm-modal" onClick={(e) => e.stopPropagation()}>
                            <h2>Delete Order?</h2>
                            <p>
                                This will permanently delete order{" "}
                                <strong>#{orderToDelete._id.slice(-7).toUpperCase()}</strong> from{" "}
                                <strong>{getCustomerName(orderToDelete)}</strong>. This cannot be undone.
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