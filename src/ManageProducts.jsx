
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faMagnifyingGlass,
    faBox,
    faCheckCircle,
    faShoppingBag,
    faClock,
    faPenToSquare,
    faTrash,
    faXmark,
    faChevronLeft,
    faChevronRight,
    faLayerGroup,
    faRotate
} from "@fortawesome/free-solid-svg-icons";

import api from "./api";
import AdminNavbar from "./AdminNavbar";
import "./ManageProducts.css";

// ==========================================
// PRODUCT MEDIA SLIDESHOW
// ==========================================

function ProductCarousel({ product }) {

    const files = product.files || [];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        setCurrentIndex(0);
    }, [product._id]);

    useEffect(() => {

        if (files.length <= 1 || paused) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % files.length);
        }, 4000);

        return () => clearInterval(interval);

    }, [files.length, paused]);

    const nextSlide = () => {
        setCurrentIndex(prev => (prev + 1) % files.length);
    };

    const previousSlide = () => {
        setCurrentIndex(prev =>
            (prev - 1 + files.length) % files.length
        );
    };

    const currentFile = files[currentIndex];

    return (
        <div
            className="product-carousel"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >

            {currentFile ? (

                currentFile.type === "video" ? (

                    <video
                        key={currentFile.url}
                        src={currentFile.url}
                        controls
                        muted
                        playsInline
                    />

                ) : (

                    <img
                        key={currentFile.url}
                        src={currentFile.url}
                        alt={product.name}
                    />

                )

            ) : (

                <div className="product-no-image">
                    <FontAwesomeIcon icon={faBox} />
                    <span>No product image</span>
                </div>

            )}

            {files.length > 1 && (
                <>
                    <button
                        type="button"
                        className="carousel-arrow carousel-prev"
                        onClick={previousSlide}
                        aria-label="Previous image"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>

                    <button
                        type="button"
                        className="carousel-arrow carousel-next"
                        onClick={nextSlide}
                        aria-label="Next image"
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>

                    <div className="carousel-indicators">

                        {files.map((file, index) => (

                            <button
                                key={`${file.url}-${index}`}
                                type="button"
                                className={
                                    currentIndex === index
                                        ? "active"
                                        : ""
                                }
                                onClick={() => setCurrentIndex(index)}
                                aria-label={`Show image ${index + 1}`}
                            />

                        ))}

                    </div>

                    <span className="carousel-counter">
                        {currentIndex + 1} / {files.length}
                    </span>
                </>
            )}

        </div>
    );
}


// ==========================================
// MAIN COMPONENT
// ==========================================

function ManageProducts() {

    const navigate = useNavigate();

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [availabilityFilter, setAvailabilityFilter] = useState("");

    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [saving, setSaving] = useState(false);

    // Existing media is kept unless the admin removes it.
    const [existingFiles, setExistingFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);

    // ==========================================
    // NOTIFICATIONS
    // ==========================================

    const showNotification = (text, type = "success") => {

        setMessage(text);
        setMessageType(type);

        window.setTimeout(() => {
            setMessage("");
            setMessageType("");
        }, 4000);
    };


    // ==========================================
    // FETCH PRODUCTS
    // ==========================================

    useEffect(() => {

        let mounted = true;

        const fetchProducts = async () => {

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {

                setLoading(true);

                const res = await api.get("/getProducts", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!mounted) return;

                if (res.data.success) {

                    setProducts(res.data.products || []);

                } else {

                    showNotification(
                        res.data.message || "Unable to load products.",
                        "error"
                    );
                }

            } catch (error) {

                console.error("Fetching Products Error:", error);

                if (mounted) {
                    showNotification(
                        error.response?.data?.message ||
                        "Unable to fetch products.",
                        "error"
                    );
                }

            } finally {

                if (mounted) setLoading(false);

            }
        };

        fetchProducts();

        return () => {
            mounted = false;
        };

    }, [navigate]);


    // ==========================================
    // PRODUCT STATISTICS
    // ==========================================

    const totalProducts = products.length;

    const availableProducts = products.filter(
        product => product.availability?.toLowerCase() === "available"
    ).length;

    const soldProducts = products.filter(
        product => product.availability?.toLowerCase() === "sold"
    ).length;

    const reservedProducts = products.filter(
        product => product.availability?.toLowerCase() === "reserved"
    ).length;


    // ==========================================
    // SEARCH AND FILTER
    // ==========================================

    const filteredProducts = useMemo(() => {

        return products.filter(product => {

            const matchesSearch =
                product.name?.toLowerCase().includes(search.toLowerCase()) ||
                product.description?.toLowerCase().includes(search.toLowerCase());

            const matchesCategory =
                !categoryFilter ||
                product.category?.toLowerCase() === categoryFilter.toLowerCase();

            const matchesAvailability =
                !availabilityFilter ||
                product.availability?.toLowerCase() === availabilityFilter.toLowerCase();

            return matchesSearch && matchesCategory && matchesAvailability;

        });

    }, [products, search, categoryFilter, availabilityFilter]);


    // ==========================================
    // DELETE PRODUCT
    // ==========================================

    const handleDelete = async (id) => {

        if (!id) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this product? This action cannot be undone."
        );

        if (!confirmed) return;

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        try {

            const res = await api.delete(`/deleteProduct/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.data.success) {

                setProducts(prev =>
                    prev.filter(product => product._id !== id)
                );

                showNotification(
                    res.data.message || "Product deleted successfully."
                );

            } else {

                showNotification(
                    res.data.message || "Unable to delete product.",
                    "error"
                );
            }

        } catch (error) {

            console.error("Deleting Product Error:", error);

            showNotification(
                error.response?.data?.message ||
                "Something went wrong while deleting the product.",
                "error"
            );

        }
    };


    // ==========================================
    // OPEN UPDATE MODAL
    // ==========================================

    const handleUpdate = (product) => {
        if (!product) return;

        setSelectedProduct({ ...product });
        setExistingFiles(Array.isArray(product.files) ? product.files : []);
        setSelectedFiles([]);
        setFilePreviews([]);
        setShowUpdateForm(true);
    };


    // ==========================================
    // FILE SELECTION AND REMOVAL
    // ==========================================

    const handleFileChange = (e) => {
        const incomingFiles = Array.from(e.target.files || []);

        if (!incomingFiles.length) return;

        const allowedFiles = incomingFiles.filter(file =>
            file.type.startsWith("image/") || file.type.startsWith("video/")
        );

        if (allowedFiles.length !== incomingFiles.length) {
            showNotification("Only image and video files are allowed.", "error");
        }

        const newPreviews = allowedFiles.map(file => ({
            file,
            url: URL.createObjectURL(file),
            type: file.type.startsWith("video/") ? "video" : "image"
        }));

        setSelectedFiles(prev => [...prev, ...allowedFiles]);
        setFilePreviews(prev => [...prev, ...newPreviews]);

        // Allows selecting the same file again after removing it.
        e.target.value = "";
    };

    const removeSelectedFile = (index) => {
        setFilePreviews(prev => {
            const item = prev[index];
            if (item?.url) URL.revokeObjectURL(item.url);
            return prev.filter((_, i) => i !== index);
        });

        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingFile = (index) => {
        setExistingFiles(prev => prev.filter((_, i) => i !== index));
    };


    // ==========================================
    // CLOSE UPDATE MODAL
    // ==========================================

    const closeUpdateForm = () => {
        if (saving) return;

        filePreviews.forEach(item => {
            if (item.url) URL.revokeObjectURL(item.url);
        });

        setShowUpdateForm(false);
        setSelectedProduct(null);
        setExistingFiles([]);
        setSelectedFiles([]);
        setFilePreviews([]);
    };


    // ==========================================
    // SAVE PRODUCT UPDATES
    // ==========================================

    const handleSaveUpdate = async (e) => {
        e.preventDefault();

        if (!selectedProduct) return;

        if (!selectedProduct.name?.trim()) {
            showNotification("Product name is required.", "error");
            return;
        }

        if (
            selectedProduct.price === "" ||
            Number(selectedProduct.price) < 0 ||
            !Number.isFinite(Number(selectedProduct.price))
        ) {
            showNotification("Enter a valid product price.", "error");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setSaving(true);

            const formData = new FormData();
            formData.append("name", selectedProduct.name.trim());
            formData.append("price", selectedProduct.price);
            formData.append("category", selectedProduct.category || "");
            formData.append("availability", selectedProduct.availability || "available");
            formData.append("description", selectedProduct.description || "");

            // The backend should retain these files and remove files omitted here.
            formData.append("existingFiles", JSON.stringify(existingFiles));

            selectedFiles.forEach(file => {
                formData.append("files", file);
            });

            const res = await api.post(
                `/updateProduct/${selectedProduct._id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data.success) {
                // Refresh from the server so the card shows the saved media.
                const refresh = await api.get("/getProducts", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (refresh.data.success) {
                    setProducts(refresh.data.products || []);
                }

                filePreviews.forEach(item => {
                    if (item.url) URL.revokeObjectURL(item.url);
                });

                setShowUpdateForm(false);
                setSelectedProduct(null);
                setExistingFiles([]);
                setSelectedFiles([]);
                setFilePreviews([]);

                showNotification(
                    res.data.message || "Product updated successfully."
                );
            } else {
                showNotification(
                    res.data.message || "Unable to update product.",
                    "error"
                );
            }

        } catch (error) {
            console.error("Updating Product Error:", error);

            showNotification(
                error.response?.data?.message ||
                "Something went wrong while updating the product.",
                "error"
            );

        } finally {
            setSaving(false);
        }
    };


    // ==========================================
    // UPDATE INPUT HANDLER
    // ==========================================

    const handleInputChange = (e) => {

        const { name, value } = e.target;

        setSelectedProduct(prev => ({
            ...prev,
            [name]: value
        }));

    };


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="manage-product-layout">

            <AdminNavbar />

            <main className="product-information">

                <div className="manage-products-content">

                    {/* PAGE HEADER */}

                    <div className="products-page-header">

                        <div className="products-heading">

                            <span className="products-eyebrow">
                                DREAMAZ INK / ADMINISTRATION
                            </span>

                            <h1>Manage Products</h1>

                            <p>
                                Manage your artwork, collections and creative
                                products from one place.
                            </p>

                        </div>

                        <Link
                            to="/create-product"
                            className="add-product-button"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Add New Product
                        </Link>

                    </div>


                    {/* STATISTICS */}

                    <section className="product-statistics">

                        <div className="product-stat-card">

                            <div className="stat-icon total-icon">
                                <FontAwesomeIcon icon={faLayerGroup} />
                            </div>

                            <div>
                                <span>Total Products</span>
                                <h2>{totalProducts}</h2>
                                <small>Products in your store</small>
                            </div>

                        </div>


                        <div className="product-stat-card">

                            <div className="stat-icon available-icon">
                                <FontAwesomeIcon icon={faCheckCircle} />
                            </div>

                            <div>
                                <span>Available</span>
                                <h2>{availableProducts}</h2>
                                <small>Ready for customers</small>
                            </div>

                        </div>


                        <div className="product-stat-card">

                            <div className="stat-icon sold-icon">
                                <FontAwesomeIcon icon={faShoppingBag} />
                            </div>

                            <div>
                                <span>Sold Products</span>
                                <h2>{soldProducts}</h2>
                                <small>Successfully sold</small>
                            </div>

                        </div>


                        <div className="product-stat-card">

                            <div className="stat-icon reserved-icon">
                                <FontAwesomeIcon icon={faClock} />
                            </div>

                            <div>
                                <span>Reserved</span>
                                <h2>{reservedProducts}</h2>
                                <small>Currently reserved</small>
                            </div>

                        </div>

                    </section>


                    {/* PRODUCT SECTION HEADER */}

                    <section className="products-section">

                        <div className="products-section-header">

                            <div>
                                <h2>Product Inventory</h2>
                                <p>
                                    Review and manage your published products.
                                </p>
                            </div>

                            <span className="products-count">
                                {filteredProducts.length} Products
                            </span>

                        </div>


                        {/* FILTERS */}

                        <div className="product-filters">

                            <div className="product-search">

                                <FontAwesomeIcon icon={faMagnifyingGlass} />

                                <input
                                    type="search"
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />

                            </div>


                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                <option value="Fashion">Fashion</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Prints">Prints</option>
                                <option value="Collections">Collections</option>
                            </select>


                            <select
                                value={availabilityFilter}
                                onChange={(e) => setAvailabilityFilter(e.target.value)}
                            >
                                <option value="">All Availability</option>
                                <option value="available">Available</option>
                                <option value="sold">Sold</option>
                                <option value="reserved">Reserved</option>
                            </select>


                            <button
                                type="button"
                                className="reset-filter-button"
                                onClick={() => {
                                    setSearch("");
                                    setCategoryFilter("");
                                    setAvailabilityFilter("");
                                }}
                            >
                                <FontAwesomeIcon icon={faRotate} />
                                Reset
                            </button>

                        </div>


                        {/* PRODUCT GRID */}

                        {loading ? (

                            <div className="products-loading">
                                <div className="products-spinner"></div>
                                <p>Loading your products...</p>
                            </div>

                        ) : filteredProducts.length > 0 ? (

                            <div className="product-info">

                                {filteredProducts.map(product => (

                                    <article
                                        className="product-card"
                                        key={product._id}
                                    >

                                        {/* MEDIA */}

                                        <ProductCarousel product={product} />


                                        {/* PRODUCT DETAILS */}

                                        <div className="product-card-content">

                                            <div className="product-card-top">

                                                <span className="product-category">
                                                    {product.category || "Uncategorized"}
                                                </span>

                                                <span
                                                    className={`product-status ${product.availability?.toLowerCase() || "unknown"}`}
                                                >
                                                    {product.availability || "Unknown"}
                                                </span>

                                            </div>


                                            <h3>{product.name}</h3>

                                            <p className="product-description">
                                                {product.description ||
                                                    "No product description available."}
                                            </p>


                                            <div className="product-price">
                                                {Number(product.price || 0).toLocaleString()}
                                            </div>


                                            <div className="product-card-actions">

                                                <button
                                                    type="button"
                                                    className="edit-product-button"
                                                    onClick={() => handleUpdate(product)}
                                                >
                                                    <FontAwesomeIcon icon={faPenToSquare} />
                                                    Edit Product
                                                </button>


                                                <button
                                                    type="button"
                                                    className="delete-product-button"
                                                    onClick={() => handleDelete(product._id)}
                                                    aria-label="Delete product"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>

                                            </div>

                                        </div>

                                    </article>

                                ))}

                            </div>

                        ) : (

                            <div className="products-empty">

                                <div className="empty-product-icon">
                                    <FontAwesomeIcon icon={faBox} />
                                </div>

                                <h3>
                                    {products.length === 0
                                        ? "No products yet"
                                        : "No matching products"}
                                </h3>

                                <p>
                                    {products.length === 0
                                        ? "Start building your store by adding your first product."
                                        : "Try changing your search or filter settings."}
                                </p>

                                {products.length === 0 && (
                                    <Link
                                        to="/create-product"
                                        className="empty-add-button"
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                        Create First Product
                                    </Link>
                                )}

                            </div>

                        )}

                    </section>

                </div>

            </main>


            {/* ======================================
                UPDATE PRODUCT MODAL
            ====================================== */}

            {showUpdateForm && selectedProduct && (

                <div
                    className="update-product-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            closeUpdateForm();
                        }
                    }}
                >

                    <div className="update-product-form">

                        <div className="update-modal-header">

                            <div>
                                <span>PRODUCT MANAGEMENT</span>
                                <h2>Edit Product</h2>
                                <p>Update your product information.</p>
                            </div>

                            <button
                                type="button"
                                className="close-update-modal"
                                onClick={closeUpdateForm}
                                disabled={saving}
                                aria-label="Close modal"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>

                        </div>


                        <form onSubmit={handleSaveUpdate}>

                            <div className="update-form-body">

                                <div className="update-form-group">

                                    <label htmlFor="product-name">
                                        Product Name
                                    </label>

                                    <input
                                        id="product-name"
                                        type="text"
                                        name="name"
                                        value={selectedProduct.name || ""}
                                        onChange={handleInputChange}
                                        placeholder="Enter product name"
                                        required
                                    />

                                </div>


                                <div className="update-form-row">

                                    <div className="update-form-group">

                                        <label htmlFor="product-price">
                                            Price
                                        </label>

                                        <input
                                            id="product-price"
                                            type="number"
                                            name="price"
                                            min="0"
                                            value={selectedProduct.price ?? ""}
                                            onChange={handleInputChange}
                                            placeholder="Enter price"
                                            required
                                        />

                                    </div>


                                    <div className="update-form-group">

                                        <label htmlFor="product-category">
                                            Category
                                        </label>

                                        <select
                                            id="product-category"
                                            name="category"
                                            value={selectedProduct.category || ""}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Fashion">Fashion</option>
                                            <option value="Accessories">Accessories</option>
                                            <option value="Prints">Prints</option>
                                            <option value="Collections">Collections</option>
                                        </select>

                                    </div>

                                </div>


                                <div className="update-form-group">

                                    <label htmlFor="product-availability">
                                        Availability
                                    </label>

                                    <select
                                        id="product-availability"
                                        name="availability"
                                        value={selectedProduct.availability || "available"}
                                        onChange={handleInputChange}
                                    >
                                        <option value="available">Available</option>
                                        <option value="sold">Sold</option>
                                        <option value="reserved">Reserved</option>
                                    </select>

                                </div>


                                <div className="update-form-group">

                                    <label htmlFor="product-description">
                                        Product Description
                                    </label>

                                    <textarea
                                        id="product-description"
                                        name="description"
                                        value={selectedProduct.description || ""}
                                        onChange={handleInputChange}
                                        placeholder="Describe your product..."
                                        rows="5"
                                    />

                                </div>

                                {/* PRODUCT MEDIA EDITOR */}
                                <div className="update-form-group media-editor-group">
                                    <div className="media-editor-heading">
                                        <label>Product Images & Videos</label>
                                        <span>
                                            {existingFiles.length + selectedFiles.length} media file(s)
                                        </span>
                                    </div>

                                    <label
                                        htmlFor="update-product-files"
                                        className="product-file-upload"
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                        <strong>Add images or videos</strong>
                                        <span>Choose one or more image/video files</span>
                                        <input
                                            id="update-product-files"
                                            type="file"
                                            accept="image/*,video/*"
                                            multiple
                                            onChange={handleFileChange}
                                            disabled={saving}
                                        />
                                    </label>
                                </div>

                                {existingFiles.length > 0 && (
                                    <div className="update-media-section">
                                        <div className="update-media-title">
                                            <h4>Current media</h4>
                                            <span>{existingFiles.length} file(s)</span>
                                        </div>

                                        <div className="update-media-grid">
                                            {existingFiles.map((file, index) => (
                                                <div
                                                    className="update-media-item"
                                                    key={`${file.url || "media"}-${index}`}
                                                >
                                                    {file.type === "video" ||
                                                    file.url?.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) ? (
                                                        <video src={file.url} controls />
                                                    ) : (
                                                        <img
                                                            src={file.url}
                                                            alt={`Existing product media ${index + 1}`}
                                                        />
                                                    )}

                                                    <button
                                                        type="button"
                                                        className="remove-media-button"
                                                        onClick={() => removeExistingFile(index)}
                                                        disabled={saving}
                                                        aria-label="Remove existing media"
                                                    >
                                                        <FontAwesomeIcon icon={faXmark} />
                                                    </button>

                                                    <span className="media-tag">Current</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {filePreviews.length > 0 && (
                                    <div className="update-media-section">
                                        <div className="update-media-title">
                                            <h4>New media to upload</h4>
                                            <span>{filePreviews.length} file(s)</span>
                                        </div>

                                        <div className="update-media-grid">
                                            {filePreviews.map((file, index) => (
                                                <div
                                                    className="update-media-item new-media-item"
                                                    key={`${file.url}-${index}`}
                                                >
                                                    {file.type === "video" ? (
                                                        <video src={file.url} controls />
                                                    ) : (
                                                        <img
                                                            src={file.url}
                                                            alt={`New product media ${index + 1}`}
                                                        />
                                                    )}

                                                    <button
                                                        type="button"
                                                        className="remove-media-button"
                                                        onClick={() => removeSelectedFile(index)}
                                                        disabled={saving}
                                                        aria-label="Remove selected media"
                                                    >
                                                        <FontAwesomeIcon icon={faXmark} />
                                                    </button>

                                                    <span className="media-tag">New</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="update-form-note">
                                    <FontAwesomeIcon icon={faBox} />
                                    <span>
                                        Removed media will be excluded when you save.
                                        Existing media stays unless you remove it.
                                    </span>
                                </div>

                            </div>


                            <div className="update-form-footer">

                                <button
                                    type="button"
                                    className="cancel-update-button"
                                    onClick={closeUpdateForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-update-button"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <span className="button-spinner"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faCheckCircle} />
                                            Save Changes
                                        </>
                                    )}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* NOTIFICATIONS */}

            {message && (

                <div className={`product-notification ${messageType}`}>

                    <FontAwesomeIcon
                        icon={
                            messageType === "success"
                                ? faCheckCircle
                                : faXmark
                        }
                    />

                    <span>{message}</span>

                    <button
                        type="button"
                        onClick={() => setMessage("")}
                        aria-label="Dismiss notification"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>

                </div>

            )}

        </div>

    );

}

export default ManageProducts;
