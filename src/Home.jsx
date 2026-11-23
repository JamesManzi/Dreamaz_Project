import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import api from "./api";
import Hero from "./Hero";

import "./Home.css";

/* =================================================================
   Helpers
   ================================================================= */
const getImage = (product) => {
    if (product.image) return product.image;
    if (product.imageUrl) return product.imageUrl;

    if (product.files?.length) {
        const first = product.files[0];
        return typeof first === "string" ? first : first?.url || null;
    }

    return null;
};

const getTitle = (product) => product.name || product.title || "Untitled Artwork";

const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") {
        return "Price unavailable";
    }
    return `${Number(price).toLocaleString()} RWF`;
};

/* =================================================================
   Icons
   ================================================================= */
const ICONS = {
    search: (
        <>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
        </>
    ),
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    up: <path d="M12 19V5M5 12l7-7 7 7" />,
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
    ),
    frame: (
        <>
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 16l5-5 4 4 3-3 6 6" />
        </>
    )
};

const Icon = ({ name, size = 22 }) => (
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

/* =================================================================
   Static content
   ================================================================= */
const FEATURES = [
    {
        icon: "palette",
        title: "Original Artworks",
        text: "Explore unique pieces from creators across many styles and categories."
    },
    {
        icon: "search",
        title: "Easy Discovery",
        text: "Search, filter by category and sort by price to find the right piece fast."
    },
    {
        icon: "coin",
        title: "Clear Pricing",
        text: "Every artwork is priced in Rwandan Francs, with no confusion."
    },
    {
        icon: "shield",
        title: "Account-Based Shopping",
        text: "Sign in to save items to your cart and follow your orders."
    }
];

const STEPS = [
    {
        title: "Browse the Collection",
        text: "Explore by category, or search for a style, subject or description."
    },
    {
        title: "Add to Your Cart",
        text: "Open an artwork for full details, then add your favorites to your cart."
    },
    {
        title: "Place and Track Orders",
        text: "Complete your purchase and follow your orders from your account."
    }
];

/* =================================================================
   Components
   ================================================================= */

/* Counts up when scrolled into view */
function CountUp({ end, duration = 1400 }) {
    const ref = useRef(null);
    const [value, setValue] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;

        let raf;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                observer.disconnect();

                const start = performance.now();
                const tick = (now) => {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setValue(Math.round(end * eased));
                    if (progress < 1) raf = requestAnimationFrame(tick);
                };
                raf = requestAnimationFrame(tick);
            },
            { threshold: 0.4 }
        );

        observer.observe(el);
        return () => {
            observer.disconnect();
            cancelAnimationFrame(raf);
        };
    }, [end, duration]);

    return <span ref={ref}>{value.toLocaleString()}</span>;
}

/* Medium artwork card */
function ProductCard({ product, index = 0 }) {
    const image = getImage(product);
    const title = getTitle(product);

    return (
        <article
            className="art-card"
            data-reveal
            style={{ "--delay": `${(index % 4) * 80}ms` }}
        >
            <Link to={`/products/${product._id}`} className="art-image-link">
                {image ? (
                    <img src={image} alt={title} loading="lazy" />
                ) : (
                    <div className="no-art-image">
                        <Icon name="frame" size={34} />
                    </div>
                )}
                <span className="art-badge">{product.category || "Artwork"}</span>
            </Link>

            <div className="art-info">
                <h3 title={title}>{title}</h3>
                <p>{product.description || "Discover this unique artwork."}</p>

                <div className="art-card-bottom">
                    <strong>{formatPrice(product.price)}</strong>

                    <Link
                        to={`/products/${product._id}`}
                        className="art-view-btn"
                        aria-label={`View details of ${title}`}
                    >
                        <Icon name="arrow" size={18} />
                    </Link>
                </div>
            </div>
        </article>
    );
}

/* Visual category card */
function CategoryCard({ name, count, image, index, onSelect }) {
    return (
        <button
            type="button"
            className="category-card"
            data-reveal
            style={{ "--delay": `${(index % 4) * 80}ms` }}
            onClick={() => onSelect(name)}
        >
            {image ? (
                <img src={image} alt="" loading="lazy" />
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

function SkeletonGrid() {
    return (
        <div className="art-grid" aria-busy="true">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="art-skeleton" />
            ))}
        </div>
    );
}

/* =================================================================
   Page
   ================================================================= */
function Home() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("default");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [scrollProgress, setScrollProgress] = useState(0);
    const [showTop, setShowTop] = useState(false);

    /* ---------- Fetch ---------- */
    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await api.get("/loadProducts");

            const allProducts = Array.isArray(res.data)
                ? res.data
                : res.data.products || [];

            setProducts(allProducts);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError("Unable to load artworks. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    /* ---------- Categories ---------- */
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
            if (!entry.image) entry.image = getImage(product);

            map.set(product.category, entry);
        });

        return [...map.values()];
    }, [products]);

    const categories = useMemo(
        () => ["All", ...categoryData.map((c) => c.name)],
        [categoryData]
    );

    const categoryCounts = useMemo(() => {
        const counts = { All: products.length };
        categoryData.forEach((c) => {
            counts[c.name] = c.count;
        });
        return counts;
    }, [products, categoryData]);

    /* ---------- Search, filter, sort ---------- */
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
            result.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sortBy === "high") {
            result.sort((a, b) => Number(b.price) - Number(a.price));
        } else if (sortBy === "name") {
            result.sort((a, b) => getTitle(a).localeCompare(getTitle(b)));
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

    /* ---------- Scroll progress + back to top ---------- */
    useEffect(() => {
        let ticking = false;

        const onScroll = () => {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const top = window.scrollY;
                const height =
                    document.documentElement.scrollHeight - window.innerHeight;

                setScrollProgress(height > 0 ? top / height : 0);
                setShowTop(top > 600);
                ticking = false;
            });
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* ---------- Reveal on scroll ---------- */
    useEffect(() => {
        if (!("IntersectionObserver" in window)) return undefined;

        const targets = document.querySelectorAll(
            ".home-page .section-heading, .home-page .art-toolbar, " +
                ".home-page .category-filters, .home-page [data-reveal]"
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
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );

        targets.forEach((el) => {
            if (!el.classList.contains("is-visible")) {
                el.classList.add("reveal");
                observer.observe(el);
            }
        });

        return () => observer.disconnect();
    }, [loading, error, filteredProducts, categoryData]);

    return (
        <>
            {/* Scroll progress + back to top */}
            <div className="scroll-progress" aria-hidden="true">
                <span style={{ transform: `scaleX(${scrollProgress})` }} />
            </div>

            <button
                type="button"
                className={`back-to-top ${showTop ? "visible" : ""}`}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Back to top"
            >
                <Icon name="up" size={20} />
            </button>

            <header className="home-header">
                <Navbar />

                <div className="home-login">
                    <Link to="/login" className="home-btn2">
                        Login
                    </Link>
                </div>
            </header>

            <main className="home-page">
                {/* ---------- Hero ---------- */}
                <section className="home-hero">
                    <div className="hero-content">
                        <Hero category="all" />
                    </div>
                </section>

                {/* ---------- Stats ---------- */}
                {!loading && !error && products.length > 0 && (
                    <section className="stats-band" data-reveal>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <strong className="stat-value">
                                    <CountUp end={products.length} />
                                </strong>
                                <span className="stat-label">Artworks Available</span>
                            </div>
                            <div className="stat-item">
                                <strong className="stat-value">
                                    <CountUp end={categoryData.length} />
                                </strong>
                                <span className="stat-label">Categories</span>
                            </div>
                            <div className="stat-item">
                                <strong className="stat-value">RWF</strong>
                                <span className="stat-label">Local Pricing</span>
                            </div>
                        </div>
                    </section>
                )}

                {/* ---------- Categories ---------- */}
                {!loading && categoryData.length > 0 && (
                    <section className="category-section">
                        <div className="section-heading">
                            <span>Find your style</span>
                            <h2>Shop by Category</h2>
                            <p>Pick a category to jump straight to matching artworks.</p>
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

                {/* ---------- All artworks ---------- */}
                <section className="home-section all-artworks" id="all-artworks">
                    <div className="section-heading">
                        <span>The Dreamaz Collection</span>
                        <h2>Explore All Artworks</h2>
                        <p>Find the perfect artwork for your space and style.</p>
                    </div>

                    <div className="art-toolbar">
                        <div className="art-search">
                            <Icon name="search" size={20} />
                            <input
                                type="text"
                                placeholder="Search artworks, categories or descriptions"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
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
                            onChange={(e) => setSortBy(e.target.value)}
                            aria-label="Sort artworks"
                        >
                            <option value="default">Sort: Default</option>
                            <option value="low">Price: Low to High</option>
                            <option value="high">Price: High to Low</option>
                            <option value="name">Name: A to Z</option>
                        </select>
                    </div>

                    <div
                        className="category-filters"
                        role="tablist"
                        aria-label="Filter by category"
                    >
                        {categories.map((category) => (
                            <button
                                key={category}
                                role="tab"
                                aria-selected={selectedCategory === category}
                                className={
                                    selectedCategory === category ? "active" : ""
                                }
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                                <small>{categoryCounts[category] || 0}</small>
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <SkeletonGrid />
                    ) : error ? (
                        <div className="home-status error" role="alert">
                            <h3>Something went wrong</h3>
                            <p>{error}</p>
                            <button onClick={fetchProducts}>Try Again</button>
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
                                <button onClick={clearFilters}>Clear Filters</button>
                            )}
                        </div>
                    ) : (
                        <>
                            <p className="results-count">
                                Showing <strong>{filteredProducts.length}</strong>{" "}
                                {filteredProducts.length === 1 ? "artwork" : "artworks"}
                            </p>

                            <div className="art-grid">
                                {filteredProducts.map((product, index) => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        index={index}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </section>

                {/* ---------- Why Dreamaz ---------- */}
                <section className="info-section">
                    <div className="section-heading center">
                        <span>Why Dreamaz</span>
                        <h2>Art Made Easy to Discover and Buy</h2>
                        <p>A simple, transparent way to find artwork you love.</p>
                    </div>

                    <div className="feature-grid">
                        {FEATURES.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="feature-card"
                                data-reveal
                                style={{ "--delay": `${index * 90}ms` }}
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

                {/* ---------- How it works ---------- */}
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
                                style={{ "--delay": `${index * 140}ms` }}
                            >
                                <div className="step-number">{index + 1}</div>
                                <h3>{step.title}</h3>
                                <p>{step.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ---------- CTA ---------- */}
                <section className="cta-banner" data-reveal>
                    <div className="cta-inner">
                        <div>
                            <h2>Ready to find your next favorite piece?</h2>
                            <p>
                                Create an account to save artworks to your cart and
                                track your orders in one place.
                            </p>
                        </div>

                        <div className="cta-actions">
                            <Link to="/register" className="cta-btn primary">
                                Create Account
                            </Link>
                            <Link to="/login" className="cta-btn secondary">
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