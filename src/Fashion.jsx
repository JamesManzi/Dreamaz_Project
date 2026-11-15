
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import { useMessage } from "./ShowMessage";
import "./Fashion.css";

function Fashion() {
    const [fashions, setFashions] = useState([]);
    const [trending, setTrending] = useState([]);
    const [activeTrending, setActiveTrending] = useState(0);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const { showError } = useMessage();

    const productsPerPage = 8;

    // FETCH FASHION PRODUCTS
    useEffect(() => {
        const FetchFashion = async () => {
            try {
                const res = await api.get("/getFashionProducts");

                if (res.data.success) {
                    const products = res.data.fashionProducts || [];

                    setFashions(products);

                    // Random trending products
                    const shuffled = [...products];

                    for (let i = shuffled.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));

                        [shuffled[i], shuffled[j]] =
                            [shuffled[j], shuffled[i]];
                    }

                    setTrending(shuffled.slice(0, 5));
                } else {
                    showError(
                        res.data.message || "Unable to fetch fashion"
                    );
                }
            } catch (error) {
                console.log("Fashion fetching error:", error);

                showError(
                    error.response?.data?.message ||
                    "Unable to fetch fashion products"
                );
            } finally {
                setLoading(false);
            }
        };

        FetchFashion();
    }, []);

    // AUTOMATIC TRENDING
    useEffect(() => {
        if (trending.length <= 1) return;

        const interval = setInterval(() => {
            setActiveTrending(prev =>
                (prev + 1) % trending.length
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [trending]);

    // SEARCH PRODUCTS
    const filteredFashions = fashions.filter(fashion => {
        const keyword = search.toLowerCase().trim();

        return (
            fashion.name?.toLowerCase().includes(keyword) ||
            fashion.description?.toLowerCase().includes(keyword)
        );
    });

    // PAGINATION
    const totalPages = Math.ceil(
        filteredFashions.length / productsPerPage
    );

    const displayedProducts = filteredFashions.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
    );

    const handleSearch = (value) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);

            window.scrollTo({
                top: 500,
                behavior: "smooth"
            });
        }
    };

    const activeProduct = trending[activeTrending];

    const openFashion = (id) => {
        navigate(`/fashion/${id}`);
    };

    return (
        <div className="fashion-page">

            <Navbar />

            {/* ================= TRENDING HERO ================= */}

            <section className="fashion-trending">

                {loading ? (
                    <div className="trending-loading">
                        Loading fashion...
                    </div>
                ) : activeProduct ? (

                    <div
                        className="trending-slider"
                        key={activeProduct._id}
                    >

                        <div className="trending-media">

                            {activeProduct.files?.[0]?.type === "image" ? (
                                <img
                                    src={activeProduct.files[0].url}
                                    alt={activeProduct.name}
                                    className="trending-hero-media"
                                />
                            ) : activeProduct.files?.[0]?.type === "video" ? (
                                <video
                                    key={activeProduct.files[0].url}
                                    src={activeProduct.files[0].url}
                                    className="trending-hero-media"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />
                            ) : (
                                <div className="trending-no-media">
                                    Fashion Collection
                                </div>
                            )}

                            <div className="trending-overlay"></div>

                            <div className="trending-content">

                                <span className="trending-label">
                                    ✦ TRENDING FASHION
                                </span>

                                <h1>{activeProduct.name}</h1>

                                <h2>
                                    {Number(activeProduct.price).toLocaleString()} RWF
                                </h2>

                                <p>{activeProduct.description}</p>

                                <button
                                    onClick={() =>
                                        openFashion(activeProduct._id)
                                    }
                                    className="trending-explore-button"
                                >
                                    Explore More →
                                </button>

                            </div>

                            <div className="trending-indicators">
                                {trending.map((item, index) => (
                                    <span
                                        key={item._id}
                                        className={
                                            activeTrending === index
                                                ? "active"
                                                : ""
                                        }
                                    />
                                ))}
                            </div>

                        </div>

                    </div>

                ) : (
                    <div className="trending-loading">
                        Fashion products will appear here.
                    </div>
                )}

            </section>

            <main className="fashion-content">

                {/* ================= SEARCH ================= */}

                <section className="fashion-search-section">

                    <div className="fashion-search-heading">
                        <div>
                            <span>DISCOVER OUR COLLECTION</span>
                            <h2>Explore Fashion</h2>
                            <p>
                                Find your favorite styles from our sellers.
                            </p>
                        </div>

                        <div className="fashion-total">
                            {filteredFashions.length} Products
                        </div>
                    </div>

                    <div className="fashion-search">

                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search fashion products..."
                            value={search}
                            onChange={(e) =>
                                handleSearch(e.target.value)
                            }
                        />

                        {search && (
                            <button onClick={() => handleSearch("")}>
                                ✕
                            </button>
                        )}

                    </div>

                </section>

                {/* ================= PRODUCTS ================= */}

                <section className="fashion-products-section">

                    {loading ? (
                        <div className="trending-loading">
                            Loading products...
                        </div>
                    ) : displayedProducts.length > 0 ? (

                        <div className="fashion-products">

                            {displayedProducts.map(fashion => {

                                const file = fashion.files?.[0];

                                return (
                                    <article
                                        className="fashion-product-card"
                                        key={fashion._id}
                                    >

                                        <div className="fashion-product-image">

                                            {file?.type === "image" ? (
                                                <img
                                                    src={file.url}
                                                    alt={fashion.name}
                                                    loading="lazy"
                                                />
                                            ) : file?.type === "video" ? (
                                                <video
                                                    src={file.url}
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                />
                                            ) : (
                                                <div className="fashion-no-image">
                                                    No image available
                                                </div>
                                            )}

                                        </div>

                                        <div className="fashion-product-info">

                                            <h3>{fashion.name}</h3>

                                            <h4>
                                                {Number(fashion.price).toLocaleString()} RWF
                                            </h4>

                                            <p>{fashion.description}</p>

                                            <button
                                                onClick={() =>
                                                    openFashion(fashion._id)
                                                }
                                            >
                                                Explore More →
                                            </button>

                                        </div>

                                    </article>
                                );
                            })}

                        </div>

                    ) : (
                        <div className="fashion-empty">
                            <h3>No Fashion Products Found</h3>
                            <p>
                                Try searching using a different keyword.
                            </p>
                        </div>
                    )}

                    {/* PRODUCT PAGINATION ONLY */}

                    {!loading && totalPages > 1 && (
                        <div className="fashion-pagination">

                            <button
                                onClick={() =>
                                    goToPage(currentPage - 1)
                                }
                                disabled={currentPage === 1}
                            >
                                ← Previous
                            </button>

                            <div className="fashion-page-numbers">
                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1
                                ).map(page => (
                                    <button
                                        key={page}
                                        className={
                                            currentPage === page
                                                ? "current-page"
                                                : ""
                                        }
                                        onClick={() => goToPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() =>
                                    goToPage(currentPage + 1)
                                }
                                disabled={currentPage === totalPages}
                            >
                                Next →
                            </button>

                        </div>
                    )}

                </section>

            </main>

            <Footer />

        </div>
    );
}

export default Fashion;
