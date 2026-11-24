
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import Hero from "./Hero";
import api from "./api";
import { useMessage } from "./ShowMessage";

import "./Accessories.css";

const PRODUCTS_PER_PAGE = 8;

/* =================================================================
   HELPERS
================================================================= */

const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") {
        return "Price unavailable";
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
        return "Price unavailable";
    }

    return `${numericPrice.toLocaleString()} RWF`;
};

const getPageNumbers = (current, total) => {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const sorted = [...new Set([
        1,
        total,
        current - 1,
        current,
        current + 1
    ])]
        .filter((page) => page >= 1 && page <= total)
        .sort((a, b) => a - b);

    const result = [];

    sorted.forEach((page, index) => {
        if (
            index > 0 &&
            page - sorted[index - 1] > 1
        ) {
            result.push("...");
        }

        result.push(page);
    });

    return result;
};

/* =================================================================
   ICONS
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

    sparkle: (
        <>
            <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
            <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />
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
    ),

    left: <path d="m15 18-6-6 6-6" />,

    right: <path d="m9 18 6-6-6-6" />
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
   PERKS
================================================================= */

const PERKS = [
    {
        icon: "sparkle",
        title: "Complete Your Style",
        text: "Find the finishing touches that match your look."
    },
    {
        icon: "tag",
        title: "Prices in RWF",
        text: "Clear local pricing on every accessory."
    },
    {
        icon: "shield",
        title: "Account Checkout",
        text: "Sign in to keep your cart and track your orders."
    }
];

/* =================================================================
   PRODUCT MEDIA CAROUSEL
================================================================= */

function AccessoryCarousel({ item, onOpen }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    const media = Array.isArray(item.files)
        ? item.files.filter((file) => file?.url)
        : [];

    const totalMedia = media.length;

    useEffect(() => {
        setActiveIndex(0);
    }, [item._id]);

    useEffect(() => {
        if (totalMedia <= 1 || paused) return;

        const interval = setInterval(() => {
            setActiveIndex((previous) =>
                (previous + 1) % totalMedia
            );
        }, 4000);

        return () => clearInterval(interval);
    }, [totalMedia, paused]);

    const previousSlide = (event) => {
        event.stopPropagation();

        setActiveIndex((previous) =>
            (previous - 1 + totalMedia) % totalMedia
        );
    };

    const nextSlide = (event) => {
        event.stopPropagation();

        setActiveIndex((previous) =>
            (previous + 1) % totalMedia
        );
    };

    const currentMedia = media[activeIndex];

    return (
        <div
            className="accessories-card-media"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onClick={() => onOpen(item._id)}
        >
            {currentMedia?.type === "video" ? (
                <video
                    key={currentMedia.url}
                    src={currentMedia.url}
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                />
            ) : currentMedia?.url ? (
                <img
                    key={currentMedia.url}
                    src={currentMedia.url}
                    alt={item.name || "Accessory"}
                    loading="lazy"
                />
            ) : (
                <div className="accessories-no-image">
                    <Icon name="image" size={42} />
                    <span>No image available</span>
                </div>
            )}

            <span className="accessories-category-badge">
                Accessories
            </span>

            {item.availability && (
                <span className="accessories-availability-badge">
                    {item.availability}
                </span>
            )}

            {totalMedia > 1 && (
                <>
                    <button
                        type="button"
                        className="accessories-carousel-arrow accessories-carousel-prev"
                        onClick={previousSlide}
                        aria-label="Previous image"
                    >
                        <Icon name="left" size={19} />
                    </button>

                    <button
                        type="button"
                        className="accessories-carousel-arrow accessories-carousel-next"
                        onClick={nextSlide}
                        aria-label="Next image"
                    >
                        <Icon name="right" size={19} />
                    </button>

                    <div
                        className="accessories-carousel-indicators"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {media.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                className={
                                    activeIndex === index ? "active" : ""
                                }
                                onClick={() => setActiveIndex(index)}
                                aria-label={`Show image ${index + 1}`}
                            />
                        ))}
                    </div>

                    <span className="accessories-media-counter">
                        {activeIndex + 1}/{totalMedia}
                    </span>
                </>
            )}
        </div>
    );
}

/* =================================================================
   HOME-STYLE ACCESSORY CARD
================================================================= */

function AccessoryCard({
    item,
    index,
    adding,
    onOpen,
    onAdd
}) {
    return (
        <article
            className="accessories-home-card"
            data-reveal
            style={{ "--delay": `${(index % 4) * 80}ms` }}
        >
            <AccessoryCarousel
                item={item}
                onOpen={onOpen}
            />

            <div className="accessories-card-content">
                <h3 title={item.name}>
                    {item.name}
                </h3>

                <p>
                    {item.description || "Discover this accessory."}
                </p>

                <div className="accessories-card-price">
                    {formatPrice(item.price)}
                </div>

                <div className="accessories-card-actions">
                    <button
                        type="button"
                        className="accessories-view-btn"
                        onClick={() => onOpen(item._id)}
                    >
                        View Details
                    </button>

                    <button
                        type="button"
                        className="accessories-cart-btn"
                        disabled={adding}
                        onClick={() => onAdd(item._id)}
                    >
                        {adding ? "Adding..." : "Add to Cart"}
                    </button>
                </div>
            </div>
        </article>
    );
}

/* =================================================================
   ACCESSORIES PAGE
================================================================= */

function Accessories() {
    const [accessories, setAccessories] = useState([]);
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

    /* ---------- Fetch accessories ---------- */

    useEffect(() => {
        const fetchAccessories = async () => {
            try {
                setLoading(true);

                const response = await api.get("/getAccessories");

                if (response.data.success) {
                    setAccessories(response.data.accessories || []);
                } else {
                    setAccessories([]);

                    showError(
                        response.data.message ||
                        "Failed to load accessories"
                    );
                }
            } catch (error) {
                console.error("Error fetching accessories:", error);

                showError(
                    error.response?.data?.message ||
                    "Failed to load accessories"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAccessories();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ---------- Search and sorting ---------- */

    const filteredAccessories = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        const result = accessories.filter((item) =>
            !keyword ||
            item.name?.toLowerCase().includes(keyword) ||
            item.description?.toLowerCase().includes(keyword)
        );

        if (sortBy === "low") {
            result.sort(
                (a, b) => Number(a.price) - Number(b.price)
            );
        } else if (sortBy === "high") {
            result.sort(
                (a, b) => Number(b.price) - Number(a.price)
            );
        } else if (sortBy === "name") {
            result.sort(
                (a, b) =>
                    (a.name || "").localeCompare(b.name || "")
            );
        }

        return result;
    }, [accessories, search, sortBy]);

    /* ---------- Pagination ---------- */

    const totalPages = Math.ceil(
        filteredAccessories.length / PRODUCTS_PER_PAGE
    );

    const displayedAccessories = filteredAccessories.slice(
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

    /* ---------- Product actions ---------- */

    const openAccessory = (id) => {
        navigate(`/accessories/${id}`);
    };

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
                "/cart/add",
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
                showSuccess("Product added to your cart.");
            } else {
                showError(
                    response.data.message ||
                    "Could not add product."
                );
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
                error.response?.data?.message ||
                "Failed to add product to cart."
            );
        } finally {
            setAddingProduct("");
        }
    };

    /* ---------- Scroll progress and back to top ---------- */

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

    /* ---------- Reveal animations ---------- */

    useEffect(() => {
        if (!("IntersectionObserver" in window)) return undefined;

        const targets = document.querySelectorAll(
            ".accessories-page .accessories-section-heading, " +
            ".accessories-page .accessories-toolbar, " +
            ".accessories-page [data-reveal]"
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
    }, [loading, displayedAccessories]);

    /* ---------- Render ---------- */

    return (
        <>
            <Navbar />

            <main className="accessories-page">

                <div
                    className="accessories-progress"
                    aria-hidden="true"
                >
                    <span
                        style={{
                            transform: `scaleX(${scrollProgress})`
                        }}
                    />
                </div>

                <button
                    type="button"
                    className={`accessories-top ${showTop ? "visible" : ""}`}
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

                {/* HERO */}

                <section className="accessories-trending">
                    <Hero category="Accessories" />
                </section>

                {/* PRODUCTS */}

                <section
                    className="accessories-products-section"
                    ref={productsRef}
                >
                    <div className="accessories-section-heading">
                        <div>
                            <span>OUR COLLECTION</span>

                            <h2>Explore Accessories</h2>

                            <p>
                                Discover accessories that complete your style.
                            </p>
                        </div>

                        <div className="accessories-total">
                            {filteredAccessories.length}{" "}
                            {filteredAccessories.length === 1
                                ? "Product"
                                : "Products"}
                        </div>
                    </div>

                    {/* SEARCH AND SORT */}

                    <div className="accessories-toolbar">
                        <div className="accessories-search">
                            <Icon name="search" size={20} />

                            <input
                                type="text"
                                placeholder="Search accessories..."
                                value={search}
                                onChange={(event) =>
                                    handleSearch(event.target.value)
                                }
                                aria-label="Search accessories"
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
                            onChange={(event) =>
                                handleSort(event.target.value)
                            }
                            aria-label="Sort accessories"
                        >
                            <option value="default">
                                Sort: Default
                            </option>

                            <option value="low">
                                Price: Low to High
                            </option>

                            <option value="high">
                                Price: High to Low
                            </option>

                            <option value="name">
                                Name: A to Z
                            </option>
                        </select>
                    </div>

                    {/* LOADING */}

                    {loading ? (
                        <div
                            className="accessories-grid"
                            aria-busy="true"
                        >
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="accessories-skeleton"
                                />
                            ))}
                        </div>
                    ) : displayedAccessories.length > 0 ? (

                        /* PRODUCT GRID */

                        <div className="accessories-grid">
                            {displayedAccessories.map((item, index) => (
                                <AccessoryCard
                                    key={item._id}
                                    item={item}
                                    index={index}
                                    adding={addingProduct === item._id}
                                    onOpen={openAccessory}
                                    onAdd={addToCart}
                                />
                            ))}
                        </div>
                    ) : (

                        /* EMPTY STATE */

                        <div className="accessories-empty">
                            <div className="accessories-empty-icon">
                                <Icon name="empty" size={30} />
                            </div>

                            <h3>
                                {accessories.length === 0
                                    ? "No accessories yet"
                                    : "No accessories found"}
                            </h3>

                            <p>
                                {accessories.length === 0
                                    ? "Please check back soon for new arrivals."
                                    : "Try searching using a different keyword."}
                            </p>

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => handleSearch("")}
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    )}

                    {/* PAGINATION */}

                    {!loading && totalPages > 1 && (
                        <nav
                            className="accessories-pagination"
                            aria-label="Pagination"
                        >
                            <button
                                disabled={currentPage === 1}
                                onClick={() =>
                                    goToPage(currentPage - 1)
                                }
                            >
                                ← Previous
                            </button>

                            {getPageNumbers(
                                currentPage,
                                totalPages
                            ).map((page, index) =>
                                page === "..." ? (
                                    <span
                                        key={`gap-${index}`}
                                        className="accessories-gap"
                                    >
                                        …
                                    </span>
                                ) : (
                                    <button
                                        key={page}
                                        className={
                                            currentPage === page
                                                ? "active"
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

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    goToPage(currentPage + 1)
                                }
                            >
                                Next →
                            </button>
                        </nav>
                    )}

                    {/* PERKS */}

                    <div className="accessories-perks">
                        {PERKS.map((perk, index) => (
                            <div
                                key={perk.title}
                                className="accessories-perk"
                                data-reveal
                                style={{
                                    "--delay": `${index * 90}ms`
                                }}
                            >
                                <div className="accessories-perk-icon">
                                    <Icon
                                        name={perk.icon}
                                        size={24}
                                    />
                                </div>

                                <div>
                                    <h3>{perk.title}</h3>
                                    <p>{perk.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}

export default Accessories;
