
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFire,
    faMagnifyingGlass,
    faRotate,
    faTrash,
    faBoxOpen,
    faTag,
    faCalendarDays,
    faEye,
    faXmark
} from "@fortawesome/free-solid-svg-icons";

import AdminNavbar from "./AdminNavbar";
import api from "./api";
import "./ManageTrendings.css";

function ManageTrendings() {
    const [trendings, setTrendings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedTrending, setSelectedTrending] = useState(null);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchTrendings();
    }, []);

    // Fetch all trending products
    const fetchTrendings = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/getTrending?category=all");

            const data =
                response.data.trendings ||
                response.data.trending ||
                response.data.products ||
                response.data;

            setTrendings(Array.isArray(data) ? data : []);

        } catch (err) {
            console.error("Fetch trendings error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load trending products."
            );
        } finally {
            setLoading(false);
        }
    };

    // Get product information from different possible structures
    const getProduct = (trending) => {
        return trending.product || trending.productId || trending;
    };

    const getName = (trending) => {
        const product = getProduct(trending);

        return (
            product.productName ||
            product.name ||
            product.title ||
            trending.productName ||
            trending.name ||
            "Untitled Product"
        );
    };

    const getImage = (trending) => {
        const product = getProduct(trending);

        return (
            product.image ||
            product.imageUrl ||
            product.productImage ||
            product.images?.[0] ||
            trending.image ||
            ""
        );
    };

    const getPrice = (trending) => {
        const product = getProduct(trending);

        return (
            product.price ??
            trending.price ??
            0
        );
    };

    const getCategory = (trending) => {
        const product = getProduct(trending);

        return (
            product.category ||
            trending.category ||
            "Uncategorized"
        );
    };

    const getId = (trending) => {
        return trending._id || trending.id;
    };

    const formatPrice = (price) => {
        return `${Number(price || 0).toLocaleString()} RWF`;
    };

    const formatDate = (date) => {
        if (!date) return "Not available";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not available";
        }

        return parsedDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    // Get unique categories
    const categories = useMemo(() => {
        return [
            "All",
            ...new Set(trendings.map(getCategory))
        ];
    }, [trendings]);

    // Search and filter
    const filteredTrendings = useMemo(() => {
        return trendings.filter((trending) => {
            const name = getName(trending).toLowerCase();
            const category = getCategory(trending);

            const matchesSearch = name.includes(searchTerm.toLowerCase());

            const matchesCategory =
                selectedCategory === "All" ||
                category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [trendings, searchTerm, selectedCategory]);

    // Delete trending entry
    const handleDelete = async (trending) => {
        const id = getId(trending);

        if (!id) {
            alert("This trending entry does not have a valid ID.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to remove "${getName(trending)}" from trending?`
        );

        if (!confirmed) return;

        try {
            setDeletingId(id);

            await api.delete(`/deleteTrending/${id}`);

            setTrendings((previous) =>
                previous.filter(item => getId(item) !== id)
            );

            if (selectedTrending && getId(selectedTrending) === id) {
                setSelectedTrending(null);
            }

        } catch (err) {
            console.error("Delete trending error:", err);

            alert(
                err.response?.data?.message ||
                "Failed to remove this trending entry."
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="manage-trendings-page">

            <AdminNavbar />

            <main className="manage-trendings-container">

                {/* PAGE HEADER */}
                <div className="manage-trendings-header">
                    <div>
                        <span className="manage-trendings-label">
                            ADMINISTRATION
                        </span>

                        <h1>
                            <FontAwesomeIcon icon={faFire} />
                            Manage Trendings
                        </h1>

                        <p>
                            Manage products featured in your trending section.
                        </p>
                    </div>

                    <button
                        className="manage-trendings-refresh"
                        onClick={fetchTrendings}
                        disabled={loading}
                    >
                        <FontAwesomeIcon
                            icon={faRotate}
                            spin={loading}
                        />
                        Refresh
                    </button>
                </div>

                {/* STATISTICS */}
                <section className="trending-stats">

                    <div className="trending-stat-card">
                        <div className="trending-stat-icon fire">
                            <FontAwesomeIcon icon={faFire} />
                        </div>

                        <div>
                            <span>Total Trendings</span>
                            <h2>{trendings.length}</h2>
                        </div>
                    </div>

                    <div className="trending-stat-card">
                        <div className="trending-stat-icon products">
                            <FontAwesomeIcon icon={faBoxOpen} />
                        </div>

                        <div>
                            <span>Categories</span>
                            <h2>{Math.max(categories.length - 1, 0)}</h2>
                        </div>
                    </div>

                    <div className="trending-stat-card">
                        <div className="trending-stat-icon featured">
                            <FontAwesomeIcon icon={faTag} />
                        </div>

                        <div>
                            <span>Filtered Results</span>
                            <h2>{filteredTrendings.length}</h2>
                        </div>
                    </div>

                </section>

                {/* MAIN CONTENT */}
                <section className="manage-trendings-content">

                    <div className="trending-toolbar">
                        <div>
                            <h2>Trending Products</h2>
                            <p>
                                View and manage your featured products.
                            </p>
                        </div>

                        <div className="trending-search">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />

                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* CATEGORY FILTERS */}
                    <div className="trending-category-filters">
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={
                                    selectedCategory === category
                                        ? "active"
                                        : ""
                                }
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* LOADING */}
                    {loading && (
                        <div className="trending-loading">
                            <div className="trending-spinner"></div>
                            <p>Loading trending products...</p>
                        </div>
                    )}

                    {/* ERROR */}
                    {!loading && error && (
                        <div className="trending-error">
                            <FontAwesomeIcon icon={faBoxOpen} />
                            <p>{error}</p>

                            <button onClick={fetchTrendings}>
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* EMPTY STATE */}
                    {!loading && !error && filteredTrendings.length === 0 && (
                        <div className="trending-empty">
                            <FontAwesomeIcon icon={faFire} />

                            <h3>No trending products found</h3>

                            <p>
                                {trendings.length === 0
                                    ? "Products added to trending will appear here."
                                    : "Try changing your search or category filter."}
                            </p>
                        </div>
                    )}

                    {/* TRENDING CARDS */}
                    {!loading && !error && filteredTrendings.length > 0 && (
                        <div className="trending-admin-grid">

                            {filteredTrendings.map((trending) => {
                                const id = getId(trending);

                                return (
                                    <article
                                        className="trending-admin-card"
                                        key={id}
                                    >

                                        <div className="trending-admin-image">

                                            {getImage(trending) ? (
                                                <img
                                                    src={getImage(trending)}
                                                    alt={getName(trending)}
                                                />
                                            ) : (
                                                <div className="trending-no-image">
                                                    <FontAwesomeIcon icon={faBoxOpen} />
                                                </div>
                                            )}

                                            <span className="trending-featured-badge">
                                                <FontAwesomeIcon icon={faFire} />
                                                Trending
                                            </span>

                                        </div>

                                        <div className="trending-admin-details">

                                            <span className="trending-admin-category">
                                                {getCategory(trending)}
                                            </span>

                                            <h3>{getName(trending)}</h3>

                                            <h4>
                                                {formatPrice(getPrice(trending))}
                                            </h4>

                                            <div className="trending-admin-date">
                                                <FontAwesomeIcon icon={faCalendarDays} />
                                                Added: {formatDate(
                                                    trending.createdAt ||
                                                    trending.dateAdded
                                                )}
                                            </div>

                                            <div className="trending-admin-actions">

                                                <button
                                                    className="trending-view-btn"
                                                    onClick={() =>
                                                        setSelectedTrending(trending)
                                                    }
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                    View
                                                </button>

                                                <button
                                                    className="trending-delete-btn"
                                                    onClick={() => handleDelete(trending)}
                                                    disabled={deletingId === id}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                    {deletingId === id
                                                        ? "Removing..."
                                                        : "Remove"}
                                                </button>

                                            </div>

                                        </div>

                                    </article>
                                );
                            })}

                        </div>
                    )}

                </section>

            </main>

            {/* PRODUCT DETAILS MODAL */}
            {selectedTrending && (
                <div
                    className="trending-details-overlay"
                    onClick={() => setSelectedTrending(null)}
                >
                    <div
                        className="trending-details-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="trending-modal-header">
                            <div>
                                <span>PRODUCT INFORMATION</span>
                                <h2>Trending Details</h2>
                            </div>

                            <button
                                onClick={() => setSelectedTrending(null)}
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>

                        {getImage(selectedTrending) && (
                            <img
                                className="trending-modal-image"
                                src={getImage(selectedTrending)}
                                alt={getName(selectedTrending)}
                            />
                        )}

                        <h3>{getName(selectedTrending)}</h3>

                        <div className="trending-modal-info">
                            <div>
                                <span>Category</span>
                                <strong>{getCategory(selectedTrending)}</strong>
                            </div>

                            <div>
                                <span>Price</span>
                                <strong>
                                    {formatPrice(getPrice(selectedTrending))}
                                </strong>
                            </div>

                            <div>
                                <span>Date Added</span>
                                <strong>
                                    {formatDate(
                                        selectedTrending.createdAt ||
                                        selectedTrending.dateAdded
                                    )}
                                </strong>
                            </div>
                        </div>

                        <button
                            className="trending-modal-close"
                            onClick={() => setSelectedTrending(null)}
                        >
                            Close
                        </button>

                    </div>
                </div>
            )}

        </div>
    );
}

export default ManageTrendings;
