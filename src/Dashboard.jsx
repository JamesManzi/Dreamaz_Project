import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import api from "./api";
import { useMessage } from "./ShowMessage";
import "./Dashboard.css";
import DashboardNavbar from "./DashboardNavbar";

/* ---------- Small inline icon set (no emojis, consistent stroke) ---------- */
const Icon = ({ name }) => {
    const paths = {
        cart: (
            <>
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="18" cy="20" r="1.5" />
                <path d="M2 3h3l2.6 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" />
            </>
        ),
        orders: (
            <>
                <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
                <path d="M3 8l9 5 9-5M12 13v8" />
            </>
        ),
        user: (
            <>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
            </>
        ),
        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
            </>
        ),
        arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
        empty: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3M8.5 8.5l5 5M13.5 8.5l-5 5" />
            </>
        ),
        shield: (
            <>
                <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" />
                <path d="M9 12l2 2 4-4" />
            </>
        ),
        truck: (
            <>
                <path d="M2 6h11v10H2zM13 10h4l3 3v3h-7" />
                <circle cx="7" cy="18" r="1.8" />
                <circle cx="17" cy="18" r="1.8" />
            </>
        ),
        tag: (
            <>
                <path d="M3 12V4h8l10 10-8 8L3 12z" />
                <circle cx="7.5" cy="8.5" r="1.2" />
            </>
        )
    };

    return (
        <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {paths[name]}
        </svg>
    );
};

const formatPrice = (value) => `${Number(value || 0).toLocaleString()} RWF`;

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};

function Dashboard() {
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("default");

    const [cartCount, setCartCount] = useState(0);
    const [addingProduct, setAddingProduct] = useState("");

    const navigate = useNavigate();
    const { showSuccess, showError } = useMessage();

    const authHeaders = useCallback(() => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : null;
    }, []);

    const logoutAndRedirect = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
    }, [navigate]);

    /* ---------- Load user + products ---------- */
    useEffect(() => {
        const fetchDashboard = async () => {
            const headers = authHeaders();
            const userId = localStorage.getItem("userId");

            if (!headers || !userId) {
                navigate("/login");
                return;
            }

            try {
                const [userResponse, productResponse] = await Promise.all([
                    api.get("/clientDashboard", { headers }),
                    api.get("/getProducts", { headers })
                ]);

                if (userResponse.data.success) {
                    setUser(userResponse.data.user);
                } else {
                    showError("Unable to load your account.");
                }

                if (productResponse.data.success) {
                    setProducts(productResponse.data.products || []);
                }
            } catch (error) {
                console.error("Dashboard loading error:", error);

                if (error.response?.status === 401) {
                    logoutAndRedirect();
                } else {
                    showError("Unable to load dashboard information.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ---------- Derived data ---------- */
    const categories = useMemo(() => {
        const unique = [
            ...new Set(products.map((p) => p.category).filter(Boolean))
        ];
        return ["All", ...unique];
    }, [products]);

    const categoryCounts = useMemo(() => {
        const counts = { All: products.length };
        products.forEach((p) => {
            if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
        });
        return counts;
    }, [products]);

    const filteredProducts = useMemo(() => {
        let result = [...products];

        const term = search.trim().toLowerCase();
        if (term) {
            result = result.filter(
                (p) =>
                    p.name?.toLowerCase().includes(term) ||
                    p.description?.toLowerCase().includes(term) ||
                    p.category?.toLowerCase().includes(term)
            );
        }

        if (selectedCategory !== "All") {
            result = result.filter((p) => p.category === selectedCategory);
        }

        if (sortBy === "low") {
            result.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sortBy === "high") {
            result.sort((a, b) => Number(b.price) - Number(a.price));
        } else if (sortBy === "name") {
            result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        }

        return result;
    }, [products, search, selectedCategory, sortBy]);

    const hasActiveFilters = search.trim() !== "" || selectedCategory !== "All";

    const clearFilters = () => {
        setSearch("");
        setSelectedCategory("All");
        setSortBy("default");
    };

   
/* ---------- Cart ---------- */
const addToCart = async (productId) => {
    const headers = authHeaders();

    if (!headers) {
        navigate("/login");
        return;
    }

    try {
        setAddingProduct(productId);

        const response = await api.post(
            `/addCart/${productId}`,
            { quantity: 1 },
            { headers }
        );

        if (response.data.success) {
            setCartCount((previous) => previous + 1);
            showSuccess("Product added to your cart.");
        } else {
            showError(response.data.message || "Could not add product.");
        }

    } catch (error) {
        console.error("Add to cart error:", error);

        if (error.response?.status === 401) {
            logoutAndRedirect();
            return;
        }

        showError(
            error.response?.data?.message ||
            "Failed to add product to cart."
        );

    } finally {
        setAddingProduct("");
    }
};


    const scrollToProducts = () =>
        document
            .getElementById("browse-products")
            ?.scrollIntoView({ behavior: "smooth" });

    /* ---------- Loading skeleton ---------- */
    if (loading) {
        return (
            <>
                <Navbar />
                <main className="client-dashboard" aria-busy="true">
                    <div className="dash-skeleton dash-skeleton-hero" />
                    <div className="dash-skeleton-row">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="dash-skeleton dash-skeleton-card" />
                        ))}
                    </div>
                    <div className="dashboard-product-grid">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <div key={n} className="dash-skeleton dash-skeleton-product" />
                        ))}
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <DashboardNavbar/>

            <main className="client-dashboard">
                {/* ---------- Welcome ---------- */}
                <section className="dashboard-welcome">
                    <div className="dashboard-welcome-content">
                        <span className="dashboard-eyebrow">Isonga Marketplace</span>

                        <h1>
                            {getGreeting()}, {user?.username || "Customer"}
                        </h1>

                        <p>
                            Discover quality products from trusted sellers and
                            shop with confidence.
                        </p>

                        <div className="dashboard-welcome-actions">
                            <button
                                className="dash-btn dash-btn-light"
                                onClick={scrollToProducts}
                            >
                                Start Shopping
                                <Icon name="arrow" />
                            </button>
                            <button
                                className="dash-btn dash-btn-ghost"
                                onClick={() => navigate("/myOrders")}
                            >
                                Track Orders
                            </button>
                        </div>
                    </div>

                    <ul className="dashboard-trust">
                        <li>
                            <Icon name="shield" />
                            <div>
                                <strong>Secure Shopping</strong>
                                <span>Protected checkout</span>
                            </div>
                        </li>
                        <li>
                            <Icon name="truck" />
                            <div>
                                <strong>Reliable Delivery</strong>
                                <span>From verified sellers</span>
                            </div>
                        </li>
                        <li>
                            <Icon name="tag" />
                            <div>
                                <strong>Great Prices</strong>
                                <span>{products.length} products available</span>
                            </div>
                        </li>
                    </ul>
                </section>

                {/* ---------- Quick actions ---------- */}
                <section
                    className="dashboard-quick-actions"
                    aria-label="Quick actions"
                >
                    {[
                        {
                            icon: "cart",
                            title: "My Cart",
                            text:
                                cartCount > 0
                                    ? `${cartCount} item${cartCount > 1 ? "s" : ""} added this session`
                                    : "Review items before checkout",
                            to: "/cart",
                            badge: cartCount
                        },
                        {
                            icon: "orders",
                            title: "My Orders",
                            text: "Track and view your purchases",
                            to: "/orders"
                        },
                        {
                            icon: "user",
                            title: "My Account",
                            text: "Manage your profile and settings",
                            to: "/buyerProfile"
                        }
                    ].map((action) => (
                        <button
                            key={action.title}
                            type="button"
                            className="dashboard-action-card"
                            onClick={() => navigate(action.to)}
                        >
                            <div className="dashboard-action-icon">
                                <Icon name={action.icon} />
                                {action.badge > 0 && (
                                    <span className="dashboard-action-badge">
                                        {action.badge}
                                    </span>
                                )}
                            </div>
                            <div className="dashboard-action-text">
                                <h3>{action.title}</h3>
                                <p>{action.text}</p>
                            </div>
                            <span className="dashboard-action-arrow">
                                <Icon name="arrow" />
                            </span>
                        </button>
                    ))}
                </section>

                {/* ---------- Products ---------- */}
                <section
                    className="dashboard-products-section"
                    id="browse-products"
                >
                    <div className="dashboard-products-heading">
                        <div>
                            <span className="dashboard-eyebrow dark">
                                Find what you need
                            </span>
                            <h2>Explore Products</h2>
                            <p>Browse the catalogue and discover great deals.</p>
                        </div>

                        <span className="dashboard-product-count">
                            {filteredProducts.length}{" "}
                            {filteredProducts.length === 1 ? "product" : "products"}
                        </span>
                    </div>

                    <div className="dashboard-toolbar">
                        <div className="dashboard-search-box">
                            <Icon name="search" />
                            <input
                                type="text"
                                placeholder="Search by name, description or category"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                aria-label="Search products"
                            />
                            {search && (
                                <button
                                    type="button"
                                    className="dashboard-search-clear"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            aria-label="Sort products"
                        >
                            <option value="default">Sort: Default</option>
                            <option value="low">Price: Low to High</option>
                            <option value="high">Price: High to Low</option>
                            <option value="name">Name: A to Z</option>
                        </select>
                    </div>

                    <div
                        className="dashboard-categories"
                        role="tablist"
                        aria-label="Product categories"
                    >
                        {categories.map((category) => (
                            <button
                                key={category}
                                role="tab"
                                aria-selected={selectedCategory === category}
                                className={
                                    selectedCategory === category ? "selected" : ""
                                }
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                                <small>{categoryCounts[category] || 0}</small>
                            </button>
                        ))}
                    </div>

                    {filteredProducts.length > 0 ? (
                        <div className="dashboard-product-grid">
                            {filteredProducts.map((product) => {
                                const media = product.files?.[0];
                                const isAdding = addingProduct === product._id;

                                return (
                                    <article
                                        className="dashboard-product-card"
                                        key={product._id}
                                    >
                                        <div
                                            className="dashboard-product-image"
                                            onClick={() =>
                                                navigate(`/products/${product._id}`)
                                            }
                                        >
                                            {media?.type === "video" ? (
                                                <video
                                                    src={media.url}
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                />
                                            ) : media?.url ? (
                                                <img
                                                    src={media.url}
                                                    alt={product.name}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="dashboard-no-image">
                                                    No image available
                                                </div>
                                            )}

                                            {product.category && (
                                                <span className="dashboard-product-category">
                                                    {product.category}
                                                </span>
                                            )}
                                        </div>

                                        <div className="dashboard-product-info">
                                            <h3 title={product.name}>{product.name}</h3>

                                            <p>
                                                {product.description?.length > 75
                                                    ? `${product.description.slice(0, 75)}...`
                                                    : product.description}
                                            </p>

                                            <div className="dashboard-product-bottom">
                                                <strong>{formatPrice(product.price)}</strong>
                                            </div>

                                            <div className="dashboard-product-buttons">
                                                <button
                                                    className="dashboard-details-btn"
                                                    onClick={() =>
                                                        navigate(`/products/${product._id}`)
                                                    }
                                                >
                                                    View Details
                                                </button>

                                                <button
                                                    className="dashboard-cart-btn"
                                                    disabled={isAdding}
                                                    onClick={() => addToCart(product._id)}
                                                >
                                                    {isAdding ? "Adding..." : "Add to Cart"}
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="dashboard-empty">
                            <div className="dashboard-empty-icon">
                                <Icon name="empty" />
                            </div>
                            <h3>
                                {products.length === 0
                                    ? "No products available yet"
                                    : "No matching products"}
                            </h3>
                            <p>
                                {products.length === 0
                                    ? "Please check back soon for new arrivals."
                                    : "Try a different search term or choose another category."}
                            </p>

                            {hasActiveFilters && (
                                <button
                                    className="dash-btn dash-btn-primary"
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </>
    );
}

export default Dashboard;