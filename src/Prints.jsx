
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import Hero from "./Hero";
import api from "./api";
import { useMessage } from "./ShowMessage";

import "./Prints.css";

const PRODUCTS_PER_PAGE = 8;

/* =================================================================
   Helpers
================================================================= */

const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") {
        return "Price unavailable";
    }

    const number = Number(price);

    return Number.isFinite(number)
        ? `${number.toLocaleString()} RWF`
        : "Price unavailable";
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
        if (index > 0 && page - sorted[index - 1] > 1) {
            result.push("...");
        }

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

    frame: (
        <>
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <rect x="7" y="8" width="10" height="8" rx="1" />
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
   Perks
================================================================= */

const PERKS = [
    {
        icon: "frame",
        title: "Prints for Every Space",
        text: "Creative designs to brighten your home or office."
    },
    {
        icon: "tag",
        title: "Prices in RWF",
        text: "Clear local pricing on every print."
    },
    {
        icon: "shield",
        title: "Account Checkout",
        text: "Sign in to keep your cart and track your orders."
    }
];

/* =================================================================
   Product media carousel
================================================================= */

function PrintCarousel({ item, onOpen }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const media = Array.isArray(item.files)
        ? item.files.filter((file) => file?.url)
        : [];

    const mediaCount = media.length;

    useEffect(() => {
        setActiveIndex(0);
    }, [item._id]);

    useEffect(() => {
        if (mediaCount <= 1 || isPaused) return undefined;

        const interval = setInterval(() => {
            setActiveIndex((previous) => (previous + 1) % mediaCount);
        }, 4000);

        return () => clearInterval(interval);
    }, [mediaCount, isPaused]);

    const previousMedia = (event) => {
        event.stopPropagation();

        setActiveIndex((previous) =>
            (previous - 1 + mediaCount) % mediaCount
        );
    };

    const nextMedia = (event) => {
        event.stopPropagation();

        setActiveIndex((previous) =>
            (previous + 1) % mediaCount
        );
    };

    const currentMedia = media[activeIndex];

    return (
        <div
            className="prints-card-media"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onClick={() => onOpen(item._id)}
        >
            {currentMedia?.type === "video" ? (
                <video
                    key={currentMedia.url}
                    src={currentMedia.url}
                    muted
                    playsInline
                    preload="metadata"
                />
            ) : currentMedia?.url ? (
                <img
                    key={currentMedia.url}
                    src={currentMedia.url}
                    alt={item.name || "Print"}
                    loading="lazy"
                />
            ) : (
                <div className="prints-no-image">
                    <Icon name="image" size={42} />
                    <span>No image available</span>
                </div>
            )}

            <div className="prints-category-badge">
                Prints
            </div>

            {mediaCount > 1 && (
                <>
                    <button
                        type="button"
                        className="prints-carousel-arrow prints-carousel-prev"
                        onClick={previousMedia}
                        aria-label="Previous image"
                    >
                        <Icon name="left" size={19} />
                    </button>

                    <button
                        type="button"
                        className="prints-carousel-arrow prints-carousel-next"
                        onClick={nextMedia}
                        aria-label="Next image"
                    >
                        <Icon name="right" size={19} />
                    </button>

                    <div
                        className="prints-carousel-counter"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {activeIndex + 1} / {mediaCount}
                    </div>

                    <div
                        className="prints-carousel-dots"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {media.map((file, index) => (
                            <button
                                key={`${file.url}-${index}`}
                                type="button"
                                className={activeIndex === index ? "active" : ""}
                                onClick={() => setActiveIndex(index)}
                                aria-label={`Show media ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

/* =================================================================
   Home-style print card
================================================================= */

function PrintCard({ item, index, adding, onOpen, onAdd }) {
    return (
        <article
            className="prints-home-card"
            data-reveal
            style={{ "--delay": `${(index % 4) * 80}ms` }}
        >
            <PrintCarousel
                item={item}
                onOpen={onOpen}
            />

            <div className="prints-card-content">
                <div className="prints-card-category">
                    <span>PRINTS COLLECTION</span>
                </div>

                <h3 title={item.name}>
                    {item.name}
                </h3>

                <p>
                    {item.description || "Discover this beautiful print."}
                </p>

                <div className="prints-card-price">
                    {formatPrice(item.price)}
                </div>

                <div className="prints-btns">
                    <button
                        type="button"
                        className="prints-view-btn"
                        onClick={() => onOpen(item._id)}
                    >
                        Explore More
                    </button>

                    <button
                        type="button"
                        className="prints-cart-btn"
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
   Prints page
================================================================= */

function Prints() {
    const [prints, setPrints] = useState([]);
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

    /* ---------- Fetch prints ---------- */

    useEffect(() => {
        const fetchPrints = async () => {
            try {
                setLoading(true);

                const response = await api.get("/prints");

                if (response.data.success) {
                    setPrints(response.data.prints || []);
                } else {
                    setPrints([]);

                    showError(
                        response.data.message || "Failed to load prints."
                    );
                }
            } catch (error) {
                console.error("Error fetching prints:", error);

                showError(
                    error.response?.data?.message ||
                    "Failed to load prints."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPrints();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ---------- Search and sort ---------- */

    const filteredPrints = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        const result = prints.filter(
            (item) =>
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
                (a, b) => (a.name || "").localeCompare(b.name || "")
            );
        }

        return result;
    }, [prints, search, sortBy]);

    /* ---------- Pagination ---------- */

    const totalPages = Math.ceil(
        filteredPrints.length / PRODUCTS_PER_PAGE
    );

    const displayedPrints = filteredPrints.slice(
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

    const openPrint = (id) => {
        navigate(`/prints/${id}`);
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
                    response.data.message || "Could not add product."
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

                setScrollProgress(height > 0 ? top / height : 0);
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

    /* ---------- Reveal on scroll ---------- */

    useEffect(() => {
        if (!("IntersectionObserver" in window)) return undefined;

        const targets = document.querySelectorAll(
            ".prints-page .prints-heading, " +
            ".prints-page .prints-toolbar, " +
            ".prints-page [data-reveal]"
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
    }, [loading, displayedPrints]);

    /* ---------- Render ---------- */

    return (
        <>
            <Navbar />

            <main className="prints-page">
                <div
                    className="prints-progress"
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
                    className={`prints-top ${showTop ? "visible" : ""}`}
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

                {/* Hero */}

                <section className="prints-trending">
                    <Hero category="Prints" />
                </section>

                {/* Products */}

                <section
                    className="prints-products-section"
                    ref={productsRef}
                >
                    <div className="prints-heading">
                        <div>
                            <span>OUR COLLECTION</span>

                            <h2>Explore Prints</h2>

                            <p>
                                Discover creative prints and artwork for
                                your style and space.
                            </p>
                        </div>

                        <div className="prints-total">
                            {filteredPrints.length}{" "}
                            {filteredPrints.length === 1
                                ? "Product"
                                : "Products"}
                        </div>
                    </div>

                    {/* Search and sorting */}

                    <div className="prints-toolbar">
                        <div className="prints-search">
                            <Icon name="search" size={20} />

                            <input
                                type="text"
                                placeholder="Search prints..."
                                value={search}
                                onChange={(event) =>
                                    handleSearch(event.target.value)
                                }
                                aria-label="Search prints"
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
                            aria-label="Sort prints"
                        >
                            <option value="default">Sort: Default</option>
                            <option value="low">Price: Low to High</option>
                            <option value="high">Price: High to Low</option>
                            <option value="name">Name: A to Z</option>
                        </select>
                    </div>

                    {/* Loading */}

                    {loading ? (
                        <div
                            className="prints-grid"
                            aria-busy="true"
                        >
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="prints-skeleton"
                                />
                            ))}
                        </div>
                    ) : displayedPrints.length > 0 ? (
                        <div className="prints-grid">
                            {displayedPrints.map((item, index) => (
                                <PrintCard
                                    key={item._id}
                                    item={item}
                                    index={index}
                                    adding={addingProduct === item._id}
                                    onOpen={openPrint}
                                    onAdd={addToCart}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="prints-empty">
                            <div className="prints-empty-icon">
                                <Icon name="empty" size={30} />
                            </div>

                            <h3>
                                {prints.length === 0
                                    ? "No prints yet"
                                    : "No prints found"}
                            </h3>

                            <p>
                                {prints.length === 0
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

                    {/* Pagination */}

                    {!loading && totalPages > 1 && (
                        <nav
                            className="prints-pagination"
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
                                        className="prints-gap"
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

                    {/* Perks */}

                    <div className="prints-perks">
                        {PERKS.map((perk, index) => (
                            <div
                                key={perk.title}
                                className="prints-perk"
                                data-reveal
                                style={{
                                    "--delay": `${index * 90}ms`
                                }}
                            >
                                <div className="prints-perk-icon">
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

export default Prints;
