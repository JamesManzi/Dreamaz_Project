
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import api from "./api";
import { useMessage } from "./ShowMessage";
import "./FashionDetails.css";

function FashionDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [fashion, setFashion] = useState(null);
    const [fashions, setFashions] = useState([]);
    const [loading, setLoading] = useState(true);

    const { showError } = useMessage();

    useEffect(() => {
        const FetchFashionDetails = async () => {
            setLoading(true);

            try {
                const res = await api.get("/getFashionProducts");

                if (res.data.success) {
                    const products = res.data.fashionProducts || [];

                    const selected = products.find(
                        item => item._id === id
                    );

                    if (!selected) {
                        setFashion(null);
                        showError("Fashion product not found");
                    } else {
                        setFashion(selected);

                        // Related products: exclude current product
                        setFashions(
                            products.filter(
                                item => item._id !== id
                            ).slice(0, 4)
                        );
                    }
                } else {
                    showError(
                        res.data.message || "Unable to fetch product"
                    );
                }

            } catch (error) {
                console.log("Fashion details error:", error);

                showError(
                    error.response?.data?.message ||
                    "Unable to load product details"
                );
            } finally {
                setLoading(false);
            }
        };

        FetchFashionDetails();

    }, [id]);

    const openRelatedProduct = (productId) => {
        navigate(`/fashion/${productId}`);
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    if (loading) {
        return (
            <div className="fashion-details-page">
                <Navbar />
                <div className="details-loading">
                    Loading product details...
                </div>
                <Footer />
            </div>
        );
    }

    if (!fashion) {
        return (
            <div className="fashion-details-page">
                <Navbar />

                <div className="details-not-found">
                    <h2>Product Not Found</h2>
                    <p>
                        This fashion product may have been removed
                        or is no longer available.
                    </p>

                    <button onClick={() => navigate("/fashion")}>
                        Back to Fashion
                    </button>
                </div>

                <Footer />
            </div>
        );
    }

    return (
        <div className="fashion-details-page">

            <Navbar />

            <main className="fashion-details-container">

                {/* BREADCRUMB */}

                <div className="fashion-breadcrumb">
                    <span onClick={() => navigate("/")}>Home</span>
                    <span>/</span>
                    <span onClick={() => navigate("/fashion")}>
                        Fashion
                    </span>
                    <span>/</span>
                    <strong>{fashion.name}</strong>
                </div>

                {/* PRODUCT DETAILS */}

                <section className="fashion-detail-layout">

                    {/* PRODUCT MEDIA */}

                    <div className="fashion-detail-gallery">

                        {fashion.files?.length > 0 ? (
                            fashion.files.map((file, index) => (
                                <div
                                    className="fashion-detail-media"
                                    key={index}
                                >

                                    {file.type === "image" && (
                                        <img
                                            src={file.url}
                                            alt={`${fashion.name} ${index + 1}`}
                                        />
                                    )}

                                    {file.type === "video" && (
                                        <video
                                            src={file.url}
                                            controls
                                            playsInline
                                        />
                                    )}

                                </div>
                            ))
                        ) : (
                            <div className="fashion-no-image">
                                No product media available
                            </div>
                        )}

                    </div>

                    {/* PRODUCT INFORMATION */}

                    <div className="fashion-detail-information">

                        <span className="detail-category">
                            ISONGA MARKET / FASHION
                        </span>

                        <h1>{fashion.name}</h1>

                        <div className="fashion-detail-price">
                            {Number(fashion.price).toLocaleString()} RWF
                        </div>

                        <div className="detail-divider"></div>

                        <h3>Product Description</h3>

                        <p className="fashion-full-description">
                            {fashion.description || "No description available."}
                        </p>

                        <div className="detail-divider"></div>

                        <div className="fashion-detail-actions">

                            <button
                                onClick={() => navigate("/fashion")}
                                className="back-fashion-button"
                            >
                                ← Continue Shopping
                            </button>

                        </div>

                    </div>

                </section>

                {/* RELATED PRODUCTS */}

                {fashions.length > 0 && (
                    <section className="related-fashion-section">

                        <div className="related-fashion-heading">
                            <div>
                                <span>YOU MAY ALSO LIKE</span>
                                <h2>Related Fashion</h2>
                                <p>
                                    Discover more styles from our collection.
                                </p>
                            </div>

                            <button
                                onClick={() => navigate("/fashion")}
                            >
                                View All →
                            </button>
                        </div>

                        <div className="related-fashion-grid">

                            {fashions.map(product => {

                                const file = product.files?.[0];

                                return (
                                    <article
                                        className="related-fashion-card"
                                        key={product._id}
                                    >

                                        <div className="related-fashion-image">

                                            {file?.type === "image" ? (
                                                <img
                                                    src={file.url}
                                                    alt={product.name}
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
                                                    No image
                                                </div>
                                            )}

                                        </div>

                                        <div className="related-fashion-info">

                                            <h3>{product.name}</h3>

                                            <h4>
                                                {Number(product.price).toLocaleString()} RWF
                                            </h4>

                                            <button
                                                onClick={() =>
                                                    openRelatedProduct(product._id)
                                                }
                                            >
                                                Explore More →
                                            </button>

                                        </div>

                                    </article>
                                );
                            })}

                        </div>

                    </section>
                )}

            </main>

            <Footer />

        </div>
    );
}

export default FashionDetails;
