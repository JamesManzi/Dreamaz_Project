import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import Hero from "./Hero";
import api from "./api";
import { useMessage } from "./ShowMessage";

import "./Fashion.css";

const PRODUCTS_PER_PAGE = 8;
const TRENDING_PRODUCTS_PER_COLLECTION = 4;

/* =========================================
   HELPERS
========================================= */

const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") {
        return "Price unavailable";
    }

    const amount = Number(price);

    if (!Number.isFinite(amount)) {
        return "Price unavailable";
    }

    return `${amount.toLocaleString()} RWF`;
};

const getPageNumbers = (current, total) => {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = new Set([
        1,
        total,
        current,
        current - 1,
        current + 1
    ]);

    const sorted = [...pages]
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

const getProductFiles = (fashion) => {
    if (!Array.isArray(fashion?.files)) return [];

    return fashion.files
        .map((file) => {
            if (typeof file === "string") {
                return {
                    url: file,
                    type: /\.(mp4|webm|ogg|mov)$/i.test(file)
                        ? "video"
                        : "image"
                };
            }

            if (!file?.url) return null;

            return {
                ...file,
                type:
                    file.type ||
                    (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(file.url)
                        ? "video"
                        : "image")
            };
        })
        .filter((file) => file?.url);
};

const getFashionCategory = (fashion) => {
    const possibleCategories = [
        fashion?.subCategory,
        fashion?.category,
        fashion?.productCategory,
        fashion?.type,
        fashion?.style
    ];

    const category = possibleCategories.find(
        (value) =>
            typeof value === "string" &&
            value.trim() &&
            value.trim().toLowerCase() !== "fashion"
    );

    return category ? category.trim() : "Fashion";
};

const getFashionDescription = (category) => {
    const descriptions = {
        men: "Explore clothing and accessories selected for everyday looks and special occasions.",
        women: "Discover outfits and accessories to help you express your personal style.",
        shoes: "Find footwear for casual days, work, events, and everything in between.",
        footwear: "Explore footwear for everyday comfort and different occasions.",
        accessories: "Complete your look with accessories that add personality to your style.",
        bags: "Discover bags for daily use, work, travel, and special occasions.",
        clothing: "Explore clothing options for different styles, seasons, and occasions.",
        dresses: "Browse dress styles suitable for casual outings and special events.",
        shirts: "Find shirts for everyday wear, work, and smart-casual outfits.",
        trousers: "Explore trousers and bottoms for different occasions and personal styles."
    };

    return (
        descriptions[category.toLowerCase()] ||
        `Explore ${category.toLowerCase()} styles and discover fashion items listed by our sellers.`
    );
};

/* =========================================
   ICONS
========================================= */

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

/* =========================================
   PERKS
========================================= */

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

/* =========================================
   FASHION COLLECTIONS
========================================= */

function FashionHighlights({ fashions, onOpen }) {
    const collections = useMemo(() => {
        if (!fashions.length) return [];

        const groups = new Map();

        fashions.forEach((fashion) => {
            const category = getFashionCategory(fashion);

            if (!groups.has(category)) {
                groups.set(category, []);
            }

            groups.get(category).push(fashion);
        });

        let result = [...groups.entries()].map(
            ([category, products]) => ({
                title: category === "Fashion"
                    ? "Featured Fashion"
                    : category,
                description: category === "Fashion"
                    ? "Explore selected fashion items from our marketplace."
                    : getFashionDescription(category),
                products: products.slice(
                    0,
                    TRENDING_PRODUCTS_PER_COLLECTION
                )
            })
        );

        /*
         * If the backend only returns one general Fashion category,
         * divide the products into different style edits so visitors
         * can discover more products as they scroll.
         */
        if (result.length === 1 && fashions.length > 4) {
            const chunks = [];

            for (
                let index = 0;
                index < fashions.length;
                index += TRENDING_PRODUCTS_PER_COLLECTION
            ) {
                chunks.push(
                    fashions.slice(
                        index,
                        index + TRENDING_PRODUCTS_PER_COLLECTION
                    )
                );
            }

            result = chunks.map((products, index) => ({
                title:
                    index === 0
                        ? "Featured Styles"
                        : `Style Edit ${index + 1}`,
                description:
                    index === 0
                        ? "Discover a selection of fashion items from our sellers."
                        : "Keep exploring more styles and find something that matches your look.",
                products
            }));
        }

        return result
            .filter((collection) => collection.products.length > 0)
            .slice(0, 6);
    }, [fashions]);

    if (!collections.length) return null;

    return (
        <section className="fashion-highlights">
            <div className="fashion-highlights-heading" data-reveal>
                <div>
                    <span>STYLE DISCOVERY</span>
                    <h2>Fashion Highlights</h2>
                    <p>
                        Explore different collections and discover styles
                        from our marketplace.
                    </p>
                </div>

                <span className="fashion-highlights-count">
                    {collections.length} Collections
                </span>
            </div>

            <div className="fashion-trending-list">
                {collections.map((collection, index) => (
                    <article
                        className={`fashion-trend-row ${
                            index % 2 === 1 ? "reverse" : ""
                        }`}
                        key={`${collection.title}-${index}`}
                        data-reveal
                        style={{
                            "--delay": `${(index % 3) * 100}ms`
                        }}
                    >
                        <div className="fashion-trend-description">
                            <span className="fashion-trend-number">
                                COLLECTION {String(index + 1).padStart(2, "0")}
                            </span>

                            <h3>{collection.title}</h3>

                            <p>{collection.description}</p>

                            <button
                                type="button"
                                onClick={() => {
                                    document
                                        .getElementById("fashion-products")
                                        ?.scrollIntoView({
                                            behavior: "smooth",
                                            block: "start"
                                        });
                                }}
                            >
                                Explore Collection
                                <span aria-hidden="true">→</span>
                            </button>
                        </div>

                        <div className="fashion-trend-products">
                            {collection.products.map((fashion) => {
                                const media = getProductFiles(fashion);
                                const firstMedia = media[0];

                                return (
                                    <button
                                        type="button"
                                        className="fashion-trend-card"
                                        key={fashion._id}
                                        onClick={() => onOpen(fashion._id)}
                                    >
                                        <div className="fashion-trend-image">
                                            {firstMedia?.type === "video" ? (
                                                <video
                                                    src={firstMedia.url}
                                                    muted
                                                    autoPlay
                                                    loop
                                                    playsInline
                                                    preload="metadata"
                                                />
                                            ) : firstMedia?.url ? (
                                                <img
                                                    src={firstMedia.url}
                                                    alt={
                                                        fashion.name ||
                                                        "Fashion product"
                                                    }
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="fashion-trend-no-image">
                                                    <Icon
                                                        name="image"
                                                        size={28}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="fashion-trend-card-info">
                                            <h4>
                                                {fashion.name ||
                                                    "Fashion Product"}
                                            </h4>

                                            <span>
                                                {formatPrice(fashion.price)}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

/* =========================================
   PRODUCT MEDIA CAROUSEL
========================================= */

function ProductCarousel({ files, productName, onOpen }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    const media = files || [];

    useEffect(() => {
        setActiveIndex(0);
    }, [files]);

    useEffect(() => {
        if (paused || media.length <= 1) return;

        const timer = window.setInterval(() => {
            setActiveIndex((current) => (current + 1) % media.length);
        }, 4000);

        return () => window.clearInterval(timer);
    }, [media.length, paused]);

    const previous = (event) => {
        event.stopPropagation();

        setActiveIndex(
            (current) => (current - 1 + media.length) % media.length
        );
    };

    const next = (event) => {
        event.stopPropagation();

        setActiveIndex((current) => (current + 1) % media.length);
    };

    const currentFile = media[activeIndex];

    return (
        <div
            className="fashion-card-media"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <button
                type="button"
                className="fashion-media-open"
                onClick={onOpen}
                aria-label={`View ${productName}`}
            >
                {currentFile?.type === "video" ? (
                    <video
                        key={currentFile.url}
                        src={currentFile.url}
                        muted
                        autoPlay
                        loop
                        playsInline
                        preload="metadata"
                    />
                ) : currentFile?.url ? (
                    <img
                        key={currentFile.url}
                        src={currentFile.url}
                        alt={productName || "Fashion product"}
                        loading="lazy"
                    />
                ) : (
                    <div className="fashion-no-image">
                        <Icon name="image" size={38} />
                        <span>No image available</span>
                    </div>
                )}
            </button>

            <span className="fashion-category-badge">Fashion</span>

            {media.length > 1 && (
                <>
                    <button
                        type="button"
                        className="fashion-carousel-arrow fashion-carousel-prev"
                        onClick={previous}
                        aria-label="Previous product image"
                    >
                        <Icon name="left" size={18} />
                    </button>

                    <button
                        type="button"
                        className="fashion-carousel-arrow fashion-carousel-next"
                        onClick={next}
                        aria-label="Next product image"
                    >
                        <Icon name="right" size={18} />
                    </button>

                    <div className="fashion-carousel-counter">
                        {activeIndex + 1}/{media.length}
                    </div>

                    <div className="fashion-carousel-dots">
                        {media.map((file, index) => (
                            <button
                                key={`${file.url}-${index}`}
                                type="button"
                                className={
                                    activeIndex === index ? "active" : ""
                                }
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setActiveIndex(index);
                                }}
                                aria-label={`Show image ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

/* =========================================
   PRODUCT CARD
========================================= */

function FashionCard({
    fashion,
    index,
    adding,
    onOpen,
    onAdd
}) {
    const files = useMemo(
        () => getProductFiles(fashion),
        [fashion.files]
    );

    const availability = fashion.availability;

    const isUnavailable =
        availability === false ||
        String(availability).toLowerCase() === "unavailable" ||
        String(availability).toLowerCase() === "out of stock";

    return (
        <article
            className="fashion-home-card"
            data-reveal
            style={{ "--delay": `${(index % 3) * 90}ms` }}
        >
            <ProductCarousel
                files={files}
                productName={fashion.name}
                onOpen={() => onOpen(fashion._id)}
            />

            <div className="fashion-home-card-body">
                <div className="fashion-card-topline">
                    <span className="fashion-card-category">
                        Fashion
                    </span>

                    {availability !== undefined &&
                        availability !== null &&
                        availability !== "" && (
                            <span
                                className={`fashion-stock-badge ${
                                    isUnavailable
                                        ? "unavailable"
                                        : "available"
                                }`}
                            >
                                {typeof availability === "boolean"
                                    ? availability
                                        ? "Available"
                                        : "Unavailable"
                                    : availability}
                            </span>
                        )}
                </div>

                <h3 title={fashion.name}>
                    {fashion.name || "Untitled Product"}
                </h3>

                <p className="fashion-home-description">
                    {fashion.description ||
                        "No description available."}
                </p>

                <div className="fashion-home-card-footer">
                    <div className="fashion-home-price">
                        <span>Price</span>
                        <strong>{formatPrice(fashion.price)}</strong>
                    </div>

                    <div className="fashion-home-actions">
                        <button
                            type="button"
                            className="fashion-view-button"
                            onClick={() => onOpen(fashion._id)}
                        >
                            View Details
                        </button>

                        <button
                            type="button"
                            className="fashion-cart-button"
                            disabled={adding || isUnavailable}
                            onClick={() => onAdd(fashion._id)}
                        >
                            {adding
                                ? "Adding..."
                                : isUnavailable
                                    ? "Unavailable"
                                    : "Add to Cart"}
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}

/* =========================================
   FASHION PAGE
========================================= */

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

    /* =========================================
       LOGIN PROMPT
    ========================================= */

    const askUserToLogin = () => {
        showError("Please log in to add products to your cart.");

        const shouldLogin = window.confirm(
            "You need to log in before adding products to your cart.\n\nWould you like to log in now?"
        );

        if (shouldLogin) {
            navigate("/login", {
                state: {
                    from: window.location.pathname
                }
            });
        }
    };

    /* =========================================
       FETCH FASHION PRODUCTS
    ========================================= */

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
                        res.data.message ||
                        "Unable to fetch Fashion products."
                    );
                }
            } catch (error) {
                console.error("Fashion fetching error:", error);

                showError(
                    error.response?.data?.message ||
                    "Unable to fetch Fashion products."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchFashion();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* =========================================
       SEARCH AND SORT
    ========================================= */

    const filteredFashions = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        const result = fashions.filter((fashion) =>
            !keyword ||
            fashion.name?.toLowerCase().includes(keyword) ||
            fashion.description?.toLowerCase().includes(keyword)
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
    }, [fashions, search, sortBy]);

    /* =========================================
       PAGINATION
    ========================================= */

    const totalPages = Math.ceil(
        filteredFashions.length / PRODUCTS_PER_PAGE
    );

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

    /* =========================================
       PRODUCT ACTIONS
    ========================================= */

    const openFashion = (id) => {
        navigate(`/fashion/${id}`);
    };

    const addToCart = async (productId) => {
        const token = localStorage.getItem("token");

        if (
            !token ||
            token === "null" ||
            token === "undefined"
        ) {
            askUserToLogin();
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
                    "Could not add product to your cart."
                );
            }
        } catch (error) {
            console.error("Add to cart error:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");

                askUserToLogin();
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

    /* =========================================
       SCROLL PROGRESS
    ========================================= */

    useEffect(() => {
        let ticking = false;

        const onScroll = () => {
            if (ticking) return;

            ticking = true;

            window.requestAnimationFrame(() => {
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

    /* =========================================
       REVEAL ANIMATIONS
    ========================================= */

    useEffect(() => {
        const targets = document.querySelectorAll(
            ".fashion-page .fashion-search-heading, " +
            ".fashion-page .fashion-toolbar, " +
            ".fashion-page [data-reveal]"
        );

        if (!("IntersectionObserver" in window)) {
            targets.forEach((element) => {
                element.classList.add("is-visible");
            });

            return;
        }

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
    }, [loading, fashions, displayedProducts]);

    /* =========================================
       PAGE UI
    ========================================= */

    return (
        <div className="fashion-page">
            <div className="fashion-progress" aria-hidden="true">
                <span
                    style={{
                        transform: `scaleX(${scrollProgress})`
                    }}
                />
            </div>

            <button
                type="button"
                className={`fashion-top ${showTop ? "visible" : ""}`}
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

            <Navbar />

            <section className="fashion-trending">
                <Hero category="Fashion" />
            </section>

            <main className="fashion-content">
                {/* FASHION COLLECTIONS THAT REVEAL ON SCROLL */}

                {!loading && fashions.length > 0 && (
                    <FashionHighlights
                        fashions={fashions}
                        onOpen={openFashion}
                    />
                )}

                {/* HEADING AND TOOLBAR */}

                <section
                    className="fashion-search-section"
                    ref={productsRef}
                    id="fashion-products"
                >
                    <div className="fashion-search-heading">
                        <div>
                            <span>DISCOVER OUR COLLECTION</span>

                            <h2>Explore Fashion</h2>

                            <p>
                                Find your favorite styles from our sellers.
                            </p>
                        </div>

                        <div className="fashion-total">
                            {filteredFashions.length}{" "}
                            {filteredFashions.length === 1
                                ? "Product"
                                : "Products"}
                        </div>
                    </div>

                    <div className="fashion-toolbar">
                        <div className="fashion-search">
                            <Icon name="search" size={20} />

                            <input
                                type="text"
                                placeholder="Search fashion products..."
                                value={search}
                                onChange={(event) =>
                                    handleSearch(event.target.value)
                                }
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
                            onChange={(event) =>
                                handleSort(event.target.value)
                            }
                            aria-label="Sort products"
                        >
                            <option value="default">Sort: Default</option>
                            <option value="low">Price: Low to High</option>
                            <option value="high">Price: High to Low</option>
                            <option value="name">Name: A to Z</option>
                        </select>
                    </div>
                </section>

                {/* PRODUCTS */}

                <section className="fashion-products-section">
                    {loading ? (
                        <div
                            className="fashion-products"
                            aria-busy="true"
                        >
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="fashion-skeleton"
                                />
                            ))}
                        </div>
                    ) : displayedProducts.length > 0 ? (
                        <div className="fashion-products">
                            {displayedProducts.map((fashion, index) => (
                                <FashionCard
                                    key={fashion._id}
                                    fashion={fashion}
                                    index={index}
                                    adding={
                                        addingProduct === fashion._id
                                    }
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
                            className="fashion-pagination"
                            aria-label="Pagination"
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    goToPage(currentPage - 1)
                                }
                                disabled={currentPage === 1}
                            >
                                ← Previous
                            </button>

                            <div className="fashion-page-numbers">
                                {getPageNumbers(
                                    currentPage,
                                    totalPages
                                ).map((page, index) =>
                                    page === "..." ? (
                                        <span
                                            key={`gap-${index}`}
                                            className="fashion-gap"
                                        >
                                            …
                                        </span>
                                    ) : (
                                        <button
                                            key={page}
                                            type="button"
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
                                            onClick={() =>
                                                goToPage(page)
                                            }
                                        >
                                            {page}
                                        </button>
                                    )
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    goToPage(currentPage + 1)
                                }
                                disabled={
                                    currentPage === totalPages
                                }
                            >
                                Next →
                            </button>
                        </nav>
                    )}
                </section>

                {/* PERKS */}

                <section className="fashion-perks">
                    {PERKS.map((perk, index) => (
                        <div
                            key={perk.title}
                            className="fashion-perk"
                            data-reveal
                            style={{
                                "--delay": `${index * 90}ms`
                            }}
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