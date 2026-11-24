
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import Hero from "./Hero";
import api from "./api";

import "./Home.css";

/* =========================================================
   HELPERS
========================================================= */

const getImage = (product) => {
    if (product.image) return product.image;
    if (product.imageUrl) return product.imageUrl;

    if (product.files?.length) {
        const first = product.files[0];
        return typeof first === "string"
            ? first
            : first?.url || first?.secure_url || null;
    }

    if (product.images?.length) {
        const first = product.images[0];
        return typeof first === "string"
            ? first
            : first?.url || first?.secure_url || null;
    }

    return null;
};

const getTitle = (product) =>
    product.name || product.title || "Untitled Artwork";

const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") {
        return "Price unavailable";
    }

    return `${Number(price).toLocaleString("en-US")} RWF`;
};

const getToken = () => localStorage.getItem("token");

/* =========================================================
   ICONS
========================================================= */

const ICONS = {
    search: (
        <>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
        </>
    ),

    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,

    cart: (
        <>
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </>
    ),

    up: <path d="M12 19V5M5 12l7-7 7 7" />,

    frame: (
        <>
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 16l5-5 4 4 3-3 6 6" />
        </>
    ),

    close: <path d="M18 6 6 18M6 6l12 12" />,

    check: <path d="m5 12 4 4L19 6" />,

    palette: (
        <>
            <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.5-1.9-.3-1 .4-2.1 1.5-2.1H17a4 4 0 0 0 4-4c0-5-4-10-9-10z" />
            <circle cx="7.5" cy="11" r="1" />
            <circle cx="10" cy="7" r="1" />
            <circle cx="15" cy="7.5" r="1" />
        </>
    ),

    shield: (
        <>
            <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" />
            <path d="M9 12l2 2 4-4" />
        </>
    ),

    coin: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M9 9.5c0-1 1.3-1.8 3-1.8s3 .8 3 1.8-1.3 1.6-3 2-3 1-3 2 1.3 1.8 3 1.8 3-.8 3-1.8M12 6v1.7M12 16.3V18" />
        </>
    )
};

const Icon = ({ name, size = 20 }) => (
    <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        {ICONS[name]}
    </svg>
);

/* =========================================================
   STATIC CONTENT
========================================================= */

const FEATURES = [
    {
        icon: "palette",
        title: "Original Artworks",
        text: "Discover unique pieces from creators across different styles."
    },
    {
        icon: "search",
        title: "Easy Discovery",
        text: "Search and filter artworks to find exactly what you love."
    },
    {
        icon: "coin",
        title: "Clear Pricing",
        text: "See transparent prices displayed in Rwandan Francs."
    },
    {
        icon: "shield",
        title: "Secure Shopping",
        text: "Create an account, manage your cart and follow your orders."
    }
];

const STEPS = [
    {
        title: "Explore the Collection",
        text: "Browse artworks and discover pieces that match your style."
    },
    {
        title: "Add to Your Cart",
        text: "Choose your favorite artwork and add it to your shopping cart."
    },
    {
        title: "Place Your Order",
        text: "Complete your purchase and track your order."
    }
];

/* =========================================================
   COUNT UP
========================================================= */

function CountUp({ end, duration = 1400 }) {
    const ref = useRef(null);
    const [value, setValue] = useState(0);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        let raf;

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;

            observer.disconnect();

            const start = performance.now();

            const tick = (now) => {
                const progress = Math.min(
                    (now - start) / duration,
                    1
                );

                const eased = 1 - Math.pow(1 - progress, 3);

                setValue(Math.round(end * eased));

                if (progress < 1) {
                    raf = requestAnimationFrame(tick);
                }
            };

            raf = requestAnimationFrame(tick);
        });

        observer.observe(element);

        return () => {
            observer.disconnect();
            cancelAnimationFrame(raf);
        };
    }, [end, duration]);

    return <span ref={ref}>{value.toLocaleString()}</span>;
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
    product,
    index,
    onAddToCart,
    addingId
}) {
    const image = getImage(product);
    const title = getTitle(product);

    const isAdding = addingId === product._id;

    return (
        <article
            className="art-card"
            data-reveal
            style={{ "--delay": `${(index % 4) * 70}ms` }}
        >
            <Link
                to={`/products/${product._id}`}
                className="art-image-link"
            >
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        loading="lazy"
                    />
                ) : (
                    <div className="no-art-image">
                        <Icon name="frame" size={38} />
                        <span>No image available</span>
                    </div>
                )}

                <span className="art-badge">
                    {product.category || "Artwork"}
                </span>
            </Link>

            <div className="art-info">
                <h3 title={title}>{title}</h3>

                <p>
                    {product.description ||
                        "Discover this beautiful artwork from Dreamaz."}
                </p>

                <div className="art-price">
                    {formatPrice(product.price)}
                </div>

                <div className="art-card-actions">
                    <Link
                        to={`/products/${product._id}`}
                        className="art-details-btn"
                    >
                        View Details
                    </Link>

                    <button
                        type="button"
                        className="art-cart-btn"
                        onClick={() => onAddToCart(product)}
                        disabled={isAdding}
                    >
                        {isAdding ? (
                            <span className="button-loader" />
                        ) : (
                            <Icon name="cart" size={17} />
                        )}

                        {isAdding ? "Adding..." : "Add to Cart"}
                    </button>
                </div>
            </div>
        </article>
    );
}

/* =========================================================
   CATEGORY CARD
========================================================= */

function CategoryCard({
    name,
    count,
    image,
    index,
    onSelect
}) {
    return (
        <button
            type="button"
            className="category-card"
            data-reveal
            style={{ "--delay": `${(index % 4) * 70}ms` }}
            onClick={() => onSelect(name)}
        >
            {image ? (
                <img src={image} alt={name} loading="lazy" />
            ) : (
                <div className="category-card-fallback">
                    <Icon name="frame" size={40} />
                </div>
            )}

            <div className="category-card-overlay" />

            <div className="category-card-content">
                <h3>{name}</h3>
                <span>
                    {count} {count === 1 ? "artwork" : "artworks"}
                </span>
            </div>

            <span className="category-card-arrow">
                <Icon name="arrow" size={18} />
            </span>
        </button>
    );
}

/* =========================================================
   LOADING SKELETON
========================================================= */

function SkeletonGrid() {
    return (
        <div className="art-grid" aria-busy="true">
            {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="art-skeleton" />
            ))}
        </div>
    );
}

/* =========================================================
   HOME PAGE
========================================================= */

function Home() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("default");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [addingId, setAddingId] = useState(null);

    const [notice, setNotice] = useState(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const [scrollProgress, setScrollProgress] = useState(0);
    const [showTop, setShowTop] = useState(false);

    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

    const showNotice = (message, type = "success") => {
        setNotice({ message, type });

        window.clearTimeout(showNotice.timer);

        showNotice.timer = window.setTimeout(() => {
            setNotice(null);
        }, 3500);
    };

    /* =====================================================
       FETCH PRODUCTS
    ===================================================== */

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const res = await api.get("/loadProducts");

            const allProducts = Array.isArray(res.data)
                ? res.data
                : res.data?.products || [];

            setProducts(allProducts);
        } catch (err) {
            console.error("Fetching products error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load artworks. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    /* =====================================================
       ADD TO CART
    ===================================================== */

    const handleAddToCart = async (product) => {
        const token = getToken();

        // Ask visitor to log in
        if (!token) {
            setShowLoginPrompt(true);
            return;
        }

        if (addingId) return;

        try {
            setAddingId(product._id);

            /*
             * Expected backend payload:
             * {
             *   productId: product._id,
             *   quantity: 1
             * }
             *
             * Change the endpoint/payload if your cart
             * backend uses a different structure.
             */

            const res = await api.post(
                "/addToCart",
                {
                    productId: product._id,
                    quantity: 1
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data?.success === false) {
                showNotice(
                    res.data.message || "Unable to add this item.",
                    "error"
                );
                return;
            }

            showNotice(
                res.data?.message || "Artwork added to your cart!",
                "success"
            );

        } catch (err) {
            console.error("Add to cart error:", err);

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                setShowLoginPrompt(true);
                return;
            }

            showNotice(
                err.response?.data?.message ||
                "Unable to add artwork to cart. Please try again.",
                "error"
            );
        } finally {
            setAddingId(null);
        }
    };

    /* =====================================================
       CATEGORIES
    ===================================================== */

    const categoryData = useMemo(() => {
        const map = new Map();

        products.forEach((product) => {
            if (!product.category) return;

            const entry = map.get(product.category) || {
                name: product.category,
                count: 0,
                image: null
            };

            entry.count += 1;

            if (!entry.image) {
                entry.image = getImage(product);
            }

            map.set(product.category, entry);
        });

        return [...map.values()];
    }, [products]);

    const categories = useMemo(
        () => ["All", ...categoryData.map((category) => category.name)],
        [categoryData]
    );

    const categoryCounts = useMemo(() => {
        const counts = { All: products.length };

        categoryData.forEach((category) => {
            counts[category.name] = category.count;
        });

        return counts;
    }, [products, categoryData]);

    /* =====================================================
       SEARCH, FILTER AND SORT
    ===================================================== */

    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();

        const result = products.filter((product) => {
            const matchesSearch =
                !term ||
                getTitle(product).toLowerCase().includes(term) ||
                (product.description || "").toLowerCase().includes(term) ||
                (product.category || "").toLowerCase().includes(term);

            const matchesCategory =
                selectedCategory === "All" ||
                product.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });

        if (sortBy === "low") {
            result.sort(
                (a, b) => Number(a.price) - Number(b.price)
            );
        } else if (sortBy === "high") {
            result.sort(
                (a, b) => Number(b.price) - Number(a.price)
            );
        } else if (sortBy === "name") {
            result.sort((a, b) =>
                getTitle(a).localeCompare(getTitle(b))
            );
        }

        return result;
    }, [products, search, selectedCategory, sortBy]);

    const hasActiveFilters =
        search.trim() !== "" || selectedCategory !== "All";

    const clearFilters = () => {
        setSearch("");
        setSelectedCategory("All");
        setSortBy("default");
    };

    const goToCategory = (category) => {
        setSelectedCategory(category);

        document
            .getElementById("all-artworks")
            ?.scrollIntoView({ behavior: "smooth" });
    };

    /* =====================================================
       SCROLL PROGRESS
    ===================================================== */

    useEffect(() => {
        let ticking = false;

        const onScroll = () => {
            if (ticking) return;

            ticking = true;

            requestAnimationFrame(() => {
                const top = window.scrollY;

                const height =
                    document.documentElement.scrollHeight -
                    window.innerHeight;

                setScrollProgress(
                    height > 0 ? top / height : 0
                );

                setShowTop(top > 600);

                ticking = false;
            });
        };

        onScroll();

        window.addEventListener("scroll", onScroll, {
            passive: true
        });

        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    /* =====================================================
       REVEAL ANIMATIONS
    ===================================================== */

    useEffect(() => {
        if (!("IntersectionObserver" in window)) return;

        const targets = document.querySelectorAll(
            ".home-page .section-heading, " +
            ".home-page .art-toolbar, " +
            ".home-page .category-filters, " +
            ".home-page [data-reveal]"
        );

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            }
        );

        targets.forEach((element) => {
            if (!element.classList.contains("is-visible")) {
                element.classList.add("reveal");
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [loading, error, filteredProducts, categoryData]);

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <>
            <div className="scroll-progress" aria-hidden="true">
                <span
                    style={{
                        transform: `scaleX(${scrollProgress})`
                    }}
                />
            </div>

            <button
                type="button"
                className={`back-to-top ${showTop ? "visible" : ""}`}
                onClick={() =>
                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    })
                }
                aria-label="Back to top"
            >
                <Icon name="up" size={20} />
            </button>

            {/* Notification */}
            {notice && (
                <div
                    className={`home-notice ${notice.type}`}
                    role="status"
                >
                    <Icon
                        name={notice.type === "success" ? "check" : "close"}
                        size={19}
                    />
                    <span>{notice.message}</span>

                    <button
                        type="button"
                        onClick={() => setNotice(null)}
                        aria-label="Close notification"
                    >
                        <Icon name="close" size={16} />
                    </button>
                </div>
            )}

            {/* Login prompt */}
            {showLoginPrompt && (
                <div
                    className="login-modal-overlay"
                    onClick={() => setShowLoginPrompt(false)}
                >
                    <div
                        className="login-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="login-prompt-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="login-modal-close"
                            onClick={() => setShowLoginPrompt(false)}
                            aria-label="Close"
                        >
                            <Icon name="close" size={20} />
                        </button>

                        <div className="login-modal-icon">
                            <Icon name="cart" size={29} />
                        </div>

                        <h2 id="login-prompt-title">
                            Login Required
                        </h2>

                        <p>
                            Please log in to your Dreamaz account
                            before adding artworks to your shopping cart.
                        </p>

                        <div className="login-modal-actions">
                            <button
                                type="button"
                                className="login-modal-cancel"
                                onClick={() => setShowLoginPrompt(false)}
                            >
                                Continue Browsing
                            </button>

                            <button
                                type="button"
                                className="login-modal-submit"
                                onClick={() => navigate("/login")}
                            >
                                Login Now
                            </button>
                        </div>

                        <div className="login-modal-register">
                            Don't have an account?{" "}
                            <Link to="/register">
                                Create Account
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <header className="home-header">
                <Navbar />

                <div className="home-login">
                    <Link to="/login" className="home-btn2">
                        Login
                    </Link>
                </div>
            </header>

            <main className="home-page">

                {/* HERO */}
                <section className="home-hero">
                    <div className="hero-content">
                        <Hero category="all" />
                    </div>
                </section>

                {/* STATS */}
                {!loading && !error && products.length > 0 && (
                    <section className="stats-band" data-reveal>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <strong className="stat-value">
                                    <CountUp end={products.length} />
                                </strong>
                                <span className="stat-label">
                                    Artworks Available
                                </span>
                            </div>

                            <div className="stat-item">
                                <strong className="stat-value">
                                    <CountUp end={categoryData.length} />
                                </strong>
                                <span className="stat-label">
                                    Categories
                                </span>
                            </div>

                            <div className="stat-item">
                                <strong className="stat-value">
                                    RWF
                                </strong>
                                <span className="stat-label">
                                    Local Pricing
                                </span>
                            </div>
                        </div>
                    </section>
                )}

                {/* CATEGORIES */}
                {!loading && categoryData.length > 0 && (
                    <section className="category-section">
                        <div className="section-heading">
                            <span>Find your style</span>
                            <h2>Shop by Category</h2>
                            <p>
                                Choose a category to explore matching artworks.
                            </p>
                        </div>

                        <div className="category-grid">
                            {categoryData.map((category, index) => (
                                <CategoryCard
                                    key={category.name}
                                    name={category.name}
                                    count={category.count}
                                    image={category.image}
                                    index={index}
                                    onSelect={goToCategory}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* ALL ARTWORKS */}
                <section
                    className="home-section all-artworks"
                    id="all-artworks"
                >
                    <div className="section-heading">
                        <span>The Dreamaz Collection</span>
                        <h2>Explore All Artworks</h2>
                        <p>
                            Find beautiful artwork for your space and style.
                        </p>
                    </div>

                    {/* SEARCH AND SORT */}
                    <div className="art-toolbar">
                        <div className="art-search">
                            <Icon name="search" size={20} />

                            <input
                                type="text"
                                placeholder="Search artworks, categories or descriptions"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                aria-label="Search artworks"
                            />

                            {search && (
                                <button
                                    type="button"
                                    className="art-search-clear"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        <select
                            value={sortBy}
                            onChange={(event) =>
                                setSortBy(event.target.value)
                            }
                            aria-label="Sort artworks"
                        >
                            <option value="default">Sort: Default</option>
                            <option value="low">Price: Low to High</option>
                            <option value="high">Price: High to Low</option>
                            <option value="name">Name: A to Z</option>
                        </select>
                    </div>

                    {/* CATEGORY FILTERS */}
                    <div
                        className="category-filters"
                        role="tablist"
                        aria-label="Filter by category"
                    >
                        {categories.map((category) => (
                            <button
                                key={category}
                                type="button"
                                role="tab"
                                aria-selected={
                                    selectedCategory === category
                                }
                                className={
                                    selectedCategory === category
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setSelectedCategory(category)
                                }
                            >
                                {category}
                                <small>
                                    {categoryCounts[category] || 0}
                                </small>
                            </button>
                        ))}
                    </div>

                    {/* PRODUCT RESULTS */}
                    {loading ? (
                        <SkeletonGrid />
                    ) : error ? (
                        <div className="home-status error" role="alert">
                            <h3>Something went wrong</h3>
                            <p>{error}</p>

                            <button onClick={fetchProducts}>
                                Try Again
                            </button>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="empty-artworks">
                            <h3>
                                {products.length === 0
                                    ? "No artworks available yet"
                                    : "No artworks found"}
                            </h3>

                            <p>
                                {products.length === 0
                                    ? "Please check back soon for new arrivals."
                                    : "Try another search or category."}
                            </p>

                            {hasActiveFilters && (
                                <button onClick={clearFilters}>
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <p className="results-count">
                                Showing{" "}
                                <strong>{filteredProducts.length}</strong>{" "}
                                {filteredProducts.length === 1
                                    ? "artwork"
                                    : "artworks"}
                            </p>

                            <div className="art-grid">
                                {filteredProducts.map((product, index) => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        index={index}
                                        onAddToCart={handleAddToCart}
                                        addingId={addingId}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </section>

                {/* WHY DREAMAZ */}
                <section className="info-section">
                    <div className="section-heading center">
                        <span>Why Dreamaz</span>
                        <h2>Art Made Easy to Discover and Buy</h2>
                        <p>
                            A simple way to find artwork you love.
                        </p>
                    </div>

                    <div className="feature-grid">
                        {FEATURES.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="feature-card"
                                data-reveal
                                style={{
                                    "--delay": `${index * 90}ms`
                                }}
                            >
                                <div className="feature-icon">
                                    <Icon name={feature.icon} size={24} />
                                </div>

                                <h3>{feature.title}</h3>
                                <p>{feature.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section className="info-section">
                    <div className="section-heading center">
                        <span>How it works</span>
                        <h2>From Browsing to Your Door in 3 Steps</h2>
                    </div>

                    <div className="steps-grid">
                        {STEPS.map((step, index) => (
                            <div
                                key={step.title}
                                className="step-card"
                                data-reveal
                                style={{
                                    "--delay": `${index * 140}ms`
                                }}
                            >
                                <div className="step-number">
                                    {index + 1}
                                </div>

                                <h3>{step.title}</h3>
                                <p>{step.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="cta-banner" data-reveal>
                    <div className="cta-inner">
                        <div>
                            <h2>
                                Ready to find your next favorite piece?
                            </h2>

                            <p>
                                Create an account to add artworks to your cart
                                and track your orders.
                            </p>
                        </div>

                        <div className="cta-actions">
                            <Link
                                to="/register"
                                className="cta-btn primary"
                            >
                                Create Account
                            </Link>

                            <Link
                                to="/login"
                                className="cta-btn secondary"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}

export default Home;
