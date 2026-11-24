
import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

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

/* =========================================
   HELPERS
========================================= */

const getTrendingId = (trending) => trending?._id || trending?.id;

const getTrendingName = (trending) =>
    trending?.name || "Untitled Trending";

const getTrendingFiles = (trending) => {
    if (!Array.isArray(trending?.files)) return [];

    return trending.files.filter(
        (file) => file && (typeof file === "string" || file.url)
    );
};

const getFileUrl = (file) =>
    typeof file === "string" ? file : file?.url || "";

const getFileType = (file) => {
    if (typeof file === "object" && file?.type) {
        return file.type;
    }

    return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(getFileUrl(file))
        ? "video"
        : "image";
};

const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return parsedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

/* =========================================
   TRENDING MEDIA SLIDESHOW
========================================= */

function TrendingCarousel({
    trending,
    files,
    name,
    onView
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        setCurrentIndex(0);
    }, [trending?._id]);

    useEffect(() => {
        if (files.length <= 1 || paused) return undefined;

        const interval = window.setInterval(() => {
            setCurrentIndex((previous) =>
                (previous + 1) % files.length
            );
        }, 4000);

        return () => window.clearInterval(interval);
    }, [files.length, paused]);

    const nextSlide = (event) => {
        event.stopPropagation();

        setCurrentIndex((previous) =>
            (previous + 1) % files.length
        );
    };

    const previousSlide = (event) => {
        event.stopPropagation();

        setCurrentIndex((previous) =>
            (previous - 1 + files.length) % files.length
        );
    };

    const currentFile = files[currentIndex];
    const fileUrl = getFileUrl(currentFile);
    const fileType = getFileType(currentFile);

    return (
        <div
            className="trending-admin-image"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onClick={onView}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onView();
                }
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
                    <img
                        key={fileUrl}
                        src={fileUrl}
                        alt={name}
                        loading="lazy"
                    />
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
                        aria-label="Previous media"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>

                    <button
                        type="button"
                        className="trending-slide-arrow trending-slide-next"
                        onClick={nextSlide}
                        aria-label="Next media"
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
                                key={`${getFileUrl(file)}-${index}`}
                                className={
                                    index === currentIndex ? "active" : ""
                                }
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

/* =========================================
   MAIN COMPONENT
========================================= */

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

    // Update form states
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [editingTrending, setEditingTrending] = useState(null);
    const [saving, setSaving] = useState(false);

    const [existingFiles, setExistingFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);

    /* =========================================
       NOTIFICATIONS
    ========================================= */

    const showNotification = useCallback((message, type = "success") => {
        setNotice(message);
        setNoticeType(type);
    }, []);

    useEffect(() => {
        if (!notice) return undefined;

        const timer = window.setTimeout(() => {
            setNotice("");
        }, 3500);

        return () => window.clearTimeout(timer);
    }, [notice]);

    /* =========================================
       FETCH TRENDINGS
    ========================================= */

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

            if (!Array.isArray(data)) {
                throw new Error("Invalid trending data received from server.");
            }

            setTrendings(data);

        } catch (err) {
            console.error("Fetch trendings error:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load trending entries. Please try again."
            );

        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTrendings();
    }, [fetchTrendings]);

    /* =========================================
       FILTERING AND CATEGORIES
    ========================================= */

    const categories = useMemo(() => {
        const uniqueCategories = [
            ...new Set(
                trendings
                    .map((item) => item.category)
                    .filter(Boolean)
            )
        ];

        return ["All", ...uniqueCategories];
    }, [trendings]);

    const filteredTrendings = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return trendings.filter((trending) => {
            const name = getTrendingName(trending).toLowerCase();
            const category = (trending.category || "").toLowerCase();

            const matchesSearch =
                !query ||
                name.includes(query) ||
                category.includes(query);

            const matchesCategory =
                selectedCategory === "All" ||
                trending.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [trendings, searchTerm, selectedCategory]);

    /* =========================================
       DELETE TRENDING
       DELETE /deleteTrending/:id
    ========================================= */

    const handleDelete = async (trending) => {
        const id = getTrendingId(trending);

        if (!id) {
            showNotification(
                "This trending entry does not have a valid ID.",
                "error"
            );
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to remove "${getTrendingName(trending)}" from trending?`
        );

        if (!confirmed) return;

        try {
            setDeletingId(id);

            const response = await api.delete(
                `/deleteTrending/${id}`
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message || "Unable to delete trending entry."
                );
            }

            setTrendings((current) =>
                current.filter(
                    (item) => String(getTrendingId(item)) !== String(id)
                )
            );

            setSelectedTrending((current) =>
                current && String(getTrendingId(current)) === String(id)
                    ? null
                    : current
            );

            showNotification(
                response.data.message ||
                "Trending entry removed successfully."
            );

        } catch (err) {
            console.error("Delete trending error:", err);

            showNotification(
                err.response?.data?.message ||
                err.message ||
                "Failed to remove trending entry.",
                "error"
            );

        } finally {
            setDeletingId(null);
        }
    };

    /* =========================================
       OPEN UPDATE FORM
    ========================================= */

    const handleUpdate = (trending) => {
        if (!trending?._id) {
            showNotification(
                "This trending entry has no valid MongoDB ID.",
                "error"
            );
            return;
        }

        setEditingTrending({
            _id: trending._id,
            name: trending.name || "",
            category: trending.category || "",
            description: trending.description || ""
        });

        setExistingFiles(getTrendingFiles(trending));
        setSelectedFiles([]);
        setFilePreviews([]);

        setSelectedTrending(null);
        setShowUpdateForm(true);
    };

    const handleEditField = (field, value) => {
        setEditingTrending((current) => ({
            ...current,
            [field]: value
        }));
    };

    /* =========================================
       FILE MANAGEMENT
    ========================================= */

    const handleFileChange = (event) => {
        const incomingFiles = Array.from(
            event.target.files || []
        );

        if (!incomingFiles.length) return;

        const allowedFiles = incomingFiles.filter(
            (file) =>
                file.type.startsWith("image/") ||
                file.type.startsWith("video/")
        );

        if (allowedFiles.length !== incomingFiles.length) {
            showNotification(
                "Only image and video files are allowed.",
                "error"
            );
        }

        const previews = allowedFiles.map((file) => ({
            file,
            url: URL.createObjectURL(file),
            type: file.type.startsWith("video/")
                ? "video"
                : "image"
        }));

        setSelectedFiles((current) => [
            ...current,
            ...allowedFiles
        ]);

        setFilePreviews((current) => [
            ...current,
            ...previews
        ]);

        // Allow selecting the same file again.
        event.target.value = "";
    };

    const removeSelectedFile = (index) => {
        setFilePreviews((current) => {
            const preview = current[index];

            if (preview?.url) {
                URL.revokeObjectURL(preview.url);
            }

            return current.filter(
                (_, itemIndex) => itemIndex !== index
            );
        });

        setSelectedFiles((current) =>
            current.filter(
                (_, itemIndex) => itemIndex !== index
            )
        );
    };

    const removeExistingFile = (index) => {
        setExistingFiles((current) =>
            current.filter(
                (_, itemIndex) => itemIndex !== index
            )
        );
    };

    const clearFilePreviews = () => {
        filePreviews.forEach((preview) => {
            if (preview.url) {
                URL.revokeObjectURL(preview.url);
            }
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
       SAVE TRENDING UPDATE
       PUT /updateTrending/:id
    ========================================= */

    const handleSaveUpdate = async (event) => {
        event.preventDefault();

        if (!editingTrending) return;

        if (!editingTrending.name.trim()) {
            showNotification("Trending name is required.", "error");
            return;
        }

        if (!editingTrending.category.trim()) {
            showNotification("Please select a category.", "error");
            return;
        }

        try {
            setSaving(true);

            const formData = new FormData();

            formData.append(
                "name",
                editingTrending.name.trim()
            );

            formData.append(
                "category",
                editingTrending.category.trim()
            );

            formData.append(
                "description",
                editingTrending.description || ""
            );

            // Existing media that should remain.
            formData.append(
                "existingFiles",
                JSON.stringify(existingFiles)
            );

            // Newly selected media.
            selectedFiles.forEach((file) => {
                formData.append("files", file);
            });

            const response = await api.put(
                `/updateTrending/${editingTrending._id}`,
                formData
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ||
                    "Unable to update trending entry."
                );
            }

            // Update the list immediately using the returned document.
            const updatedItem = response.data.updatedItem;

            if (updatedItem?._id) {
                setTrendings((current) =>
                    current.map((item) =>
                        String(getTrendingId(item)) ===
                        String(updatedItem._id)
                            ? updatedItem
                            : item
                    )
                );
            } else {
                await fetchTrendings();
            }

            clearFilePreviews();

            setShowUpdateForm(false);
            setEditingTrending(null);
            setExistingFiles([]);
            setSelectedFiles([]);
            setFilePreviews([]);

            showNotification(
                response.data.message ||
                "Trending entry updated successfully."
            );

        } catch (err) {
            console.error("Update trending error:", err);

            showNotification(
                err.response?.data?.message ||
                err.message ||
                "Failed to update trending entry.",
                "error"
            );

        } finally {
            setSaving(false);
        }
    };

    /* =========================================
       ESCAPE KEY
    ========================================= */

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key !== "Escape") return;

            if (showUpdateForm) {
                closeUpdateForm();
            } else if (selectedTrending) {
                setSelectedTrending(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [showUpdateForm, selectedTrending, saving]);

    /* =========================================
       COMPONENT RENDER
    ========================================= */

    return (
        <div className="manage-trendings-page">
            <AdminNavbar />

            <main className="manage-trendings-container">

                {/* PAGE HEADER */}

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
                            Manage featured content, update trending
                            information and control your trending section.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="manage-trendings-refresh"
                        onClick={fetchTrendings}
                        disabled={loading}
                    >
                        <FontAwesomeIcon
                            icon={faRotate}
                            spin={loading}
                        />
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </header>

                {/* STATISTICS */}

                <section
                    className="trending-stats"
                    aria-label="Trending overview"
                >
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
                            <strong>
                                {Math.max(categories.length - 1, 0)}
                            </strong>
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

                {/* MAIN CONTENT */}

                <section className="manage-trendings-content">

                    <div className="trending-toolbar">
                        <div>
                            <span className="trending-section-kicker">
                                CONTENT MANAGEMENT
                            </span>

                            <h2>Trending entries</h2>

                            <p>
                                Browse featured content, update details
                                or remove entries.
                            </p>
                        </div>

                        <label className="trending-search">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />

                            <input
                                type="search"
                                placeholder="Search name or category..."
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
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

                    {/* CATEGORY FILTERS */}

                    <div className="trending-filter-row">
                        <div className="trending-category-filters">
                            {categories.map((category) => (
                                <button
                                    type="button"
                                    key={category}
                                    className={
                                        selectedCategory === category
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setSelectedCategory(category)
                                    }
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        <span className="trending-result-count">
                            {filteredTrendings.length}{" "}
                            {filteredTrendings.length === 1
                                ? "item"
                                : "items"}
                        </span>
                    </div>

                    {/* LOADING */}

                    {loading && (
                        <div className="trending-state">
                            <div className="trending-state-icon">
                                <FontAwesomeIcon
                                    icon={faRotate}
                                    spin
                                />
                            </div>

                            <h3>Loading trending entries</h3>

                            <p>Please wait while we retrieve your content.</p>
                        </div>
                    )}

                    {/* ERROR */}

                    {!loading && error && (
                        <div className="trending-state trending-error">
                            <div className="trending-state-icon">
                                <FontAwesomeIcon icon={faBoxOpen} />
                            </div>

                            <h3>Could not load trendings</h3>

                            <p>{error}</p>

                            <button
                                type="button"
                                onClick={fetchTrendings}
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* EMPTY */}

                    {!loading &&
                        !error &&
                        filteredTrendings.length === 0 && (
                            <div className="trending-state trending-empty">
                                <div className="trending-state-icon">
                                    <FontAwesomeIcon icon={faFire} />
                                </div>

                                <h3>No trending entries found</h3>

                                <p>
                                    {trendings.length === 0
                                        ? "Trending entries will appear here when you add them."
                                        : "Try another search term or choose a different category."}
                                </p>

                                {(searchTerm ||
                                    selectedCategory !== "All") && (
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

                    {/* TRENDING GRID */}

                    {!loading &&
                        !error &&
                        filteredTrendings.length > 0 && (
                            <div className="trending-admin-grid">
                                {filteredTrendings.map(
                                    (trending, index) => {
                                        const id = getTrendingId(trending);
                                        const files = getTrendingFiles(trending);

                                        return (
                                            <article
                                                className="trending-admin-card"
                                                key={id || index}
                                            >
                                                <TrendingCarousel
                                                    trending={trending}
                                                    files={files}
                                                    name={getTrendingName(trending)}
                                                    onView={() =>
                                                        setSelectedTrending(trending)
                                                    }
                                                />

                                                <div className="trending-admin-details">

                                                    <div className="trending-card-topline">
                                                        <span className="trending-admin-category">
                                                            {trending.category ||
                                                                "Uncategorized"}
                                                        </span>

                                                        <span className="trending-card-number">
                                                            #
                                                            {String(index + 1).padStart(
                                                                2,
                                                                "0"
                                                            )}
                                                        </span>
                                                    </div>

                                                    <h3 title={getTrendingName(trending)}>
                                                        {getTrendingName(trending)}
                                                    </h3>

                                                    <p className="trending-card-description">
    {trending.description?.trim()
        ? trending.description
        : "No description available."}
</p>

                                                    <div className="trending-admin-date">
                                                        <FontAwesomeIcon
                                                            icon={faCalendarDays}
                                                        />

                                                        <span>
                                                            Added{" "}
                                                            {formatDate(
                                                                trending.createdAt
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="trending-admin-actions">
                                                        <button
                                                            type="button"
                                                            className="trending-view-btn"
                                                            onClick={() =>
                                                                setSelectedTrending(trending)
                                                            }
                                                        >
                                                            <FontAwesomeIcon icon={faEye} />
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="trending-edit-btn"
                                                            onClick={() =>
                                                                handleUpdate(trending)
                                                            }
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faPenToSquare}
                                                            />
                                                            Update
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="trending-delete-btn"
                                                            onClick={() =>
                                                                handleDelete(trending)
                                                            }
                                                            disabled={
                                                                deletingId === id
                                                            }
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faTrash}
                                                            />

                                                            {deletingId === id
                                                                ? "Removing..."
                                                                : "Remove"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    }
                                )}
                            </div>
                        )}
                </section>
            </main>

            {/* NOTIFICATION */}

            {notice && (
                <div
                    className={`trending-toast ${noticeType}`}
                    role="status"
                >
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

            {/* =========================================
                VIEW DETAILS MODAL
            ========================================= */}

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
                                <span>CONTENT INFORMATION</span>
                                <h2 id="trending-modal-title">
                                    Trending details
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedTrending(null)}
                                aria-label="Close details"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>

                        {getTrendingFiles(selectedTrending).length > 0 ? (
                            getFileType(
                                getTrendingFiles(selectedTrending)[0]
                            ) === "video" ? (
                                <video
                                    className="trending-modal-image"
                                    src={getFileUrl(
                                        getTrendingFiles(selectedTrending)[0]
                                    )}
                                    controls
                                />
                            ) : (
                                <img
                                    className="trending-modal-image"
                                    src={getFileUrl(
                                        getTrendingFiles(selectedTrending)[0]
                                    )}
                                    alt={getTrendingName(selectedTrending)}
                                />
                            )
                        ) : (
                            <div className="trending-modal-image trending-modal-no-image">
                                <FontAwesomeIcon icon={faBoxOpen} />
                            </div>
                        )}

                        <div className="trending-modal-product-heading">
                            <span className="trending-admin-category">
                                {selectedTrending.category ||
                                    "Uncategorized"}
                            </span>

                            <h3>{getTrendingName(selectedTrending)}</h3>

                            <p>
                                {selectedTrending.description ||
                                    "No description available."}
                            </p>
                        </div>

                        <div className="trending-modal-info">
                            <div>
                                <span>Category</span>
                                <strong>
                                    {selectedTrending.category || "N/A"}
                                </strong>
                            </div>

                            <div>
                                <span>Date added</span>
                                <strong>
                                    {formatDate(selectedTrending.createdAt)}
                                </strong>
                            </div>

                            <div>
                                <span>Media files</span>
                                <strong>
                                    {getTrendingFiles(selectedTrending).length}
                                </strong>
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
                                onClick={() =>
                                    handleUpdate(selectedTrending)
                                }
                            >
                                <FontAwesomeIcon icon={faPenToSquare} />
                                Update
                            </button>

                            <button
                                type="button"
                                className="trending-modal-remove"
                                onClick={() =>
                                    handleDelete(selectedTrending)
                                }
                                disabled={
                                    deletingId ===
                                    getTrendingId(selectedTrending)
                                }
                            >
                                <FontAwesomeIcon icon={faTrash} />
                                Remove
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {/* =========================================
                UPDATE TRENDING MODAL
            ========================================= */}

            {showUpdateForm && editingTrending && (
                <div
                    className="trending-details-overlay trending-update-overlay"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            closeUpdateForm();
                        }
                    }}
                >
                    <form
                        className="trending-update-modal"
                        onSubmit={handleSaveUpdate}
                    >
                        <div className="trending-modal-header">
                            <div>
                                <span>CONTENT MANAGEMENT</span>
                                <h2>Update trending entry</h2>
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

                        {/* FORM FIELDS */}

                        <div className="trending-update-fields">
                            <label>
                                Trending name

                                <input
                                    type="text"
                                    value={editingTrending.name}
                                    onChange={(event) =>
                                        handleEditField(
                                            "name",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter trending name"
                                    required
                                />
                            </label>

                            <label>
                                Category

                                <input
                                    type="text"
                                    value={editingTrending.category}
                                    onChange={(event) =>
                                        handleEditField(
                                            "category",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter category"
                                    required
                                />
                            </label>

                            <label>
                                Description

                                <textarea
                                    rows="5"
                                    value={editingTrending.description}
                                    onChange={(event) =>
                                        handleEditField(
                                            "description",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Write a description..."
                                />
                            </label>
                        </div>

                        {/* MEDIA EDITOR */}

                        <div className="trending-media-editor">
                            <div className="trending-media-heading">
                                <div>
                                    <h3>Images and videos</h3>
                                    <p>
                                        Keep existing media, remove files
                                        or upload new ones.
                                    </p>
                                </div>

                                <label className="trending-upload-button">
                                    <FontAwesomeIcon
                                        icon={faCloudArrowUp}
                                    />
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

                                {/* EXISTING FILES */}

                                {existingFiles.map((file, index) => (
                                    <div
                                        className="trending-edit-media-item"
                                        key={`existing-${file.public_id || file.url}-${index}`}
                                    >
                                        {getFileType(file) === "video" ? (
                                            <video
                                                src={getFileUrl(file)}
                                                muted
                                                controls
                                            />
                                        ) : (
                                            <img
                                                src={getFileUrl(file)}
                                                alt={`Existing media ${index + 1}`}
                                            />
                                        )}

                                        <span className="trending-media-existing">
                                            Existing
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeExistingFile(index)
                                            }
                                            aria-label="Remove existing media"
                                        >
                                            <FontAwesomeIcon icon={faXmark} />
                                        </button>
                                    </div>
                                ))}

                                {/* NEW FILES */}

                                {filePreviews.map((preview, index) => (
                                    <div
                                        className="trending-edit-media-item"
                                        key={preview.url}
                                    >
                                        {preview.type === "video" ? (
                                            <video
                                                src={preview.url}
                                                muted
                                                controls
                                            />
                                        ) : (
                                            <img
                                                src={preview.url}
                                                alt={`New media ${index + 1}`}
                                            />
                                        )}

                                        <span className="trending-media-new">
                                            New
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeSelectedFile(index)
                                            }
                                            aria-label="Remove selected media"
                                        >
                                            <FontAwesomeIcon icon={faXmark} />
                                        </button>
                                    </div>
                                ))}

                                {existingFiles.length === 0 &&
                                    filePreviews.length === 0 && (
                                        <div className="trending-no-edit-media">
                                            <FontAwesomeIcon icon={faImage} />
                                            <span>No media selected</span>
                                        </div>
                                    )}
                            </div>

                            <p className="trending-media-help">
                                <FontAwesomeIcon icon={faVideo} />
                                Supported formats: images and videos.
                            </p>
                        </div>

                        {/* FORM ACTIONS */}

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
                                        <FontAwesomeIcon
                                            icon={faRotate}
                                            spin
                                        />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon
                                            icon={faPenToSquare}
                                        />
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
