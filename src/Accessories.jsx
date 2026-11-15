
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import { useMessage } from "./ShowMessage";
import "./Accessories.css";

function Accessories() {
    const [accessories, setAccessories] = useState([]);
    const [trending, setTrending] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const { showError } = useMessage();

    const productsPerPage = 8;

    // Fetch accessories
    useEffect(() => {
        const fetchAccessories = async () => {
            try {
                const response = await api.get("/getAccessories");

                if (response.data.success) {
                    const products = response.data.accessories || [];

                    setAccessories(products);

                    // Randomize trending accessories
                    const shuffled = [...products].sort(
                        () => Math.random() - 0.5
                    );

                    setTrending(shuffled.slice(0, 5));
                }
            } catch (error) {
                console.error("Error fetching accessories:", error);
                showError("Failed to load accessories.");
            } finally {
                setLoading(false);
            }
        };

        fetchAccessories();
    }, []);

    // Automatically rotate trending products
    useEffect(() => {
        if (trending.length <= 1) return;

        const interval = setInterval(() => {
            setActiveIndex((previous) =>
                (previous + 1) % trending.length
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [trending]);

    // Search accessories
    const filteredAccessories = accessories.filter((item) =>
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(
        filteredAccessories.length / productsPerPage
    );

    const startIndex = (currentPage - 1) * productsPerPage;

    const displayedAccessories = filteredAccessories.slice(
        startIndex,
        startIndex + productsPerPage
    );

    const handleSearch = (value) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const activeProduct = trending[activeIndex];
    const activeMedia = activeProduct?.files?.[0];

    return (
        <>
            <Navbar />

            <main className="accessories-page">

                {/* Trending Section */}
                {activeProduct && (
                    <section className="accessories-trending">

                        {activeMedia?.type === "video" ? (
                            <video
                                key={activeMedia.url}
                                src={activeMedia.url}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="accessories-trending-media"
                            />
                        ) : activeMedia?.url ? (
                            <img
                                src={activeMedia.url}
                                alt={activeProduct.name}
                                className="accessories-trending-media"
                            />
                        ) : null}

                        <div className="accessories-trending-overlay">
                            <div className="accessories-trending-content">
                                <span className="accessories-label">
                                    TRENDING ACCESSORIES
                                </span>

                                <h1>{activeProduct.name}</h1>

                                <p>
                                    {activeProduct.description}
                                </p>

                                <h2>
                                    {Number(activeProduct.price).toLocaleString()} RWF
                                </h2>

                                <button
                                    onClick={() =>
                                        navigate(`/accessories/${activeProduct._id}`)
                                    }
                                >
                                    Explore More
                                </button>
                            </div>

                            <div className="accessories-trending-indicators">
                                {trending.map((item, index) => (
                                    <span
                                        key={item._id}
                                        className={
                                            index === activeIndex ? "active" : ""
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Search */}
                <section className="accessories-products-section">

                    <div className="accessories-section-heading">
                        <div>
                            <span>OUR COLLECTION</span>
                            <h2>Explore Accessories</h2>
                            <p>Discover accessories that complete your style.</p>
                        </div>
                    </div>

                    <div className="accessories-search">
                        <input
                            type="text"
                            placeholder="Search accessories..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    {/* Products */}
                    {loading ? (
                        <p className="accessories-status">
                            Loading accessories...
                        </p>
                    ) : displayedAccessories.length > 0 ? (

                        <div className="accessories-grid">
                            {displayedAccessories.map((item) => {
                                const media = item.files?.[0];

                                return (
                                    <div
                                        className="accessories-card"
                                        key={item._id}
                                    >
                                        <div className="accessories-card-image">
                                            {media?.type === "video" ? (
                                                <video
                                                    src={media.url}
                                                    muted
                                                    playsInline
                                                />
                                            ) : media?.url ? (
                                                <img
                                                    src={media.url}
                                                    alt={item.name}
                                                />
                                            ) : (
                                                <div className="accessories-no-image">
                                                    No image available
                                                </div>
                                            )}
                                        </div>

                                        <div className="accessories-card-content">
                                            <h3>{item.name}</h3>

                                            <h4>
                                                {Number(item.price).toLocaleString()} RWF
                                            </h4>

                                            <p>
                                                {item.description?.length > 90
                                                    ? item.description.slice(0, 90) + "..."
                                                    : item.description}
                                            </p>

                                            <button
                                                onClick={() =>
                                                    navigate(`/accessories/${item._id}`)
                                                }
                                            >
                                                Explore More
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    ) : (
                        <p className="accessories-status">
                            No accessories found.
                        </p>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="accessories-pagination">

                            <button
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage((page) => page - 1)
                                }
                            >
                                Previous
                            </button>

                            {Array.from(
                                { length: totalPages },
                                (_, index) => index + 1
                            ).map((page) => (
                                <button
                                    key={page}
                                    className={
                                        currentPage === page ? "active" : ""
                                    }
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    setCurrentPage((page) => page + 1)
                                }
                            >
                                Next
                            </button>

                        </div>
                    )}

                </section>
            </main>

            <Footer />
        </>
    );
}

export default Accessories;
