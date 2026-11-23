
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMessage } from "./ShowMessage";
import api from "./api";
import "./TrendingDetails.css";

function TrendingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showError } = useMessage();

    const [trending, setTrending] = useState(null);
    const [related, setRelated] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchTrendingDetails = async () => {
            try {
                setLoading(true);

                const res = await api.get(`/getTrending/${id}`);

                if (!isMounted) return;

                if (res.data.success && res.data.trending) {
                    setTrending(res.data.trending);
                    setActiveIndex(0);
                } else {
                    setTrending(null);
                    showError("Trending content not found.");
                }
            } catch (error) {
                console.error(
                    "Trending details error:",
                    error.response?.data || error.message
                );

                if (isMounted) {
                    setTrending(null);
                    showError("Unable to load trending content.");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchTrendingDetails();

        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {
        let isMounted = true;

        const fetchRelated = async () => {
            try {
                const res = await api.get(`/related/${id}`);

                if (isMounted && res.data.success) {
                    setRelated(
                        Array.isArray(res.data.related)
                            ? res.data.related
                            : []
                    );
                }
            } catch (error) {
                console.error(
                    "Related content error:",
                    error.response?.data || error.message
                );

                if (isMounted) setRelated([]);
            }
        };

        fetchRelated();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const files = Array.isArray(trending?.files)
        ? trending.files.filter(file => file?.url)
        : [];

    const selectedFile = files[activeIndex];

    const handlePrevious = () => {
        setActiveIndex(current =>
            current === 0 ? files.length - 1 : current - 1
        );
    };

    const handleNext = () => {
        setActiveIndex(current =>
            current === files.length - 1 ? 0 : current + 1
        );
    };

    const formatDate = date => {
        if (!date) return "Not available";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not available";
        }

        return parsedDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    if (loading) {
        return (
            <div className="trending-loading">
                <div className="trending-spinner"></div>
                <h3>Loading artwork</h3>
                <p>Please wait while we prepare this content.</p>
            </div>
        );
    }

    if (!trending) {
        return (
            <div className="trending-not-found">
                <div className="not-found-icon">!</div>
                <h2>Content not found</h2>
                <p>
                    This artwork may have been removed or is currently
                    unavailable.
                </p>
                <button onClick={() => navigate(-1)}>
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <main className="trending-details">

            {/* Top navigation */}
            <div className="trending-topbar">
                <button
                    className="trending-back-button"
                    onClick={() => navigate(-1)}
                >
                    <span>←</span> Back to Discover
                </button>

                <span className="trending-page-label">
                    DREAMAZ INK / TRENDING
                </span>
            </div>

            {/* Main content */}
            <section className="trending-detail-layout">

                {/* Media gallery */}
                <div className="trending-gallery-section">

                    <div className="trending-main-gallery">

                        {selectedFile ? (
                            selectedFile.type === "video" ? (
                                <video
                                    key={selectedFile.url}
                                    src={selectedFile.url}
                                    controls
                                    autoPlay={false}
                                    className="trending-main-media"
                                />
                            ) : (
                                <img
                                    key={selectedFile.url}
                                    src={selectedFile.url}
                                    alt={trending.name || "Artwork"}
                                    className="trending-main-media"
                                />
                            )
                        ) : (
                            <div className="trending-no-media">
                                <span>✦</span>
                                <p>No media available</p>
                            </div>
                        )}

                        {files.length > 1 && (
                            <>
                                <button
                                    className="gallery-arrow gallery-previous"
                                    onClick={handlePrevious}
                                    aria-label="Previous media"
                                >
                                    ‹
                                </button>

                                <button
                                    className="gallery-arrow gallery-next"
                                    onClick={handleNext}
                                    aria-label="Next media"
                                >
                                    ›
                                </button>

                                <div className="gallery-counter">
                                    {activeIndex + 1} / {files.length}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {files.length > 0 && (
                        <div className="trending-thumbnails">
                            {files.map((file, index) => (
                                <button
                                    key={file.public_id || file.url || index}
                                    onClick={() => setActiveIndex(index)}
                                    className={`trending-thumbnail ${
                                        activeIndex === index
                                            ? "thumbnail-selected"
                                            : ""
                                    }`}
                                    aria-label={`View media ${index + 1}`}
                                >
                                    {file.type === "video" ? (
                                        <div className="video-thumbnail">
                                            <span>▶</span>
                                        </div>
                                    ) : (
                                        <img
                                            src={file.url}
                                            alt={`Thumbnail ${index + 1}`}
                                        />
                                    )}

                                    {file.type === "video" && (
                                        <span className="thumbnail-video-label">
                                            VIDEO
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Artwork information */}
                <aside className="trending-info-section">

                    <span className="trending-category">
                        {trending.category || "ARTWORK"}
                    </span>

                    <h1>{trending.name || "Untitled Artwork"}</h1>

                    <div className="trending-info-divider"></div>

                    <div className="trending-description">
                        <span className="info-label">ABOUT THIS ARTWORK</span>

                        <p>
                            {trending.description ||
                                "No description has been provided for this artwork."}
                        </p>
                    </div>

                    <div className="trending-meta">

                        <div className="meta-item">
                            <span className="info-label">CATEGORY</span>
                            <strong>
                                {trending.category || "Uncategorized"}
                            </strong>
                        </div>

                        <div className="meta-item">
                            <span className="info-label">PUBLISHED</span>
                            <strong>
                                {formatDate(trending.createdAt)}
                            </strong>
                        </div>

                        <div className="meta-item">
                            <span className="info-label">MEDIA</span>
                            <strong>
                                {files.length} {files.length === 1 ? "File" : "Files"}
                            </strong>
                        </div>

                    </div>

                    <div className="trending-info-footer">
                        <span className="trending-star">✦</span>
                        <p>
                            Discover creativity. Experience art.
                            Welcome to Dreamaz Ink.
                        </p>
                    </div>
                </aside>

            </section>

            {/* Related content */}
            <section className="related-content-section">

                <div className="related-heading">
                    <div>
                        <span className="section-eyebrow">
                            DISCOVER MORE
                        </span>
                        <h2>Related Artwork</h2>
                        <p>Explore more creative work from our collection.</p>
                    </div>
                </div>

                {related.length > 0 ? (
                    <div className="related-grid">
                        {related.map((item, index) => {
                            const media = item.files?.find(file => file?.url);

                            return (
                                <article
                                    className="related-card"
                                    key={item._id}
                                    style={{
                                        animationDelay: `${index * 100}ms`
                                    }}
                                >
                                    <div className="related-image-wrapper">

                                        {media ? (
                                            media.type === "video" ? (
                                                <video
                                                    src={media.url}
                                                    muted
                                                    preload="metadata"
                                                />
                                            ) : (
                                                <img
                                                    src={media.url}
                                                    alt={item.name || "Artwork"}
                                                    loading="lazy"
                                                />
                                            )
                                        ) : (
                                            <div className="related-no-image">
                                                ✦
                                            </div>
                                        )}

                                        <span className="related-category">
                                            {item.category || "ARTWORK"}
                                        </span>
                                    </div>

                                    <div className="related-card-content">
                                        <h3>{item.name || "Untitled Artwork"}</h3>

                                        <p>
                                            {item.description
                                                ? `${item.description.slice(0, 90)}${
                                                    item.description.length > 90
                                                        ? "..."
                                                        : ""
                                                }`
                                                : "Explore this creative artwork."}
                                        </p>

                                        <button
                                            onClick={() =>
                                                navigate(`/trending/${item._id}`)
                                            }
                                        >
                                            Explore Artwork <span>→</span>
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="related-empty">
                        <span>✦</span>
                        <p>No related artwork available at the moment.</p>
                    </div>
                )}

            </section>

        </main>
    );
}

export default TrendingDetails;
