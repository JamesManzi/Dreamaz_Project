
import { useEffect, useState } from "react";
import AdminNavbar from "./AdminNavbar";
import api from "./api";
import "./ManageOrders.css";
import { useNavigate } from "react-router-dom";
function ManageOrders() {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const navigate=useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
    try {
        setLoading(true);

        const token = localStorage.getItem("token");

        if(!token){
            navigate("/login");
        }
         const res = await api.get("/getAllOrders", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log("Orders:", res.data);

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
    } finally {
        setLoading(false);
    }
};

    const updateStatus = async (orderId, status) => {
        try {
            await api.put(`/updateOrderStatus/${orderId}`, { status });

            setOrders(prev =>
                prev.map(order =>
                    order._id === orderId
                        ? { ...order, status }
                        : order
                )
            );

            setSelectedOrder(prev =>
                prev ? { ...prev, status } : null
            );
        } catch (error) {
            console.error("Error updating order:", error);
            alert("Unable to update order status.");
        }
    };

    const filteredOrders = orders.filter(order => {
        const customer =
            order.customer?.username ||
            order.customer?.name ||
            order.customerName ||
            "";

        const matchesSearch =
            customer.toLowerCase().includes(search.toLowerCase()) ||
            order._id.toLowerCase().includes(search.toLowerCase());

        const matchesFilter =
            filter === "All" || order.status === filter;

        return matchesSearch && matchesFilter;
    });

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.orderStatus === "Pending").length;
    const completedOrders = orders.filter(o => o.orderStatus === "Delivered").length;
    const cancelledOrders = orders.filter(o => o.orderStatus === "Cancelled").length;

    return (
        <div className="Manage-orders-page">
            <AdminNavbar />

            <main className="manage-orders-container">

                <div className="orders-header">
                    <div>
                        <span className="orders-subtitle">ADMINISTRATION</span>
                        <h1>Manage Orders</h1>
                        <p>Track, manage and monitor customer orders.</p>
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
                            <p>View and manage all placed orders.</p>
                        </div>

                        <div className="orders-controls">
                            <input
                                type="text"
                                placeholder="Search customer or order ID..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />

                            <select
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                            >
                                <option value="All">All Orders</option>
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
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
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredOrders.map(order => (
                                        <tr key={order._id}>
                                            <td>
                                                #{order._id.slice(-7).toUpperCase()}
                                            </td>

                                            <td>
                                                {order.customer?.username ||
                                                 order.customer?.name ||
                                                 order.customerName ||
                                                 "Unknown"}
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
                                                {Number(order.totalAmount || 0).toLocaleString()} RWF
                                            </td>

                                            <td>
                                                <span className={`order-status ${order.status?.toLowerCase()}`}>
                                                    {order.status || "Pending"}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    className="view-order-btn"
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </section>

                {/* Order Details Modal */}
                {selectedOrder && (
                    <div className="order-modal-overlay"
                        onClick={() => setSelectedOrder(null)}>

                        <div className="order-modal"
                            onClick={e => e.stopPropagation()}>

                            <button
                                className="close-order-modal"
                                onClick={() => setSelectedOrder(null)}
                            >
                                ×
                            </button>

                            <h2>Order Details</h2>

                            <p>
                                Order ID: #{selectedOrder._id}
                            </p>

                            <p>
                                Customer: {
                                    selectedOrder.customer?.username ||
                                    selectedOrder.customer?.name ||
                                    selectedOrder.customerName ||
                                    "Unknown"
                                }
                            </p>

                            <p>
                                Total: {Number(selectedOrder.totalAmount || 0).toLocaleString()} RWF
                            </p>

                            <h3>Order Items</h3>

                            {selectedOrder.items?.map((item, index) => (
                                <div className="order-detail-item" key={index}>
                                    <span>
                                        {item.product?.name ||
                                         item.productName ||
                                         item.name ||
                                         "Product"}
                                    </span>
                                    <span>
                                        Qty: {item.quantity || 1}
                                    </span>
                                </div>
                            ))}

                            <label>Update Order Status</label>

                            <select
                                value={selectedOrder.status || "Pending"}
                                onChange={e =>
                                    updateStatus(selectedOrder._id, e.target.value)
                                }
                            >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>

                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

export default ManageOrders;
