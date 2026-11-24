import { useCallback, useEffect, useMemo, useState } from "react";
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
    faXmark,
    faLayerGroup,
    faChevronLeft,
    faChevronRight,
    faPenToSquare,
    faCloudArrowUp,
    faImage,
    faVideo
} from "@fortawesome/free-solid-svg-icons";

import AdminNavbar from "./AdminNavbar";
import api from "./api";
import "./ManageTrendings.css";
import Loading from "./Loading";
/* =========================================
   TRENDING PRODUCT MEDIA SLIDESHOW
========================================= */

function TrendingCarousel({ trending, files, name, onView }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        setCurrentIndex(0);
    }, [trending?._id, trending?.id]);

    useEffect(() => {
        if (files.length <= 1 || paused) return undefined;

        const interval = window.setInterval(() => {
            setCurrentIndex((previous) => (previous + 1) % files.length);
        }, 4000);

        return () => window.clearInterval(interval);
    }, [files.length, paused]);

    const nextSlide = (event) => {
        event.stopPropagation();
        if (files.length > 1) {
            setCurrentIndex((previous) => (previous + 1) % files.length);
        }
    };

    const previousSlide = (event) => {
        event.stopPropagation();
        if (files.length > 1) {
            setCurrentIndex((previous) =>
                (previous - 1 + files.length) % files.length
            );
        }
    };

    const currentFile = files[currentIndex];
    const fileUrl =
        typeof currentFile === "string" ? currentFile : currentFile?.url;
    const fileType =
        typeof currentFile === "object" && currentFile?.type
            ? currentFile.type
            : /\.(mp4|webm|ogg|mov)(\?|$)/i.test(fileUrl || "")
                ? "video"
                : "image";

    return (
        <div
            className="trending-admin-image"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onClick={onView}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") onView();
            }}
            aria-label={`View ${name}`}
        >
            {fileUrl ? (
                fileType === "video" ? (
                    <video
                        key={fileUrl}
                        src={fileUrl}
                        muted
                        playsInline
                        preload="metadata"
                    />
                ) : (
                    <img key={fileUrl} src={fileUrl} alt={name} loading="lazy" />
                )
            ) : (
                <span className="trending-no-image">
                    <FontAwesomeIcon icon={faBoxOpen} />
                    <small>No media available</small>
                </span>
            )}

            <span className="trending-featured-badge">
                <FontAwesomeIcon icon={faFire} />
                Trending
            </span>

            {files.length > 1 && (
                <>
                    <button
                        type="button"
                        className="trending-slide-arrow trending-slide-prev"
                        onClick={previousSlide}
                        aria-label="Previous image"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <button
                        type="button"
                        className="trending-slide-arrow trending-slide-next"
                        onClick={nextSlide}
                        aria-label="Next image"
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                    <span className="trending-slide-counter">
                        {currentIndex + 1} / {files.length}
                    </span>
                    <div className="trending-slide-dots">
                        {files.map((file, index) => (
                            <button
                                type="button"
                                key={`${typeof file === "string" ? file : file?.url}-${index}`}
                                className={index === currentIndex ? "active" : ""}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setCurrentIndex(index);
                                }}
                                aria-label={`Show media ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function ManageTrendings() {
    const [trendings, setTrendings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedTrending, setSelectedTrending] = useState(null);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [notice, setNotice] = useState("");
    const [noticeType, setNoticeType] = useState("success");

    // Product update state, following ManageProducts.
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [editingTrending, setEditingTrending] = useState(null);
    const [saving, setSaving] = useState(false);
    const [existingFiles, setExistingFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);

    const showNotification = (message, type = "success") => {
        setNotice(message);
        setNoticeType(type);
    };

    const fetchTrendings = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/getTrending?category=all");
            const data =
                response.data?.trendings ||
                response.data?.trending ||
                response.data?.products ||
                response.data;

            setTrendings(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch trendings error:", err);
            setError(
                err.response?.data?.message ||
                "Unable to load trending products. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTrendings();
    }, [fetchTrendings]);

    useEffect(() => {
        if (!notice) return undefined;
        const timer = window.setTimeout(() => setNotice(""), 3500);
        return () => window.clearTimeout(timer);
    }, [notice]);

    const getProduct = (trending) => {
        const candidate =
            trending?.product ||
            trending?.productId ||
            trending?.item ||
            trending;

        return candidate && typeof candidate === "object" ? candidate : trending;
    };

    const getName = (trending) => {
        const product = getProduct(trending);
        return (
            product?.productName ||
            product?.name ||
            product?.title ||
            trending?.productName ||
            trending?.name ||
            "Untitled Product"
        );
    };

    const getFiles = (trending) => {
        const product = getProduct(trending);
        const possibleFiles =
            product?.files ||
            product?.images ||
            product?.media ||
            trending?.files ||
            trending?.images ||
            [];

        if (Array.isArray(possibleFiles) && possibleFiles.length) {
            return possibleFiles
                .map((file) => {
                    if (typeof file === "string") return file;
                    if (file?.url) return file;
                    return null;
                })
                .filter(Boolean);
        }

        const singleImage =
            product?.image ||
            product?.imageUrl ||
            product?.productImage ||
            trending?.image ||
            trending?.imageUrl;

        return singleImage ? [singleImage] : [];
    };

    const getImage = (trending) => {
        const first = getFiles(trending)[0];
        return typeof first === "string" ? first : first?.url || "";
    };

    const getPrice = (trending) => {
        const product = getProduct(trending);
        return product?.price ?? trending?.price ?? 0;
    };

    const getCategory = (trending) => {
        const product = getProduct(trending);
        return product?.category || trending?.category || "Uncategorized";
    };

    const getId = (trending) =>
        trending?._id || trending?.id || trending?.trendingId;

    const getProductId = (trending) => {
        const product = getProduct(trending);
        return product?._id || product?.id || trending?.product?._id;
    };

    const getDate = (trending) =>
        trending?.createdAt ||
        trending?.dateAdded ||
        trending?.updatedAt ||
        getProduct(trending)?.createdAt;

    const formatPrice = (price) =>
        `${Number(price || 0).toLocaleString("en-US")} RWF`;

    const formatDate = (date) => {
        if (!date) return "Not available";
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) return "Not available";

        return parsedDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const categories = useMemo(
        () => ["All", ...new Set(trendings.map(getCategory).filter(Boolean))],
        [trendings]
    );

    const filteredTrendings = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return trendings.filter((trending) => {
            const name = getName(trending).toLowerCase();
            const category = getCategory(trending);
            const matchesSearch =
                !query ||
                name.includes(query) ||
                category.toLowerCase().includes(query);

            const matchesCategory =
                selectedCategory === "All" || category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [trendings, searchTerm, selectedCategory]);

    const handleDelete = async (trending) => {
        const id = getId(trending);

        if (!id) {
            showNotification("This trending entry does not have a valid ID.", "error");
            return;
        }

        if (!window.confirm(`Remove "${getName(trending)}" from the trending section?`)) {
            return;
        }

        try {
            setDeletingId(id);
            await api.delete(`/deleteTrending/${id}`);

            setTrendings((current) =>
                current.filter((item) => String(getId(item)) !== String(id))
            );

            setSelectedTrending((current) =>
                current && String(getId(current)) === String(id) ? null : current
            );

            showNotification("Trending product removed successfully.");
        } catch (err) {
            console.error("Delete trending error:", err);
            showNotification(
                err.response?.data?.message || "Failed to remove this trending entry.",
                "error"
            );
        } finally {
            setDeletingId(null);
        }
    };

    /* =========================================
       OPEN PRODUCT UPDATE FORM
    ========================================= */

    const handleUpdate = (trending) => {
        const product = getProduct(trending);
        const productId = getProductId(trending);

        if (!productId) {
            showNotification(
                "This trending entry does not contain a populated product ID, so its product cannot be edited here.",
                "error"
            );
            return;
        }

        setEditingTrending({
            ...product,
            _id: productId,
            name: product?.name || product?.productName || product?.title || "",
            price: product?.price ?? "",
            category: product?.category || "",
            availability: product?.availability || "available",
            description: product?.description || ""
        });

        const media = getFiles(trending);
        setExistingFiles(
            media.map((file) =>
                typeof file === "string"
                    ? {
                        url: file,
                        type: /\.(mp4|webm|ogg|mov)(\?|$)/i.test(file) ? "video" : "image"
                    }
                    : file
            )
        );
        setSelectedFiles([]);
        setFilePreviews([]);
        setShowUpdateForm(true);
        setSelectedTrending(null);
    };

    const handleEditField = (field, value) => {
        setEditingTrending((current) => ({
            ...current,
            [field]: value
        }));
    };

    const handleFileChange = (event) => {
        const incomingFiles = Array.from(event.target.files || []);
        if (!incomingFiles.length) return;

        const allowedFiles = incomingFiles.filter(
            (file) =>
                file.type.startsWith("image/") ||
                file.type.startsWith("video/")
        );

        if (allowedFiles.length !== incomingFiles.length) {
            showNotification("Only image and video files are allowed.", "error");
        }

        const previews = allowedFiles.map((file) => ({
            file,
            url: URL.createObjectURL(file),
            type: file.type.startsWith("video/") ? "video" : "image"
        }));

        setSelectedFiles((current) => [...current, ...allowedFiles]);
        setFilePreviews((current) => [...current, ...previews]);
        event.target.value = "";
    };

    const removeSelectedFile = (index) => {
        setFilePreviews((current) => {
            const preview = current[index];
            if (preview?.url) URL.revokeObjectURL(preview.url);
            return current.filter((_, itemIndex) => itemIndex !== index);
        });

        setSelectedFiles((current) =>
            current.filter((_, itemIndex) => itemIndex !== index)
        );
    };

    const removeExistingFile = (index) => {
        setExistingFiles((current) =>
            current.filter((_, itemIndex) => itemIndex !== index)
        );
    };

    const clearFilePreviews = () => {
        filePreviews.forEach((preview) => {
            if (preview.url) URL.revokeObjectURL(preview.url);
        });
    };

    const closeUpdateForm = () => {
        if (saving) return;
        clearFilePreviews();
        setShowUpdateForm(false);
        setEditingTrending(null);
        setExistingFiles([]);
        setSelectedFiles([]);
        setFilePreviews([]);
    };

    /* =========================================
       SAVE PRODUCT UPDATE
       Uses the same product update endpoint and
       multipart field names as ManageProducts.
    ========================================= */

    const handleSaveUpdate = async (event) => {
        event.preventDefault();
        if (!editingTrending) return;

        if (!editingTrending.name?.trim()) {
            showNotification("Product name is required.", "error");
            return;
        }

        if (
            editingTrending.price === "" ||
            Number(editingTrending.price) < 0 ||
            !Number.isFinite(Number(editingTrending.price))
        ) {
            showNotification("Enter a valid product price.", "error");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            showNotification("Please log in again to update this product.", "error");
            return;
        }

        try {
            setSaving(true);

            const formData = new FormData();
            formData.append("name", editingTrending.name.trim());
            formData.append("price", editingTrending.price);
            formData.append("category", editingTrending.category || "");
            formData.append(
                "availability",
                editingTrending.availability || "available"
            );
            formData.append("description", editingTrending.description || "");
            formData.append("existingFiles", JSON.stringify(existingFiles));

            selectedFiles.forEach((file) => {
                formData.append("files", file);
            });

            const response = await api.post(
                `/updateProduct/${editingTrending._id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data?.success) {
                await fetchTrendings();
                clearFilePreviews();
                setShowUpdateForm(false);
                setEditingTrending(null);
                setExistingFiles([]);
                setSelectedFiles([]);
                setFilePreviews([]);
                showNotification(
                    response.data.message || "Product updated successfully."
                );
            } else {
                showNotification(
                    response.data?.message || "Unable to update this product.",
                    "error"
                );
            }
        } catch (err) {
            console.error("Updating trending product error:", err);
            showNotification(
                err.response?.data?.message ||
                "Something went wrong while updating the product.",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (!selectedTrending && !showUpdateForm) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                if (showUpdateForm) closeUpdateForm();
                else setSelectedTrending(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedTrending, showUpdateForm, saving]);

    return (
        <div className="manage-trendings-page">
            <AdminNavbar />

            <main className="manage-trendings-container">
                <header className="manage-trendings-header">
                    <div className="manage-trendings-heading">
                        <span className="manage-trendings-eyebrow">
                            DREAMAZ INK / ADMINISTRATION
                        </span>
                        <h1>
                            <span className="manage-trendings-title-icon">
                                <FontAwesomeIcon icon={faFire} />
                            </span>
                            Manage Trendings
                        </h1>
                        <p>
                            Manage featured products, update product information,
                            and control the trending section.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="manage-trendings-refresh"
                        onClick={fetchTrendings}
                        disabled={loading}
                    >
                        <FontAwesomeIcon icon={faRotate} spin={loading} />
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </header>

                <section className="trending-stats" aria-label="Trending overview">
                    <article className="trending-stat-card">
                        <div className="trending-stat-icon trending-stat-fire">
                            <FontAwesomeIcon icon={faFire} />
                        </div>
                        <div>
                            <span>Total trendings</span>
                            <strong>{trendings.length}</strong>
                            <small>Featured entries</small>
                        </div>
                    </article>

                    <article className="trending-stat-card">
                        <div className="trending-stat-icon trending-stat-category">
                            <FontAwesomeIcon icon={faLayerGroup} />
                        </div>
                        <div>
                            <span>Categories</span>
                            <strong>{Math.max(categories.length - 1, 0)}</strong>
                            <small>Represented in trending</small>
                        </div>
                    </article>

                    <article className="trending-stat-card">
                        <div className="trending-stat-icon trending-stat-filter">
                            <FontAwesomeIcon icon={faTag} />
                        </div>
                        <div>
                            <span>Showing results</span>
                            <strong>{filteredTrendings.length}</strong>
                            <small>Based on current filters</small>
                        </div>
                    </article>
                </section>

                <section className="manage-trendings-content">
                    <div className="trending-toolbar">
                        <div>
                            <span className="trending-section-kicker">
                                CONTENT MANAGEMENT
                            </span>
                            <h2>Trending products</h2>
                            <p>
                                Browse featured items, edit product details, or remove them.
                            </p>
                        </div>

                        <label className="trending-search">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                            <input
                                type="search"
                                placeholder="Search name or category..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    aria-label="Clear search"
                                    onClick={() => setSearchTerm("")}
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            )}
                        </label>
                    </div>

                    <div className="trending-filter-row">
                        <div className="trending-category-filters">
                            {categories.map((category) => (
                                <button
                                    type="button"
                                    key={category}
                                    className={
                                        selectedCategory === category ? "active" : ""
                                    }
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                        <span className="trending-result-count">
                            {filteredTrendings.length}{" "}
                            {filteredTrendings.length === 1 ? "item" : "items"}
                        </span>
                    </div>

                    {/* FEATURED COLLECTIONS */}
         {!loading && error && (
                        <div className="trending-state trending-error">
                            <div className="trending-state-icon">
                                <FontAwesomeIcon icon={faBoxOpen} />
                            </div>
                            <h3>Could not load trendings</h3>
                            <p>{error}</p>
                            <button type="button" onClick={fetchTrendings}>
                                Try again
                            </button>
                        </div>
                    )}

                    {!loading && !error && filteredTrendings.length === 0 && (
                        <div className="trending-state trending-empty">
                            <div className="trending-state-icon">
                                <FontAwesomeIcon icon={faFire} />
                            </div>
                            <h3>No trending products found</h3>
                            <p>
                                {trendings.length === 0
                                    ? "Products added to trending will appear here."
                                    : "Try another search term or choose a different category."}
                            </p>
                            {(searchTerm || selectedCategory !== "All") && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedCategory("All");
                                    }}
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}

                    {!loading && !error && filteredTrendings.length > 0 && (
                        <div className="trending-admin-grid">
                            {filteredTrendings.map((trending, index) => {
                                const id = getId(trending);
                                const files = getFiles(trending);

                                return (
                                    <article
                                        className="trending-admin-card"
                                        key={id || `${getName(trending)}-${index}`}
                                    >
                                        <TrendingCarousel
                                            trending={trending}
                                            files={files}
                                            name={getName(trending)}
                                            onView={() => setSelectedTrending(trending)}
                                        />

                                        <div className="trending-admin-details">
                                            <div className="trending-card-topline">
                                                <span className="trending-admin-category">
                                                    {getCategory(trending)}
                                                </span>
                                                <span className="trending-card-number">
                                                    #{String(index + 1).padStart(2, "0")}
                                                </span>
                                            </div>

                                            <h3 title={getName(trending)}>
                                                {getName(trending)}
                                            </h3>
                                            <h4>{formatPrice(getPrice(trending))}</h4>

                                            <div className="trending-admin-date">
                                                <FontAwesomeIcon icon={faCalendarDays} />
                                                <span>Added {formatDate(getDate(trending))}</span>
                                            </div>

                                            <div className="trending-admin-actions">
                                                <button
                                                    type="button"
                                                    className="trending-view-btn"
                                                    onClick={() => setSelectedTrending(trending)}
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                    View
                                                </button>
                                                <button
                                                    type="button"
                                                    className="trending-edit-btn"
                                                    onClick={() => handleUpdate(trending)}
                                                >
                                                    <FontAwesomeIcon icon={faPenToSquare} />
                                                    Update
                                                </button>
                                                <button
                                                    type="button"
                                                    className="trending-delete-btn"
                                                    onClick={() => handleDelete(trending)}
                                                    disabled={deletingId === id}
                                                    aria-label={`Remove ${getName(trending)} from trending`}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                    {deletingId === id ? "..." : "Remove"}
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

            {notice && (
                <div className={`trending-toast ${noticeType}`} role="status">
                    <span>{notice}</span>
                    <button
                        type="button"
                        onClick={() => setNotice("")}
                        aria-label="Dismiss notification"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
            )}

            {/* VIEW DETAILS MODAL */}
            {selectedTrending && (
                <div
                    className="trending-details-overlay"
                    onClick={() => setSelectedTrending(null)}
                >
                    <section
                        className="trending-details-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="trending-modal-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="trending-modal-header">
                            <div>
                                <span>PRODUCT INFORMATION</span>
                                <h2 id="trending-modal-title">Trending details</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedTrending(null)}
                                aria-label="Close details"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>

                        {getImage(selectedTrending) ? (
                            <img
                                className="trending-modal-image"
                                src={getImage(selectedTrending)}
                                alt={getName(selectedTrending)}
                            />
                        ) : (
                            <div className="trending-modal-image trending-modal-no-image">
                                <FontAwesomeIcon icon={faBoxOpen} />
                            </div>
                        )}

                        <div className="trending-modal-product-heading">
                            <span className="trending-admin-category">
                                {getCategory(selectedTrending)}
                            </span>
                            <h3>{getName(selectedTrending)}</h3>
                            <strong>{formatPrice(getPrice(selectedTrending))}</strong>
                        </div>

                        <div className="trending-modal-info">
                            <div>
                                <span>Category</span>
                                <strong>{getCategory(selectedTrending)}</strong>
                            </div>
                            <div>
                                <span>Date added</span>
                                <strong>{formatDate(getDate(selectedTrending))}</strong>
                            </div>
                            <div>
                                <span>Media files</span>
                                <strong>{getFiles(selectedTrending).length}</strong>
                            </div>
                            <div>
                                <span>Trending status</span>
                                <strong className="trending-status-active">
                                    <i /> Featured
                                </strong>
                            </div>
                        </div>

                        <div className="trending-modal-actions">
                            <button
                                type="button"
                                className="trending-modal-close"
                                onClick={() => setSelectedTrending(null)}
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                className="trending-modal-edit"
                                onClick={() => handleUpdate(selectedTrending)}
                            >
                                <FontAwesomeIcon icon={faPenToSquare} />
                                Update product
                            </button>
                            <button
                                type="button"
                                className="trending-modal-remove"
                                onClick={() => handleDelete(selectedTrending)}
                                disabled={deletingId === getId(selectedTrending)}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                                Remove
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {/* UPDATE PRODUCT MODAL */}
            {showUpdateForm && editingTrending && (
                <div className="trending-details-overlay trending-update-overlay">
                    <form
                        className="trending-update-modal"
                        onSubmit={handleSaveUpdate}
                    >
                        <div className="trending-modal-header">
                            <div>
                                <span>PRODUCT MANAGEMENT</span>
                                <h2>Update product</h2>
                            </div>
                            <button
                                type="button"
                                onClick={closeUpdateForm}
                                disabled={saving}
                                aria-label="Close update form"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>

                        <div className="trending-update-fields">
                            <label>
                                Product name
                                <input
                                    type="text"
                                    value={editingTrending.name}
                                    onChange={(event) =>
                                        handleEditField("name", event.target.value)
                                    }
                                    placeholder="Enter product name"
                                    required
                                />
                            </label>

                            <div className="trending-update-two-columns">
                                <label>
                                    Price (RWF)
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={editingTrending.price}
                                        onChange={(event) =>
                                            handleEditField("price", event.target.value)
                                        }
                                        placeholder="Enter price"
                                        required
                                    />
                                </label>

                                <label>
                                    Category
                                    <select
                                        value={editingTrending.category}
                                        onChange={(event) =>
                                            handleEditField("category", event.target.value)
                                        }
                                        required
                                    >
                                        <option value="">Select category</option>
                                        <option value="Fashion">Fashion</option>
                                        <option value="Accessories">Accessories</option>
                                        <option value="Prints">Prints</option>
                                        <option value="Collections">Collections</option>
                                    </select>
                                </label>
                            </div>

                            <label>
                                Availability
                                <select
                                    value={editingTrending.availability}
                                    onChange={(event) =>
                                        handleEditField("availability", event.target.value)
                                    }
                                >
                                    <option value="available">Available</option>
                                    <option value="sold">Sold</option>
                                    <option value="reserved">Reserved</option>
                                </select>
                            </label>

                            <label>
                                Product description
                                <textarea
                                    rows="4"
                                    value={editingTrending.description}
                                    onChange={(event) =>
                                        handleEditField("description", event.target.value)
                                    }
                                    placeholder="Write a product description..."
                                />
                            </label>
                        </div>

                        <div className="trending-media-editor">
                            <div className="trending-media-heading">
                                <div>
                                    <h3>Product images and videos</h3>
                                    <p>Remove existing files or add new media.</p>
                                </div>
                                <label className="trending-upload-button">
                                    <FontAwesomeIcon icon={faCloudArrowUp} />
                                    Add files
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        multiple
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>

                            <div className="trending-edit-media-grid">
                                {existingFiles.map((file, index) => (
                                    <div className="trending-edit-media-item" key={`existing-${file.url}-${index}`}>
                                        {file.type === "video" ||
                                        /\.(mp4|webm|ogg|mov)(\?|$)/i.test(file.url || "") ? (
                                            <video src={file.url} muted />
                                        ) : (
                                            <img src={file.url} alt={`Existing media ${index + 1}`} />
                                        )}
                                        <span className="trending-media-existing">Existing</span>
                                        <button
                                            type="button"
                                            onClick={() => removeExistingFile(index)}
                                            aria-label="Remove existing media"
                                        >
                                            <FontAwesomeIcon icon={faXmark} />
                                        </button>
                                    </div>
                                ))}

                                {filePreviews.map((preview, index) => (
                                    <div className="trending-edit-media-item" key={`new-${preview.url}`}>
                                        {preview.type === "video" ? (
                                            <video src={preview.url} muted />
                                        ) : (
                                            <img src={preview.url} alt={`New media ${index + 1}`} />
                                        )}
                                        <span className="trending-media-new">New</span>
                                        <button
                                            type="button"
                                            onClick={() => removeSelectedFile(index)}
                                            aria-label="Remove selected media"
                                        >
                                            <FontAwesomeIcon icon={faXmark} />
                                        </button>
                                    </div>
                                ))}

                                {existingFiles.length === 0 && filePreviews.length === 0 && (
                                    <div className="trending-no-edit-media">
                                        <FontAwesomeIcon icon={faImage} />
                                        <span>No media selected</span>
                                    </div>
                                )}
                            </div>

                            <p className="trending-media-help">
                                <FontAwesomeIcon icon={faVideo} />
                                Supported media: images and videos. Changes are saved with the product.
                            </p>
                        </div>

                        <div className="trending-update-actions">
                            <button
                                type="button"
                                className="trending-update-cancel"
                                onClick={closeUpdateForm}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="trending-update-save"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <FontAwesomeIcon icon={faRotate} spin />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faPenToSquare} />
                                        Save changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default ManageTrendings;
