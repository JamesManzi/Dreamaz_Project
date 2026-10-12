import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    FaArrowLeft,
    FaPlay,
    FaImage,
    FaChevronLeft,
    FaChevronRight
} from "react-icons/fa";

import api from "./api";
import "./GalleryDetails.css";

function GalleryDetails() {
    const { id } = useParams();

    const [gallery, setGallery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                setLoading(true);

                const response = await api.get(`/gallery/${id}`);

                setGallery(response.data.gallery);
                setCurrentIndex(0);
            } catch (error) {
                console.error("Gallery Details Error:", error);

                setError(
                    error.response?.data?.message ||
                    "Failed to load gallery."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, [id]);

    /* =========================
       CHECK VIDEO
    ========================= */

    const isVideo = (url) => {
        if (!url) return false;

        return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
    };

    /* =========================
       NEXT MEDIA
    ========================= */

    const nextSlide = () => {
        if (!gallery?.files?.length) return;

        setCurrentIndex((prev) =>
            prev === gallery.files.length - 1
                ? 0
                : prev + 1
        );
    };

    /* =========================
       PREVIOUS MEDIA
    ========================= */

    const previousSlide = () => {
        if (!gallery?.files?.length) return;

        setCurrentIndex((prev) =>
            prev === 0
                ? gallery.files.length - 1
                : prev - 1
        );
    };

    /* =========================
       AUTO SLIDE
    ========================= */

    useEffect(() => {
        if (!gallery?.files?.length) return;

        const currentFile = gallery.files[currentIndex];

        if (!currentFile) return;

        const currentUrl =
            typeof currentFile === "string"
                ? currentFile
                : currentFile.url;

        // Don't automatically move while displaying video
        if (isVideo(currentUrl)) return;

        const timer = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => clearInterval(timer);
    }, [gallery, currentIndex]);

    /* =========================
       LOADING
    ========================= */

    if (loading) {
        return (
            <div className="gallery-details-loading">
                <div className="loading-spinner"></div>
                <p>Loading gallery...</p>
            </div>
        );
    }

    /* =========================
       ERROR
    ========================= */

    if (error) {
        return (
            <div className="gallery-details-error">

                <div className="error-icon">
                    <FaImage />
                </div>

                <h2>Gallery Not Found</h2>

                <p>{error}</p>

                <Link
                    to="/manage-gallery"
                    className="back-gallery-btn"
                >
                    <FaArrowLeft />
                    Back to Galleries
                </Link>

            </div>
        );
    }

    if (!gallery) {
        return null;
    }

    const files = gallery.files || [];

    const currentFile = files[currentIndex];

    const currentUrl =
        typeof currentFile === "string"
            ? currentFile
            : currentFile?.url;

    return (
        <div className="gallery-details-page">

            {/* =========================
                HEADER
            ========================= */}

            <header className="gallery-details-header">

                <Link
                    to="/manage-gallery"
                    className="back-gallery-link"
                >
                    <FaArrowLeft />
                    Back to Galleries
                </Link>

            </header>


            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="gallery-details-container">

                {/* CATEGORY */}

                <div className="details-category-wrapper">

                    <span className="details-category">
                        {gallery.category || "Uncategorized"}
                    </span>

                </div>


                {/* TITLE */}

                <h1 className="details-title">
                    {gallery.name}
                </h1>
                <div className="details-artist">
    <span>Artist</span>
    <strong>{gallery.artist || "Unknown Artist"}</strong>
</div>


                {/* =========================
                    MEDIA SLIDER
                ========================= */}

                {files.length > 0 ? (

                    <section className="gallery-slider">

                        {/* MEDIA */}

                        <div className="slider-media">

                            {isVideo(currentUrl) ? (

                                <video
                                    key={currentUrl}
                                    src={currentUrl}
                                    controls
                                    className="slider-video"
                                    onClick={()=>setIsFullscreen(true)}
                                />

                            ) : (

                                <img
                                    key={currentUrl}
                                    src={currentUrl}
                                    alt={`${gallery.name} ${currentIndex + 1}`}
                                    className="slider-image"
                                    onClick={()=>setIsFullscreen(true)}
                                />

                            )}


                            {/* PREVIOUS */}

                            {files.length > 1 && (
                                <button
                                    className="slider-button slider-prev"
                                    onClick={previousSlide}
                                    aria-label="Previous media"
                                >
                                    <FaChevronLeft />
                                </button>
                            )}


                            {/* NEXT */}

                            {files.length > 1 && (
                                <button
                                    className="slider-button slider-next"
                                    onClick={nextSlide}
                                    aria-label="Next media"
                                >
                                    <FaChevronRight />
                                </button>
                            )}


                            {/* MEDIA TYPE */}

                            <div className="media-type-badge">

                                {isVideo(currentUrl) ? (
                                    <>
                                        <FaPlay />
                                        Video
                                    </>
                                ) : (
                                    <>
                                        <FaImage />
                                        Image
                                    </>
                                )}

                            </div>


                            {/* COUNTER */}

                            <div className="media-counter">
                                {currentIndex + 1} / {files.length}
                            </div>

                        </div>


                        {/* =========================
                            DOTS
                        ========================= */}

                        {files.length > 1 && (

                            <div className="slider-dots">

                                {files.map((file, index) => (
                                    <button
                                        key={index}
                                        className={
                                            `slider-dot ${
                                                index === currentIndex
                                                    ? "active"
                                                    : ""
                                            }`
                                        }
                                        onClick={() =>
                                            setCurrentIndex(index)
                                        }
                                        aria-label={`Go to media ${index + 1}`}
                                    />
                                ))}

                            </div>

                        )}

                    </section>

                ) : (

                    <div className="details-no-media">

                        <FaImage />

                        <p>No media available</p>

                    </div>

                )}


                {/* =========================
                    DESCRIPTION
                ========================= */}

                <section className="details-description-section">

                    <div className="description-header">

                        <div className="description-line"></div>

                        <span className="details-section-label">
                            ABOUT THIS GALLERY
                        </span>

                    </div>


                    <h2>
                        {gallery.name}
                    </h2>


                    <div className="description-content">

                        <p className="details-full-description">
                            {gallery.description ||
                                "No description has been added to this gallery yet."}
                        </p>

                    </div>


                    {/* META INFORMATION */}

                    <div className="gallery-meta">

                        <div className="gallery-meta-item">

                            <strong>
                                {files.length}
                            </strong>

                            <span>
                                {files.length === 1
                                    ? "Media"
                                    : "Media Files"}
                            </span>

                        </div>


                        <div className="gallery-meta-item">

                            <strong>
                                {gallery.category || "General"}
                            </strong>

                            <span>
                                Category
                            </span>

                        </div>

                    </div>

                </section>

            </main>
            {isFullscreen && (
    <div
        className="fullscreen-overlay"
        onClick={() => setIsFullscreen(false)}
    >
        <button
            className="fullscreen-close"
            onClick={() => setIsFullscreen(false)}
        >
            ×
        </button>

        <div
            className="fullscreen-content"
            onClick={(e) => e.stopPropagation()}
        >
            {isVideo(currentUrl) ? (
                <video
                    src={currentUrl}
                    className="fullscreen-media"
                    controls
                    autoPlay
                />
            ) : (
                <img
                    src={currentUrl}
                    alt={gallery.name}
                    className="fullscreen-media"
                />
            )}
        </div>
    </div>
)}
        </div>
    );
}

export default GalleryDetails;