
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import { useMessage } from "./ShowMessage";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./BuyerProfile.css";

function BuyerProfile() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useMessage();

    const [user, setUser] = useState({});
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        address: "",
        bio: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token || !localStorage.getItem("userId")) {
                navigate("/login");
                return;
            }

            try {
                const res = await api.get("/buyerProfile", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (res.data.success) {
                    const profile = res.data.user;

                    setUser(profile);
                    setFormData({
                        username: profile.username || "",
                        email: profile.email || "",
                        phone: profile.phone || "",
                        address: profile.address || "",
                        bio: profile.bio || ""
                    });
                } else {
                    showError("Unable to find your profile.");
                }
            } catch (error) {
                console.error("Profile loading error:", error);
                showError(
                    error.response?.data?.message ||
                    "Failed to load your profile."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCancel = () => {
        setFormData({
            username: user.username || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
            bio: user.bio || ""
        });

        setEditing(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!formData.username.trim() || !formData.email.trim()) {
            showError("Name and email are required.");
            return;
        }

        try {
            setSaving(true);

            // Change this endpoint to match your backend route.
            const res = await api.put(
                "/updateBuyerProfile",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data.success) {
                const updatedUser = res.data.user || {
                    ...user,
                    ...formData
                };

                setUser(updatedUser);
                setFormData({
                    username: updatedUser.username || "",
                    email: updatedUser.email || "",
                    phone: updatedUser.phone || "",
                    address: updatedUser.address || "",
                    bio: updatedUser.bio || ""
                });

                setEditing(false);
                showSuccess("Your profile has been updated successfully.");
            } else {
                showError(res.data.message || "Profile update failed.");
            }
        } catch (error) {
            console.error("Profile update error:", error);
            showError(
                error.response?.data?.message ||
                "Unable to update your profile."
            );
        } finally {
            setSaving(false);
        }
    };

    const completionFields = [
        user.username,
        user.email,
        user.phone,
        user.address,
        user.bio
    ];

    const completion = Math.round(
        completionFields.filter(value => value && String(value).trim()).length /
        completionFields.length * 100
    );

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="profile-spinner"></div>
                <p>Loading your profile...</p>
            </div>
        );
    }

    return (
        <>
            <Navbar />

            <main className="buyer-profile-page">
                <div className="profile-container">

                    <div className="profile-page-heading">
                        <div>
                            <span>MY ACCOUNT</span>
                            <h1>My Profile</h1>
                            <p>Manage your personal information and account details.</p>
                        </div>

                        {!editing && (
                            <button
                                className="edit-profile-btn"
                                onClick={() => setEditing(true)}
                            >
                                ✎ Edit Profile
                            </button>
                        )}
                    </div>

                    <div className="profile-layout">

                        {/* Profile sidebar */}
                        <aside className="profile-sidebar">
                            <div className="profile-avatar">
                                {(user.username || "U").charAt(0).toUpperCase()}
                            </div>

                            <h2>{user.username || "Customer"}</h2>
                            <p>{user.email || "No email available"}</p>

                            <div className="profile-status">
                                <span></span>
                                Active Account
                            </div>

                            <div className="profile-completion">
                                <div className="completion-heading">
                                    <span>Profile completion</span>
                                    <strong>{completion}%</strong>
                                </div>

                                <div className="completion-track">
                                    <div
                                        className="completion-fill"
                                        style={{ width: `${completion}%` }}
                                    ></div>
                                </div>

                                <small>
                                    Complete your information to improve your account.
                                </small>
                            </div>

                            <div className="profile-sidebar-links">
                                <button
                                    className="selected"
                                    onClick={() => window.scrollTo({
                                        top: 0,
                                        behavior: "smooth"
                                    })}
                                >
                                    <span>♙</span> Personal Information
                                </button>

                                <button onClick={() => navigate("/cart")}>
                                    <span>🛒</span> My Cart
                                </button>

                                <button onClick={() => navigate("/orders")}>
                                    <span>▤</span> My Orders
                                </button>

                                <button onClick={() => navigate("/products")}>
                                    <span>⌕</span> Browse Artworks
                                </button>
                            </div>
                        </aside>

                        {/* Main profile form */}
                        <section className="profile-details">
                            <div className="profile-details-heading">
                                <div>
                                    <h2>Personal Information</h2>
                                    <p>
                                        Update your details and how we can contact you.
                                    </p>
                                </div>

                                <span className="profile-account-label">
                                    Buyer Account
                                </span>
                            </div>

                            <form onSubmit={handleSave}>
                                <div className="profile-form-grid">

                                    <div className="profile-field">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            disabled={!editing}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>

                                    <div className="profile-field">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={!editing}
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>

                                    <div className="profile-field">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            disabled={!editing}
                                            placeholder="+250 7XX XXX XXX"
                                        />
                                    </div>

                                    <div className="profile-field">
                                        <label>Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            disabled={!editing}
                                            placeholder="Enter your address"
                                        />
                                    </div>

                                    <div className="profile-field full-width">
                                        <label>About Me</label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            disabled={!editing}
                                            placeholder="Tell us a little about yourself..."
                                            rows="5"
                                        />
                                    </div>

                                </div>

                                {editing && (
                                    <div className="profile-form-actions">
                                        <button
                                            type="button"
                                            className="cancel-profile-btn"
                                            onClick={handleCancel}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="save-profile-btn"
                                            disabled={saving}
                                        >
                                            {saving ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                )}
                            </form>

                            <div className="profile-security-note">
                                <span>🔒</span>
                                <div>
                                    <strong>Your information is protected</strong>
                                    <p>
                                        Keep your contact details up to date so we
                                        can communicate with you about your orders.
                                    </p>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}

export default BuyerProfile;
