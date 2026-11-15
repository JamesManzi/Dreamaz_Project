import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import { useMessage } from "./ShowMessage";
import "./FashionAnimation.css";

const IMAGE_DURATION = 4000;

const VIDEO_EXT = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i;
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|svg|bmp)(\?.*)?$/i;

// Turn any file shape from the DB into { url, type, ... } or null
const normalizeMedia = (file) => {

    if (!file) return null;

    // Allow plain string URLs
    const raw = typeof file === "string" ? { url: file } : file;

    const url = raw.url || raw.secure_url || raw.path || raw.src;
    if (!url) return null;

    const kind = String(
        raw.type || raw.mimetype || raw.mimeType || raw.resource_type || ""
    ).toLowerCase();

    let type;

    if (kind.includes("video") || VIDEO_EXT.test(url)) type = "video";
    else if (kind.includes("image") || IMAGE_EXT.test(url)) type = "image";
    else type = "image"; // unknown: try it as an image rather than hiding it

    return { ...raw, url, type };
};

function FashionAnimation() {

    const [fashions, setFashions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    const navigate = useNavigate();
    const { showError } = useMessage();

    // Fetch existing fashion collections
    useEffect(() => {

        const fetchFashion = async () => {
            try {

                const res = await api.get("/fashionTrends");

                if (res.data.success) {
                    setFashions(
                        Array.isArray(res.data.fashionProducts)
                            ? res.data.fashionProducts.filter(Boolean)
                            : []
                    );
                } else {
                    showError(res.data.message || "Unable to fetch fashion");
                }

            } catch (error) {

                console.log(error);

                showError(
                    error.response?.data?.message ||
                    "Unable to fetch fashion"
                );

            } finally {
                setLoading(false);
            }
        };

        fetchFashion();

    }, []);

    // One continuous playlist: every media file of every collection, in order
    const playlist = useMemo(
        () =>
            fashions.flatMap(fashion =>
                (Array.isArray(fashion.files) ? fashion.files : [])
                    .map(normalizeMedia)
                    .filter(Boolean)
                    .map(file => ({ fashion, file }))
            ),
        [fashions]
    );

    const total = playlist.length;
    const activeItem = playlist[currentSlide];
    const activeFashion = activeItem?.fashion;

    // Collections that actually have media (used for the dots)
    const heroFashions = useMemo(() => {
        const seen = new Set();
        return playlist
            .map(item => item.fashion)
            .filter(f => (seen.has(f._id) ? false : seen.add(f._id)));
    }, [playlist]);

    // Keep the index in range if the playlist changes
    useEffect(() => {
        if (currentSlide >= total) setCurrentSlide(0);
    }, [currentSlide, total]);

    const nextSlide = () => {
        if (total === 0) return;
        setCurrentSlide(prev => (prev + 1) % total);
    };

    const previousSlide = () => {
        if (total === 0) return;
        setCurrentSlide(prev => (prev - 1 + total) % total);
    };

    // Images advance on a timer; videos advance when they end
    useEffect(() => {

        if (!activeItem || activeItem.file.type !== "image" || total <= 1) {
            return;
        }

        const timer = setTimeout(nextSlide, IMAGE_DURATION);

        return () => clearTimeout(timer);

    }, [currentSlide, activeItem, total]);

    // Preload the next image so the transition is seamless
    useEffect(() => {

        if (total <= 1) return;

        const next = playlist[(currentSlide + 1) % total];

        if (next?.file.type === "image") {
            const img = new Image();
            img.src = next.file.url;
        }

    }, [currentSlide, playlist, total]);

    // Jump to the first slide of a collection
    const goToCollection = (fashionId) => {
        const index = playlist.findIndex(
            item => item.fashion._id === fashionId
        );
        if (index !== -1) setCurrentSlide(index);
    };

    return (

        <main className="fashion-page">

            <section className="fashion-hero">

                {!loading && activeItem ? (

                    <>

                        <div className="fashion-hero-media">

                            {activeItem.file.type === "image" ? (

                                <img
                                    key={`${currentSlide}-${activeItem.file.url}`}
                                    src={activeItem.file.url}
                                    alt={activeItem.file.name || activeFashion.name}
                                    className="fashion-hero-slide"
                                    onError={nextSlide}
                                />

                            ) : (

                                <video
                                    key={`${currentSlide}-${activeItem.file.url}`}
                                    src={activeItem.file.url}
                                    className="fashion-hero-slide"
                                    autoPlay
                                    muted
                                    playsInline
                                    loop={total === 1}
                                    onEnded={nextSlide}
                                    onError={nextSlide}
                                />

                            )}

                        </div>

                        <div className="fashion-hero-overlay"></div>

                        <div className="fashion-hero-content">

                            <span className="fashion-label">
                                THE FASHION EDIT
                            </span>

                            <h1>
                                Discover
                                <br />
                                <span key={activeFashion._id}>
                                    {activeFashion.name}
                                </span>
                            </h1>

                            <p>
                                Explore unique fashion collections,
                                discover new trends and find your
                                perfect style.
                            </p>

                            <button
                                className="fashion-hero-btn"
                                onClick={() =>
                                    navigate(`/fashion/${activeFashion._id}`)
                                }
                            >
                                View Collection
                                <span> ↗</span>
                            </button>

                        </div>

                        {total > 1 && (

                            <div className="fashion-slider-arrows">

                                <button
                                    onClick={previousSlide}
                                    aria-label="Previous slide"
                                >
                                    &#10094;
                                </button>

                                <button
                                    onClick={nextSlide}
                                    aria-label="Next slide"
                                >
                                    &#10095;
                                </button>

                            </div>

                        )}

                        {/* One dot per collection */}

                        {heroFashions.length > 1 && (

                            <div className="fashion-slider-dots">

                                {heroFashions.map((fashion, index) => (

                                    <button
                                        key={fashion._id}
                                        className={
                                            activeFashion._id === fashion._id
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            goToCollection(fashion._id)
                                        }
                                        aria-label={`Go to collection ${index + 1}`}
                                    />

                                ))}

                            </div>

                        )}

                    </>

                ) : (

                    <div className="fashion-hero-content">

                        <span className="fashion-label">
                            THE FASHION EDIT
                        </span>

                        <h1>
                            Style That
                            <br />
                            <span>Speaks For You.</span>
                        </h1>

                        <p>
                            Explore unique fashion collections,
                            discover new trends and find your
                            perfect style.
                        </p>

                    </div>

                )}

            </section>

        </main>

    );

}

export default FashionAnimation;