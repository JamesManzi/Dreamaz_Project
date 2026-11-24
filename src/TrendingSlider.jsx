import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import "./TrendingSlider.css";

const AUTOPLAY_MS = 5500;

function Chevron({ direction }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d={direction === "left" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
        </svg>
    );
}

/*
  slides: [{
    id, image, title, price,
    categoryName, categoryDescription, categoryCount, collectionNumber
  }]
*/
function TrendingSlider({ slides = [], onExplore }) {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const touchStartX = useRef(null);

    const total = slides.length;

    const goTo = useCallback(
        (index) => {
            if (!total) return;
            setActive(((index % total) + total) % total);
        },
        [total]
    );

    const next = useCallback(() => goTo(active + 1), [active, goTo]);
    const prev = useCallback(() => goTo(active - 1), [active, goTo]);

    // keep index valid if the slide list changes
    useEffect(() => {
        if (active >= total) setActive(0);
    }, [total, active]);

    // autoplay (restarts whenever the active slide changes)
    useEffect(() => {
        if (paused || total < 2) return;

        const timer = window.setTimeout(next, AUTOPLAY_MS);
        return () => window.clearTimeout(timer);
    }, [active, paused, total, next]);

    if (!total) return null;

    const current = slides[active];

    const onTouchStart = (event) => {
        touchStartX.current = event.touches[0].clientX;
    };

    const onTouchEnd = (event) => {
        if (touchStartX.current === null) return;

        const diff = event.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;

        if (Math.abs(diff) < 45) return;
        diff < 0 ? next() : prev();
    };

    const onKeyDown = (event) => {
        if (event.key === "ArrowRight") next();
        if (event.key === "ArrowLeft") prev();
    };

    return (
        <div
            className="ts"
            data-reveal
            tabIndex={0}
            onKeyDown={onKeyDown}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            aria-roledescription="carousel"
            aria-label="Featured collections"
        >
            {/* IMAGE SLIDES */}
            <div className="ts-stage">
                <div
                    className="ts-viewport"
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                >
                    {slides.map((slide, index) => (
                        <Link
                            key={slide.id}
                            to={`/products/${slide.id}`}
                            className={`ts-slide ${
                                index === active ? "active" : ""
                            }`}
                            aria-hidden={index !== active}
                            tabIndex={index === active ? 0 : -1}
                        >
                            {slide.image ? (
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    loading={index === 0 ? "eager" : "lazy"}
                                />
                            ) : (
                                <div className="ts-no-image">
                                    No image available
                                </div>
                            )}
                        </Link>
                    ))}

                    <div className="ts-shade" />

                    <span className="ts-counter">
                        {String(active + 1).padStart(2, "0")}
                        <em>/</em>
                        {String(total).padStart(2, "0")}
                    </span>

                    {total > 1 && (
                        <>
                            <button
                                type="button"
                                className="ts-arrow left"
                                onClick={prev}
                                aria-label="Previous slide"
                            >
                                <Chevron direction="left" />
                            </button>

                            <button
                                type="button"
                                className="ts-arrow right"
                                onClick={next}
                                aria-label="Next slide"
                            >
                                <Chevron direction="right" />
                            </button>
                        </>
                    )}

                    {total > 1 && (
                        <div className="ts-progress" aria-hidden="true">
                            <span
                                key={`${active}-${paused}`}
                                className={paused ? "paused" : ""}
                                style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                            />
                        </div>
                    )}
                </div>

                {/* THUMBNAILS */}
                {total > 1 && (
                    <div className="ts-thumbs" role="tablist">
                        {slides.map((slide, index) => (
                            <button
                                key={slide.id}
                                type="button"
                                role="tab"
                                aria-selected={index === active}
                                aria-label={`Show ${slide.title}`}
                                className={`ts-thumb ${
                                    index === active ? "active" : ""
                                }`}
                                onClick={() => goTo(index)}
                            >
                                {slide.image ? (
                                    <img
                                        src={slide.image}
                                        alt=""
                                        loading="lazy"
                                    />
                                ) : (
                                    <span />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* DESCRIPTION OF CURRENT IMAGE (RIGHT) */}
            <div className="ts-info" aria-live="polite">
                <div className="ts-info-inner" key={current.id}>
                    <span className="ts-label">
                        <span className="ts-dot" />
                        Featured Collection
                    </span>

                    <span className="ts-number">
                        COLLECTION{" "}
                        {String(current.collectionNumber).padStart(2, "0")}
                    </span>

                    <h3 className="ts-category">{current.categoryName}</h3>

                    <p className="ts-category-text">
                        {current.categoryDescription}
                    </p>

                    <div className="ts-product">
                        <span className="ts-product-label">Now showing</span>
                        <h4 title={current.title}>{current.title}</h4>
                        <strong>{current.price}</strong>
                    </div>

                    <div className="ts-meta">
                        {current.categoryCount}{" "}
                        {current.categoryCount === 1 ? "Artwork" : "Artworks"}{" "}
                        in this collection
                    </div>

                    <div className="ts-actions">
                        <Link
                            to={`/products/${current.id}`}
                            className="ts-btn primary"
                        >
                            View Artwork
                        </Link>

                        <button
                            type="button"
                            className="ts-btn secondary"
                            onClick={() => onExplore(current.categoryName)}
                        >
                            Explore Collection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TrendingSlider;