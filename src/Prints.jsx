
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import { useMessage } from "./ShowMessage";
import "./Prints.css";

function Prints() {
    const [prints, setPrints] = useState([]);
    const [trending, setTrending] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const { showError } = useMessage();

    const productsPerPage = 8;

    // Fetch prints
    useEffect(() => {
        const fetchPrints = async () => {
            try {
                const response = await api.get("/prints");

                if (response.data.success) {
                    const products = response.data.prints || [];

                    setPrints(products);

                    const shuffled = [...products].sort(
                        () => Math.random() - 0.5
                    );

                    setTrending(shuffled.slice(0, 5));
                }
            } catch (error) {
                console.error("Error fetching prints:", error);
                showError("Failed to load prints.");
            } finally {
                setLoading(false);
            }
        };

        fetchPrints();
    }, []);

    // Auto rotate trending prints
    useEffect(() => {
        if (trending.length <= 1) return;

        const interval = setInterval(() => {
            setActiveIndex((previous) =>
                (previous + 1) % trending.length
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [trending]);

    // Search
    const filteredPrints = prints.filter((item) =>
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(
        filteredPrints.length / productsPerPage
    );

    const startIndex = (currentPage - 1) * productsPerPage;

    const displayedPrints = filteredPrints.slice(
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

            <main className="prints-page">

                {/* Trending Banner */}
                {activeProduct && (
                    <section className="prints-trending">

                        {activeMedia?.type === "video" ? (
                            <video
                                key={activeMedia.url}
                                src={activeMedia.url}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="prints-trending-media"
                            />
                        ) : activeMedia?.url ? (
                            <img
                                src={activeMedia.url}
                                alt={activeProduct.name}
                                className="prints-trending-media"
                            />
                        ) : null}

                        <div className="prints-trending-overlay">
                            <div className="prints-trending-content">

                                <span className="prints-label">
                                    TRENDING PRINTS
                                </span>

                                <h1>{activeProduct.name}</h1>

                                <p>{activeProduct.description}</p>

                                <h2>
                                    {Number(activeProduct.price).toLocaleString()} RWF
                                </h2>

                                <button
                                    onClick={() =>
                                        navigate(`/prints/${activeProduct._id}`)
                                    }
                                >
                                    Explore More
                                </button>

                            </div>

                            <div className="prints-indicators">
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

                {/* Prints Collection */}
                <section className="prints-products-section">

                    <div className="prints-heading">
                        <div>
                            <span>OUR COLLECTION</span>
                            <h2>Explore Prints</h2>
                            <p>
                                Discover creative prints and artwork for your style and space.
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="prints-search">
                        <input
                            type="text"
                            placeholder="Search prints..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    {/* Product listing */}
                    {loading ? (
                        <p className="prints-status">
                            Loading prints...
                        </p>
                    ) : displayedPrints.length > 0 ? (

                        <div className="prints-grid">

                            {displayedPrints.map((item) => {
                                const media = item.files?.[0];

                                return (
                                    <div className="prints-card" key={item._id}>

                                        <div className="prints-card-image">
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
                                                <div className="prints-no-image">
                                                    No image available
                                                </div>
                                            )}
                                        </div>

                                        <div className="prints-card-content">
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
                                                    navigate(`/prints/${item._id}`)
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
                        <p className="prints-status">
                            No prints found.
                        </p>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="prints-pagination">

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

export default Prints;
