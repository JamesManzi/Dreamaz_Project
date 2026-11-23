import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import Hero from "./Hero";
import api from "./api";
import { useMessage } from "./ShowMessage";

import "./Fashion.css";

const PRODUCTS_PER_PAGE = 8;

/* =================================================================
   Helpers
   ================================================================= */
const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") {
        return "Price unavailable";
    }
    return `${Number(price).toLocaleString()} RWF`;
};

/* Builds a compact page list like: 1 … 4 5 6 … 12 */
const getPageNumbers = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages = new Set([1, total, current, current - 1, current + 1]);
    const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

    const result = [];
    sorted.forEach((page, i) => {
        if (i > 0 && page - sorted[i - 1] > 1) result.push("...");
        result.push(page);
    });
    return result;
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
    up: <path d="M12 19V5M5 12l7-7 7 7" />,
    tag: (
        <>
            <path d="M3 12V4h8l10 10-8 8L3 12z" />
            <circle cx="7.5" cy="8.5" r="1.2" />
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
    image: (
        <>
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 16l5-5 4 4 3-3 6 6" />
        </>
    ),
    empty: (
        <>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3M8.5 8.5l5 5M13.5 8.5l-5 5" />
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

const PERKS = [
    {
        icon: "tag",
        title: "Prices in RWF",
        text: "Clear local pricing on every fashion item."
    },
    {
        icon: "shield",
        title: "Account Checkout",
        text: "Sign in to keep your cart and track your orders."
    },
    {
        icon: "truck",
        title: "From Local Sellers",
        text: "Browse styles listed by sellers on the marketplace."
    }
];

/* =================================================================
   Product card (medium)
   ================================================================= */
function FashionCard({ fashion, index, adding, onOpen, onAdd }) {
    const file = fashion.files?.[0];

    return (
        <article
            className="fashion-product-card"
            data-reveal
            style={{ "--delay": `${(index % 4) * 80}ms` }}
        >
            <div
                className="fashion-product-image"
                onClick={() => onOpen(fashion._id)}
            >
                {file?.type === "video" ? (
                    <video src={file.url} muted playsInline preload="metadata" />
                ) : file?.url ? (
                    <img src={file.url} alt={fashion.name} loading="lazy" />
                ) : (
                    <div className="fashion-no-image">
                        <Icon name="image" size={34} />
                    </div>
                )}
            </div>

            <div className="fashion-product-info">
                <h3 title={fashion.name}>{fashion.name}</h3>
                <p>{fashion.description}</p>

                <h4>{formatPrice(fashion.price)}</h4>

                <div className="fashion-btns">
                    <button onClick={() => onOpen(fashion._id)}>View More</button>

                    <button
                        disabled={adding}
                        onClick={() => onAdd(fashion._id)}
                    >
                        {adding ? "Adding..." : "Add to Cart"}
                    </button>
                </div>
            </div>
        </article>
    );
}

/* =================================================================
   Page
   ================================================================= */
function Fashion() {
    const [fashions, setFashions] = useState([]);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("default");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [addingProduct, setAddingProduct] = useState("");

    const [scrollProgress, setScrollProgress] = useState(0);
    const [showTop, setShowTop] = useState(false);

    const productsRef = useRef(null);

    const navigate = useNavigate();
    const { showSuccess, showError } = useMessage();

    /* ---------- Fetch ---------- */
    useEffect(() => {
        const fetchFashion = async () => {
            try {
                setLoading(true);

                const res = await api.get("/getFashionProducts");

                if (res.data.success) {
                    setFashions(res.data.fashionProducts || []);
                } else {
                    setFashions([]);
                    showError(
                        res.data.message || "Unable to fetch Fashion products"
                    );
                }
            } catch (error) {
                console.error("Fashion fetching error:", error);

                showError(
                    error.response?.data?.message ||
                        "Unable to fetch Fashion products"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchFashion();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ---------- Search + sort ---------- */
    const filteredFashions = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        const result = fashions.filter(
            (fashion) =>
                !keyword ||
                fashion.name?.toLowerCase().includes(keyword) ||
                fashion.description?.toLowerCase().includes(keyword)
        );

        if (sortBy === "low") {
            result.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sortBy === "high") {
            result.sort((a, b) => Number(b.price) - Number(a.price));
        } else if (sortBy === "name") {
            result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        }

        return result;
    }, [fashions, search, sortBy]);

    /* ---------- Pagination ---------- */
    const totalPages = Math.ceil(filteredFashions.length / PRODUCTS_PER_PAGE);

    const displayedProducts = filteredFashions.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
    );

    const handleSearch = (value) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleSort = (value) => {
        setSortBy(value);
        setCurrentPage(1);
    };

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;

        setCurrentPage(page);

        productsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    };

    /* ---------- Actions ---------- */
    const openFashion = (id) => navigate(`/fashion/${id}`);

    const addToCart = async (productId) => {
        const token = localStorage.getItem("token");

        if (!token) {
            showError("Please log in to add items to your cart.");
            navigate("/login");
            return;
        }

        try {
            setAddingProduct(productId);

            const response = await api.post(
                "/api/cart/add",
                { productId, quantity: 1 },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                showSuccess("Product added to your cart.");
            } else {
                showError(response.data.message || "Could not add product.");
            }
        } catch (error) {
            console.error("Add to cart error:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                navigate("/login");
                return;
            }

            showError(
                error.response?.data?.message || "Failed to add product to cart."
            );
        } finally {
            setAddingProduct("");
        }
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
            ".fashion-page .fashion-search-heading, .fashion-page .fashion-toolbar, " +
                ".fashion-page [data-reveal]"
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
    }, [loading, displayedProducts]);

    return (
        <div className="fashion-page">
            <div className="fashion-progress" aria-hidden="true">
                <span style={{ transform: `scaleX(${scrollProgress})` }} />
            </div>

            <button
                type="button"
                className={`fashion-top ${showTop ? "visible" : ""}`}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Back to top"
            >
                <Icon name="up" size={20} />
            </button>

            <Navbar />

            {/* REUSABLE FASHION HERO */}
            <section className="fashion-trending">
                <Hero category="Fashion" />
            </section>

            <main className="fashion-content">
                {/* ---------- Heading + toolbar ---------- */}
                <section className="fashion-search-section" ref={productsRef}>
                    <div className="fashion-search-heading">
                        <div>
                            <span>DISCOVER OUR COLLECTION</span>
                            <h2>Explore Fashion</h2>
                            <p>Find your favorite styles from our sellers.</p>
                        </div>

                        <div className="fashion-total">
                            {filteredFashions.length}{" "}
                            {filteredFashions.length === 1 ? "Product" : "Products"}
                        </div>
                    </div>

                    <div className="fashion-toolbar">
                        <div className="fashion-search">
                            <Icon name="search" size={20} />

                            <input
                                type="text"
                                placeholder="Search fashion products..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                aria-label="Search fashion products"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => handleSearch("")}
                                    aria-label="Clear search"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => handleSort(e.target.value)}
                            aria-label="Sort products"
                        >
                            <option value="default">Sort: Default</option>
                            <option value="low">Price: Low to High</option>
                            <option value="high">Price: High to Low</option>
                            <option value="name">Name: A to Z</option>
                        </select>
                    </div>
                </section>

                {/* ---------- Products ---------- */}
                <section className="fashion-products-section">
                    {loading ? (
                        <div className="fashion-products" aria-busy="true">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="fashion-skeleton" />
                            ))}
                        </div>
                    ) : displayedProducts.length > 0 ? (
                        <div className="fashion-products">
                            {displayedProducts.map((fashion, index) => (
                                <FashionCard
                                    key={fashion._id}
                                    fashion={fashion}
                                    index={index}
                                    adding={addingProduct === fashion._id}
                                    onOpen={openFashion}
                                    onAdd={addToCart}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="fashion-empty">
                            <div className="fashion-empty-icon">
                                <Icon name="empty" size={30} />
                            </div>

                            <h3>
                                {fashions.length === 0
                                    ? "No fashion products yet"
                                    : "No Fashion Products Found"}
                            </h3>

                            <p>
                                {fashions.length === 0
                                    ? "Please check back soon for new arrivals."
                                    : "Try searching using a different keyword."}
                            </p>

                            {search && (
                                <button onClick={() => handleSearch("")}>
                                    Clear Search
                                </button>
                            )}
                        </div>
                    )}

                    {/* ---------- Pagination ---------- */}
                    {!loading && totalPages > 1 && (
                        <nav className="fashion-pagination" aria-label="Pagination">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                ← Previous
                            </button>

                            <div className="fashion-page-numbers">
                                {getPageNumbers(currentPage, totalPages).map(
                                    (page, i) =>
                                        page === "..." ? (
                                            <span key={`gap-${i}`} className="fashion-gap">
                                                …
                                            </span>
                                        ) : (
                                            <button
                                                key={page}
                                                className={
                                                    currentPage === page
                                                        ? "current-page"
                                                        : ""
                                                }
                                                aria-current={
                                                    currentPage === page
                                                        ? "page"
                                                        : undefined
                                                }
                                                onClick={() => goToPage(page)}
                                            >
                                                {page}
                                            </button>
                                        )
                                )}
                            </div>

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next →
                            </button>
                        </nav>
                    )}
                </section>

                {/* ---------- Perks ---------- */}
                <section className="fashion-perks">
                    {PERKS.map((perk, index) => (
                        <div
                            key={perk.title}
                            className="fashion-perk"
                            data-reveal
                            style={{ "--delay": `${index * 90}ms` }}
                        >
                            <div className="fashion-perk-icon">
                                <Icon name={perk.icon} size={24} />
                            </div>
                            <div>
                                <h3>{perk.title}</h3>
                                <p>{perk.text}</p>
                            </div>
                        </div>
                    ))}
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default Fashion;