
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import api from "./api";
import { useMessage } from "./ShowMessage";
import "./Dashboard.css";

function Dashboard() {
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("newest");

    const [cartCount, setCartCount] = useState(0);
    const [addingProduct, setAddingProduct] = useState("");

    const navigate = useNavigate();
    const { showSuccess, showError } = useMessage();

    // Fetch user and products
    useEffect(() => {
        const fetchDashboard = async () => {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");

            if (!token || !userId) {
                navigate("/login");
                return;
            }

            try {
                const [userResponse, productResponse] = await Promise.all([
                    api.get("/clientDashboard", {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }),

                    api.get("/getProducts", {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
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
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    navigate("/login");
                } else {
                    showError("Unable to load dashboard information.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    // Create category list from available products
    const categories = useMemo(() => {
        const uniqueCategories = [
            ...new Set(
                products
                    .map((product) => product.category)
                    .filter(Boolean)
            )
        ];

        return ["All", ...uniqueCategories];
    }, [products]);

    // Search, filter and sort products
    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (search.trim()) {
            const searchValue = search.toLowerCase();

            result = result.filter((product) =>
                product.name?.toLowerCase().includes(searchValue) ||
                product.description?.toLowerCase().includes(searchValue) ||
                product.category?.toLowerCase().includes(searchValue)
            );
        }

        if (selectedCategory !== "All") {
            result = result.filter(
                (product) => product.category === selectedCategory
            );
        }

        if (sortBy === "low") {
            result.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sortBy === "high") {
            result.sort((a, b) => Number(b.price) - Number(a.price));
        }

        return result;
    }, [products, search, selectedCategory, sortBy]);

    // Add product to cart
    const addToCart = async (productId) => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setAddingProduct(productId);

            const response = await api.post(
                "/api/cart/add",
                {
                    productId,
                    quantity: 1
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setCartCount((previous) => previous + 1);
                showSuccess("Product added to your cart!");
            } else {
                showError(response.data.message || "Could not add product.");
            }

        } catch (error) {
            console.error("Add to cart error:", error);
            showError(
                error.response?.data?.message ||
                "Failed to add product to cart."
            );
        } finally {
            setAddingProduct("");
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="dashboard-loading">
                    Loading your dashboard...
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="client-dashboard">

                {/* Welcome section */}
                <section className="dashboard-welcome">
                    <div className="dashboard-welcome-content">
                        <span>ISONGA MARKETPLACE</span>

                        <h1>
                            Welcome Back, {user?.username || "Customer"}!
                        </h1>

                        <p>
                            Discover products from different sellers.
                            Find what you need and shop with confidence.
                        </p>

                        <button
                            onClick={() =>
                                document.getElementById("browse-products")
                                    ?.scrollIntoView({ behavior: "smooth" })
                            }
                        >
                            Start Shopping
                        </button>
                    </div>

                    <div className="dashboard-welcome-icon">
                        <span>🛍️</span>
                    </div>
                </section>

                {/* Dashboard quick actions */}
                <section className="dashboard-quick-actions">

                    <div
                        className="dashboard-action-card"
                        onClick={() => navigate("/cart")}
                    >
                        <div className="dashboard-action-icon">🛒</div>
                        <div>
                            <h3>My Cart</h3>
                            <p>{cartCount} items added this session</p>
                        </div>
                    </div>

                    <div
                        className="dashboard-action-card"
                        onClick={() => navigate("/orders")}
                    >
                        <div className="dashboard-action-icon">📦</div>
                        <div>
                            <h3>My Orders</h3>
                            <p>View your purchases</p>
                        </div>
                    </div>

                    <div
                        className="dashboard-action-card"
                        onClick={() => navigate("/buyerProfile")}
                    >
                        <div className="dashboard-action-icon">👤</div>
                        <div>
                            <h3>My Account</h3>
                            <p>Manage your profile</p>
                        </div>
                    </div>

                </section>

                {/* Browse products */}
                <section
                    className="dashboard-products-section"
                    id="browse-products"
                >

                    <div className="dashboard-products-heading">
                        <div>
                            <span>FIND WHAT YOU NEED</span>
                            <h2>Explore Products</h2>
                            <p>
                                Browse products and discover great deals.
                            </p>
                        </div>

                        <span className="dashboard-product-count">
                            {filteredProducts.length} Products
                        </span>
                    </div>

                    {/* Search and sorting */}
                    <div className="dashboard-search-tools">

                        <div className="dashboard-search-box">
                            <span>⌕</span>
                            <input
                                type="text"
                                placeholder="Search products, categories..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Default order</option>
                            <option value="low">Price: Low to High</option>
                            <option value="high">Price: High to Low</option>
                        </select>

                    </div>

                    {/* Categories */}
                    <div className="dashboard-categories">
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={
                                    selectedCategory === category
                                        ? "selected"
                                        : ""
                                }
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Products */}
                    {filteredProducts.length > 0 ? (

                        <div className="dashboard-product-grid">

                            {filteredProducts.map((product) => {
                                const media = product.files?.[0];

                                return (
                                    <article
                                        className="dashboard-product-card"
                                        key={product._id}
                                    >

                                        <div className="dashboard-product-image">

                                            {media?.type === "video" ? (
                                                <video
                                                    src={media.url}
                                                    muted
                                                    playsInline
                                                />
                                            ) : media?.url ? (
                                                <img
                                                    src={media.url}
                                                    alt={product.name}
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

                                            <h3>{product.name}</h3>

                                            <p>
                                                {product.description?.length > 75
                                                    ? product.description.slice(0, 75) + "..."
                                                    : product.description}
                                            </p>

                                            <div className="dashboard-product-bottom">

                                                <strong>
                                                    {Number(product.price).toLocaleString()} RWF
                                                </strong>

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
                                                    disabled={
                                                        addingProduct === product._id
                                                    }
                                                    onClick={() =>
                                                        addToCart(product._id)
                                                    }
                                                >
                                                    {addingProduct === product._id
                                                        ? "Adding..."
                                                        : "Add to Cart"}
                                                </button>

                                            </div>

                                        </div>
                                    </article>
                                );
                            })}

                        </div>

                    ) : (
                        <div className="dashboard-empty">
                            <span>🔎</span>
                            <h3>No products found</h3>
                            <p>
                                Try another search term or select a different category.
                            </p>

                            <button
                                onClick={() => {
                                    setSearch("");
                                    setSelectedCategory("All");
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}

                </section>

            </main>

            <Footer />
        </>
    );
}

export default Dashboard;
