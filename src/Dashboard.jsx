
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import DashboardNavbar from "./DashboardNavbar";
import api from "./api";
import { useMessage } from "./ShowMessage";
import "./Dashboard.css";
import Loading from "./Loading";
/* =========================================================
   ICON COMPONENT
========================================================= */

const Icon = ({ name, size = 20 }) => {
    const icons = {
        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
            </>
        ),
        cart: (
            <>
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </>
        ),
        user: (
            <>
                <circle cx="12" cy="8" r="4" />
                <path d="M5 21a7 7 0 0 1 14 0" />
            </>
        ),
        package: (
            <>
                <path d="m12 3 9 5-9 5-9-5 9-5Z" />
                <path d="M3 8v8l9 5 9-5V8" />
                <path d="M12 13v8" />
            </>
        ),
        arrow: (
            <>
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
            </>
        ),
        check: <path d="m5 12 4 4L19 6" />,
        grid: (
            <>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
            </>
        ),
        clock: (
            <>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
            </>
        )
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {icons[name] || icons.package}
        </svg>
    );
};

/* =========================================================
   HELPERS
========================================================= */

const formatPrice = (value) =>
    `${Number(value || 0).toLocaleString("en-US")} RWF`;

const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";

    return "Good evening";
};

/* Your Product model stores images in files[] */

const getProductImage = (product) => {
    if (!product || !Array.isArray(product.files)) {
        return "";
    }

    const imageFile = product.files.find(
        (file) =>
            file?.type === "image" &&
            typeof file.url === "string" &&
            file.url.trim() !== ""
    );

    return imageFile?.url || "";
};

const getProductId = (product) =>
    product?._id || product?.id;

const getProductName = (product) =>
    product?.name || "Unnamed Product";

const getProductPrice = (product) =>
    Number(product?.price || 0);

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useMessage();

    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("default");

    const [cartCount, setCartCount] = useState(0);
    const [addingProduct, setAddingProduct] = useState("");

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

    const logoutAndRedirect = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");

        navigate("/login");
    }, [navigate]);

    /* =====================================================
       FETCH CART COUNT
       GET /cartCount
    ===================================================== */

    const fetchCartCount = useCallback(async () => {
        const headers = authHeaders();

        if (!headers) {
            setCartCount(0);
            return;
        }

        try {
            const response = await api.get("/cartCount", {
                headers
            });

            if (response.data.success) {
                setCartCount(
                    Number(response.data.totalQuantity) || 0
                );
            }
        } catch (error) {
            console.error("Fetch cart count error:", error);

            if (error.response?.status === 401) {
                logoutAndRedirect();
            }
        }
    }, [authHeaders, logoutAndRedirect]);

    /* =====================================================
       LOAD DASHBOARD DATA
    ===================================================== */

    useEffect(() => {
        let mounted = true;

        const fetchDashboard = async () => {
            const headers = authHeaders();
            const userId = localStorage.getItem("userId");

            if (!headers || !userId) {
                navigate("/login");
                return;
            }

            try {
                const [userResult, productsResult] =
                    await Promise.allSettled([
                        api.get("/clientDashboard", { headers }),
                        api.get("/getProducts", { headers })
                    ]);

                if (!mounted) return;

                if (userResult.status === "fulfilled") {
                    if (userResult.value.data.success) {
                        setUser(userResult.value.data.user);
                    } else {
                        showError("Unable to load your account.");
                    }
                } else {
                    console.error(
                        "User loading error:",
                        userResult.reason
                    );

                    if (userResult.reason?.response?.status === 401) {
                        logoutAndRedirect();
                        return;
                    }
                }

                if (productsResult.status === "fulfilled") {
                    if (productsResult.value.data.success) {
                        setProducts(
                            productsResult.value.data.products || []
                        );
                    }
                } else {
                    console.error(
                        "Products loading error:",
                        productsResult.reason
                    );
                }

                if (mounted) {
                    await fetchCartCount();
                }

            } catch (error) {
                console.error("Dashboard loading error:", error);

                if (error.response?.status === 401) {
                    logoutAndRedirect();
                } else {
                    showError("Unable to load dashboard information.");
                }

            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchDashboard();

        return () => {
            mounted = false;
        };
    }, [
        authHeaders,
        fetchCartCount,
        navigate,
        logoutAndRedirect,
        showError
    ]);

    /* =====================================================
       CATEGORIES
    ===================================================== */

    const categories = useMemo(() => {
        const names = products
            .map((product) => product.category)
            .filter(Boolean);

        return ["All", ...new Set(names)];
    }, [products]);

    /* =====================================================
       FILTER AND SORT
    ===================================================== */

    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (selectedCategory !== "All") {
            result = result.filter(
                (product) =>
                    product.category === selectedCategory
            );
        }

        if (search.trim()) {
            const searchValue = search.toLowerCase();

            result = result.filter((product) => {
                const name = getProductName(product).toLowerCase();
                const description = (
                    product.description || ""
                ).toLowerCase();
                const category = (
                    product.category || ""
                ).toLowerCase();

                return (
                    name.includes(searchValue) ||
                    description.includes(searchValue) ||
                    category.includes(searchValue)
                );
            });
        }

        if (sortBy === "priceLow") {
            result.sort(
                (a, b) =>
                    getProductPrice(a) - getProductPrice(b)
            );
        }

        if (sortBy === "priceHigh") {
            result.sort(
                (a, b) =>
                    getProductPrice(b) - getProductPrice(a)
            );
        }

        if (sortBy === "newest") {
            result.sort(
                (a, b) =>
                    new Date(b.createdAt || 0) -
                    new Date(a.createdAt || 0)
            );
        }

        return result;
    }, [products, selectedCategory, search, sortBy]);

    /* =====================================================
       ADD TO CART
       POST /addCart/:id
    ===================================================== */

    const addToCart = async (productId) => {
        const headers = authHeaders();

        if (!headers) {
            navigate("/login");
            return;
        }

        if (!productId) {
            showError("Invalid product.");
            return;
        }

        if (addingProduct) return;

        try {
            setAddingProduct(productId);

            const response = await api.post(
                `/addCart/${productId}`,
                { quantity: 1 },
                { headers }
            );

            if (response.data.success) {
                await fetchCartCount();

                showSuccess(
                    response.data.message ||
                    "Product added to your cart successfully!"
                );
            } else {
                showError(
                    response.data.message ||
                    "Could not add product to cart."
                );
            }

        } catch (error) {
            console.error("Add to cart error:", error);

            if (error.response?.status === 401) {
                logoutAndRedirect();
            } else {
                showError(
                    error.response?.data?.message ||
                    "Unable to add product to cart."
                );
            }

        } finally {
            setAddingProduct("");
        }
    };

    /* =====================================================
       SCROLL TO PRODUCTS
    ===================================================== */

    const scrollToProducts = () => {
        document
            .getElementById("dashboard-products")
            ?.scrollIntoView({ behavior: "smooth" });
    };

    /* =====================================================
       LOADING SCREEN
    ===================================================== */

    /* =====================================================
   LOADING SCREEN
===================================================== */

if (loading) {
    return (
        <>
            <Navbar />

            <Loading
                loading={true}
                message="Please wait while we prepare your dashboard."
            />

            <Footer />
        </>
    );
}

    const firstName =
        user?.firstName ||
        user?.fullName?.split(" ")[0] ||
        user?.name?.split(" ")[0] ||
        "Buyer";

    /* =====================================================
       MAIN UI
    ===================================================== */

    return (
        <>
            <DashboardNavbar />

            <main className="client-dashboard">

                {/* WELCOME SECTION */}

                <section className="dashboard-welcome">
                    <div className="dashboard-welcome-content">
                        <span className="dashboard-eyebrow">
                            {getGreeting()}
                        </span>

                        <h1
    style={{
        fontSize: "clamp(24px, 3vw, 32px)",
        fontWeight: 800,
        color: "white",
        letterSpacing: "-0.8px",
        lineHeight: 1.3,
        margin: "0 0 8px",
        fontFamily: "Inter, sans-serif"
    }}
>
    Welcome back,{" "}
    <span style={{ color: "#27ae60" }}>
        {user.username}
    </span>
</h1>

                        <p>
                            Discover amazing products, explore new
                            collections, and find everything you need
                            in one place.
                        </p>

                        <div className="dashboard-welcome-actions">
                            <button
                                className="dash-btn dash-btn-light"
                                onClick={scrollToProducts}
                            >
                                <Icon name="grid" />
                                Explore Products
                            </button>

                            <button
                                className="dash-btn dash-btn-ghost"
                                onClick={() => navigate("/orders")}
                            >
                                <Icon name="package" />
                                My Orders
                            </button>
                        </div>
                    </div>

                    <ul className="dashboard-trust">
                        <li>
                            <Icon name="check" />
                            <div>
                                <strong>Discover Products</strong>
                                <span>Explore different categories</span>
                            </div>
                        </li>

                        <li>
                            <Icon name="cart" />
                            <div>
                                <strong>Easy Shopping</strong>
                                <span>Add products to your cart</span>
                            </div>
                        </li>

                        <li>
                            <Icon name="clock" />
                            <div>
                                <strong>Convenient Experience</strong>
                                <span>Shop whenever you want</span>
                            </div>
                        </li>
                    </ul>
                </section>

                {/* QUICK ACTIONS */}

                <section className="dashboard-quick-actions">

                    <button
                        type="button"
                        className="dashboard-action-card"
                        onClick={() => navigate("/cart")}
                    >
                        <div className="dashboard-action-icon">
                            <Icon name="cart" />

                            {cartCount > 0 && (
                                <span className="dashboard-action-badge">
                                    {cartCount > 99 ? "99+" : cartCount}
                                </span>
                            )}
                        </div>

                        <div className="dashboard-action-text">
                            <h3>My Cart</h3>
                            <p>
                                {cartCount}{" "}
                                {cartCount === 1 ? "item" : "items"} in your cart
                            </p>
                        </div>

                        <span className="dashboard-action-arrow">
                            <Icon name="arrow" />
                        </span>
                    </button>

                    <button
                        type="button"
                        className="dashboard-action-card"
                        onClick={() => navigate("/orders")}
                    >
                        <div className="dashboard-action-icon">
                            <Icon name="package" />
                        </div>

                        <div className="dashboard-action-text">
                            <h3>My Orders</h3>
                            <p>Track your purchases</p>
                        </div>

                        <span className="dashboard-action-arrow">
                            <Icon name="arrow" />
                        </span>
                    </button>

                    <button
                        type="button"
                        className="dashboard-action-card"
                        onClick={() => navigate("/buyerProfile")}
                    >
                        <div className="dashboard-action-icon">
                            <Icon name="user" />
                        </div>

                        <div className="dashboard-action-text">
                            <h3>My Profile</h3>
                            <p>Manage your account</p>
                        </div>

                        <span className="dashboard-action-arrow">
                            <Icon name="arrow" />
                        </span>
                    </button>

                </section>

                {/* PRODUCTS SECTION */}

                <section
                    className="dashboard-products-section"
                    id="dashboard-products"
                >

                    <div className="dashboard-products-heading">
                        <div>
                            <span className="dashboard-eyebrow dark">
                                DISCOVER MORE
                            </span>

                            <h2>Explore Products</h2>

                            <p>
                                Find products you love from our marketplace.
                            </p>
                        </div>

                        <span className="dashboard-product-count">
                            {filteredProducts.length} Products
                        </span>
                    </div>

                    {/* SEARCH AND SORT */}

                    <div className="dashboard-toolbar">
                        <div className="dashboard-search-box">
                            <Icon name="search" />

                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            {search && (
                                <button
                                    type="button"
                                    className="dashboard-search-clear"
                                    onClick={() => setSearch("")}
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="default">Default sorting</option>
                            <option value="newest">Newest first</option>
                            <option value="priceLow">
                                Price: Low to High
                            </option>
                            <option value="priceHigh">
                                Price: High to Low
                            </option>
                        </select>
                    </div>

                    {/* CATEGORIES */}

                    <div className="dashboard-categories">
                        {categories.map((category) => {
                            const count =
                                category === "All"
                                    ? products.length
                                    : products.filter(
                                        (product) =>
                                            product.category === category
                                    ).length;

                            return (
                                <button
                                    type="button"
                                    key={category}
                                    className={
                                        selectedCategory === category
                                            ? "selected"
                                            : ""
                                    }
                                    onClick={() =>
                                        setSelectedCategory(category)
                                    }
                                >
                                    {category}
                                    <small>{count}</small>
                                </button>
                            );
                        })}
                    </div>

                    {/* PRODUCT GRID */}

                    {filteredProducts.length > 0 ? (
                        <div className="dashboard-product-grid">

                            {filteredProducts.map((product) => {
                                const productId = getProductId(product);
                                const image = getProductImage(product);
                                const isAdding = addingProduct === productId;
                                const unavailable =
                                    product.availability &&
                                    product.availability !== "available";

                                return (
                                    <article
                                        className="dashboard-product-card"
                                        key={productId}
                                    >
                                        <button
                                            type="button"
                                            className="dashboard-product-image"
                                            onClick={() =>
                                                navigate(`/product/${productId}`)
                                            }
                                            aria-label={`View ${getProductName(product)}`}
                                        >
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={getProductName(product)}
                                                    loading="lazy"
                                                    onError={(event) => {
                                                        event.currentTarget.style.display = "none";

                                                        const fallback =
                                                            event.currentTarget.parentElement.querySelector(
                                                                ".dashboard-no-image"
                                                            );

                                                        if (fallback) {
                                                            fallback.style.display = "flex";
                                                        }
                                                    }}
                                                />
                                            ) : null}

                                            <div
                                                className="dashboard-no-image"
                                                style={{
                                                    display: image ? "none" : "flex"
                                                }}
                                            >
                                                <Icon name="package" size={34} />
                                                <span>No image available</span>
                                            </div>

                                            {product.category && (
                                                <span className="dashboard-product-category">
                                                    {product.category}
                                                </span>
                                            )}
                                        </button>

                                        <div className="dashboard-product-info">
                                            <h3 title={getProductName(product)}>
                                                {getProductName(product)}
                                            </h3>

                                            <p>
                                                {product.description ||
                                                    "Discover this product and learn more."}
                                            </p>

                                            <div className="dashboard-product-bottom">
                                                <strong>
                                                    {formatPrice(
                                                        getProductPrice(product)
                                                    )}
                                                </strong>
                                            </div>

                                            <div className="dashboard-product-buttons">
                                                <button
                                                    type="button"
                                                    className="dashboard-details-btn"
                                                    onClick={() =>
                                                        navigate(`/product/${productId}`)
                                                    }
                                                >
                                                    Details
                                                </button>

                                                <button
                                                    type="button"
                                                    className="dashboard-cart-btn"
                                                    disabled={isAdding || unavailable}
                                                    onClick={() => addToCart(productId)}
                                                >
                                                    {isAdding
                                                        ? "Adding..."
                                                        : unavailable
                                                            ? product.availability
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
                            <div className="dashboard-empty-icon">
                                <Icon name="package" />
                            </div>

                            <h3>No products found</h3>

                            <p>
                                Try another search term or choose a
                                different category.
                            </p>

                            <button
                                type="button"
                                className="dash-btn dash-btn-primary"
                                onClick={() => {
                                    setSearch("");
                                    setSelectedCategory("All");
                                    setSortBy("default");
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
