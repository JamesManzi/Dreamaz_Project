import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUsers,
    faSearch,
    faUserPlus,
    faEnvelope,
    faShieldHalved,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";

import "./ManageUsers.css";
import AdminNavbar from "./AdminNavbar";
import { useMessage } from "./ShowMessage";
function ManageUsers() {

    const [users, setUsers] = useState([]);
    const {showSuccess,showError}=useMessage();
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {

        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) {
            navigate("/login");
            return;
        }

        const FetchingUsers = async () => {

            try {

                setLoading(true);

                const res = await api.get(
                    "/users",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (res.data.success) {

                    setUsers(res.data.users || []);

                } else {

                    showError(
                        res.data.message || "Failed to fetch users"
                    );
                }

            } catch (error) {

                console.log("Fetch Users Error", error);

                showError(
                    error.response?.data?.message ||
                    "Failed to fetch users"
                );

            } finally {

                setLoading(false);
            }
        };

        FetchingUsers();

    }, [navigate]);


    // Search users
    const filteredUsers = users.filter((user) => {

        const username = user.username?.toLowerCase() || "";
        const email = user.email?.toLowerCase() || "";
        const role = user.role?.toLowerCase() || "";

        const searchValue = search.toLowerCase();

        return (
            username.includes(searchValue) ||
            email.includes(searchValue) ||
            role.includes(searchValue)
        );
    });


    // User initials
    const getInitials = (username) => {

        if (!username) return "U";

        return username
            .split(" ")
            .map((name) => name.charAt(0))
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };


    // Delete user
    const handleDeleteUser = async (userId) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this user?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            const token = localStorage.getItem("token");
            if(!token){
                navigate("/login");
                return
            }

            const res = await api.delete(
                `/users/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data.success) {

                setUsers((previousUsers) =>
                    previousUsers.filter(
                        (user) => user._id !== userId
                    )
                );

                showSuccess(
                    res.data.message || "User deleted successfully"
                );

            } else {

                showError(
                    res.data.message || "Failed to delete user"
                );

            }

        } catch (error) {

            console.log("Delete User Error", error);

            showError(
                error.response?.data?.message ||
                "Failed to delete user"
            );
        }
    };


    return (
        <div className="manage-users-page">

            <AdminNavbar/>
            {/* MAIN CONTENT */}
            <main className="manage-users-container">

                {/* PAGE HEADING */}
                <section className="page-heading">
                    <div>
                        <span className="heading-label">
                            USER MANAGEMENT
                        </span>
                        <h1>Manage Users</h1>
                        <p>
                            View and manage users registered
                            within the Dreamaz Ink system.
                        </p>
                    </div>

                    <Link
                        to="/create-users"
                        className="add-user-btn"
                    >
                        <FontAwesomeIcon icon={faUserPlus} />
                        Create User
                    </Link>
                </section>

                {/* STATISTICS */}
                <section className="user-statistics">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <FontAwesomeIcon icon={faUsers} />
                        </div>
                        <div className="stat-info">
                            <span>Total Users</span>
                            <strong>{users.length}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <FontAwesomeIcon icon={faShieldHalved} />
                        </div>
                        <div className="stat-info">
                            <span>Administrators</span>
                            <strong>
                                {
                                    users.filter(
                                        (user) =>
                                            user.role?.toLowerCase() ===
                                            "admin"
                                    ).length
                                }
                            </strong>
                        </div>
                    </div>
                </section>


                {/* USERS CARD */}
                <section className="users-card">
                    <div className="users-card-header">
                        <div className="users-card-title">
                            <h2>System Users</h2>
                            <p>
                                {filteredUsers.length} user
                                {filteredUsers.length !== 1
                                    ? "s"
                                    : ""}{" "}
                                found
                            </p>
                        </div>

                        {/* SEARCH */}
                        <div className="search-box">
                            <FontAwesomeIcon
                                icon={faSearch}
                            />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {/* LOADING */}
                    {loading ? (
                        <div className="users-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading users...</p>
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        /* TABLE */
                        <div className="users-table-wrapper">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id}>
                                            {/* USER */}
                                            <td>
                                                <div className="user-info">
                                                    <div className="user-avatar">
                                                        {getInitials(
                                                            user.username
                                                        )}
                                                    </div>
                                                    <div className="user-details">
                                                        <strong>
                                                            {
                                                                user.username ||
                                                                "Unknown User"
                                                            }
                                                        </strong>
                                                        <span>
                                                            ID:{" "}
                                                            {
                                                                user._id?.slice(
                                                                    -6
                                                                ) || "—"
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* EMAIL */}
                                            <td>
                                                <div className="email-cell">
                                                    <FontAwesomeIcon
                                                        icon={faEnvelope}
                                                    />
                                                    {
                                                        user.email ||
                                                        "No email"
                                                    }
                                                </div>
                                            </td>

                                            {/* ROLE */}
                                            <td>
                                                <span
                                                    className={`role-badge ${
                                                        user.role
                                                            ?.toLowerCase() ===
                                                        "admin"
                                                            ? "admin-role"
                                                            : "user-role"
                                                    }`}
                                                >
                                                    {
                                                        user.role ||
                                                        "User"
                                                    }
                                                </span>
                                            </td>

                                            {/* DELETE */}
                                            <td>
                                                <button
                                                    className="delete-user-btn"
                                                    onClick={() =>
                                                        handleDeleteUser(
                                                            user._id
                                                        )
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faTrash}
                                                    />
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* EMPTY */
                        <div className="empty-users" style={{ padding: "40px", textAlign: "center" }}>
                            <div className="empty-icon" style={{ fontSize: "24px", color: "#8a93a2", marginBottom: "10px" }}>
                                <FontAwesomeIcon
                                    icon={faUsers}
                                />
                            </div>
                            <h3 style={{ margin: "0 0 5px", color: "#182033" }}>No Users Found</h3>
                            <p style={{ margin: 0, color: "#858e9e", fontSize: "13px" }}>
                                {search
                                    ? "No users match your search."
                                    : "There are currently no users in the system."
                                }
                            </p>
                        </div>
                    )}
                </section>

            </main>

        </div>
    );
}

export default ManageUsers;