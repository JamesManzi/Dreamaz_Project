
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import api from "./api";
import "./About.css";

/* =========================================================
   IMAGE HELPERS
   Uses the same image structure as Home.jsx
========================================================= */

const getImage = (product) => {
    if (!product) return null;

    if (typeof product.image === "string") return product.image;
    if (typeof product.imageUrl === "string") return product.imageUrl;

    const files = product.files || product.images || [];

    if (Array.isArray(files) && files.length > 0) {
        const first = files[0];

        if (typeof first === "string") return first;

        return (
            first?.url ||
            first?.secure_url ||
            first?.path ||
            null
        );
    }

    return null;
};

const getVideo = (product) => {
    if (!Array.isArray(product?.files)) return null;

    const video = product.files.find(
        (file) =>
            file?.type === "video" &&
            (file?.url || file?.secure_url || file?.path)
    );

    return (
        video?.url ||
        video?.secure_url ||
        video?.path ||
        null
    );
};

/* =========================================================
   ABOUT PAGE
========================================================= */

const About = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });

    const [formMessage, setFormMessage] = useState({
        type: "",
        text: ""
    });

    const [scrollProgress, setScrollProgress] = useState(0);
    const [showTopButton, setShowTopButton] = useState(false);

    /* =====================================================
       HERO IMAGE DATA
    ===================================================== */

    const heroProducts = products
        .filter((product) => getImage(product))
        .slice(0, 3);

    /* =====================================================
       FETCH PRODUCTS
       Same endpoint and response structure as Home.jsx
    ===================================================== */

    useEffect(() => {
        let isMounted = true;

        const fetchTrending = async () => {
            try {
                setLoading(true);

                const res = await api.get("/loadProducts");

                const allProducts = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data?.products)
                        ? res.data.products
                        : [];

                const sortedProducts = [...allProducts].sort(
                    (a, b) => {
                        const dateA = new Date(
                            a.createdAt || a.updatedAt || 0
                        ).getTime();

                        const dateB = new Date(
                            b.createdAt || b.updatedAt || 0
                        ).getTime();

                        return dateB - dateA;
                    }
                );

                if (isMounted) {
                    setProducts(sortedProducts.slice(0, 8));
                }
            } catch (error) {
                console.error(
                    "Fetching Trending Artwork Error:",
                    error.response?.data || error.message
                );

                if (isMounted) {
                    setProducts([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchTrending();

        return () => {
            isMounted = false;
        };
    }, []);

    /* =====================================================
       SCROLL PROGRESS AND BACK TO TOP
    ===================================================== */

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (ticking) return;

            ticking = true;

            window.requestAnimationFrame(() => {
                const scrollableHeight =
                    document.documentElement.scrollHeight -
                    window.innerHeight;

                const progress =
                    scrollableHeight > 0
                        ? (window.scrollY / scrollableHeight) * 100
                        : 0;

                setScrollProgress(
                    Math.min(100, Math.max(0, progress))
                );

                setShowTopButton(window.scrollY > 450);

                ticking = false;
            });
        };

        window.addEventListener("scroll", handleScroll, {
            passive: true
        });

        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    /* =====================================================
       SCROLL REVEAL ANIMATIONS
    ===================================================== */

    useEffect(() => {
        const elements = document.querySelectorAll(
            ".dreamaz-about [data-reveal]"
        );

        if (!("IntersectionObserver" in window)) {
            elements.forEach((element) => {
                element.classList.add("is-visible");
            });

            return;
        }

        const observer = new IntersectionObserver(
            (entries, currentObserver) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        currentObserver.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.08,
                rootMargin: "0px 0px -35px 0px"
            }
        );

        elements.forEach((element) => {
            element.classList.add("reveal");
            observer.observe(element);
        });

        return () => observer.disconnect();
    }, [products, loading]);

    /* =====================================================
       CONTACT FORM
    ===================================================== */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (sending) return;

        setSending(true);

        setFormMessage({
            type: "",
            text: ""
        });

        try {
            const res = await api.post(
                "/sendContactMessage",
                formData
            );

            if (res.data?.success) {
                setFormMessage({
                    type: "success",
                    text:
                        res.data.message ||
                        "Your message has been sent successfully. Thank you for contacting us!"
                });

                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    subject: "",
                    message: ""
                });
            } else {
                setFormMessage({
                    type: "error",
                    text:
                        res.data?.message ||
                        "We could not send your message. Please try again."
                });
            }
        } catch (error) {
            console.error(
                "Sending Contact Message Error:",
                error.response?.data || error.message
            );

            setFormMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Something went wrong. Please try again later."
            });
        } finally {
            setSending(false);
        }
    };

    /* =====================================================
       SCROLL ACTIONS
    ===================================================== */

    const scrollToTrending = () => {
        document
            .getElementById("trending-artwork")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="dreamaz-about">

            {/* NAVBAR */}

            <Navbar />

            {/* SCROLL PROGRESS */}

            <div
                className="dreamaz-scroll-progress"
                style={{ width: `${scrollProgress}%` }}
                aria-hidden="true"
            />

            {/* =================================================
                HERO SECTION WITH TRENDING IMAGES
            ================================================= */}

            <section className="dreamaz-trending-hero">
                <div className="dreamaz-trending-hero-overlay" />

                <div className="dreamaz-trending-hero-layout">

                    {/* LEFT: HERO TEXT */}

                    <div className="dreamaz-trending-hero-content">
                        <span className="dreamaz-trending-eyebrow">
                            WELCOME TO DREAMAZ INK
                        </span>

                        <h1>
                            Explore Our
                            <span> Trending Artworks.</span>
                        </h1>

                        <p>
                            Discover inspiring artworks, creative
                            designs, and unique pieces that bring
                            imagination to life. Explore the latest
                            creations from Dreamaz Ink.
                        </p>

                        <button
                            type="button"
                            className="dreamaz-trending-hero-button"
                            onClick={scrollToTrending}
                        >
                            Explore Trending Artworks
                            <span aria-hidden="true">↗</span>
                        </button>

                        <div className="dreamaz-trending-count">
                            <strong>
                                {loading ? "—" : products.length}
                            </strong>

                            <span>Featured Artworks</span>
                        </div>
                    </div>

                    {/* RIGHT: ARTWORK IMAGE GALLERY */}

                    <div className="dreamaz-hero-gallery">

                        {loading ? (
                            <div className="dreamaz-hero-gallery-loading">
                                <div className="dreamaz-loading-spinner" />

                                <span>
                                    Loading artworks...
                                </span>
                            </div>
                        ) : heroProducts.length > 0 ? (
                            <>
                                {/* MAIN ARTWORK */}

                                <div className="dreamaz-hero-main-image">
                                    <img
                                        src={getImage(heroProducts[0])}
                                        alt={
                                            heroProducts[0].name ||
                                            "Featured Dreamaz artwork"
                                        }
                                        fetchPriority="high"
                                    />

                                    <div className="dreamaz-hero-image-caption">
                                        <span>FEATURED ARTWORK</span>

                                        <h3>
                                            {heroProducts[0].name ||
                                                "Creative Expression"}
                                        </h3>
                                    </div>
                                </div>

                                {/* SMALLER ARTWORKS */}

                                <div className="dreamaz-hero-side-images">
                                    {heroProducts.slice(1, 3).map(
                                        (product, index) => (
                                            <div
                                                className="dreamaz-hero-small-image"
                                                key={product._id || index}
                                            >
                                                <img
                                                    src={getImage(product)}
                                                    alt={
                                                        product.name ||
                                                        "Dreamaz artwork"
                                                    }
                                                    loading="lazy"
                                                />

                                                <span>
                                                    {product.category ||
                                                        "Artwork"}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="dreamaz-hero-gallery-empty">
                                <span>DI</span>
                                <p>Our creative collection</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="dreamaz-trending-hero-bottom">
                    <span>CREATIVITY. EXPRESSION. ART.</span>
                    <span>SCROLL TO EXPLORE ↓</span>
                </div>
            </section>

            {/* =================================================
                TRENDING ARTWORK COLLECTION
            ================================================= */}

            <section
                className="dreamaz-trending-section"
                id="trending-artwork"
            >
                <div
                    className="dreamaz-trending-intro"
                    data-reveal
                >
                    <span className="dreamaz-section-eyebrow">
                        DISCOVER OUR COLLECTION
                    </span>

                    <h2>
                        Trending <span>Artwork</span>
                    </h2>

                    <p>
                        Explore our latest featured creations.
                        Each artwork brings a unique perspective,
                        creative expression, and visual experience.
                    </p>
                </div>

                {loading ? (
                    <div className="dreamaz-artwork-loading">
                        <div className="dreamaz-loading-spinner" />

                        <p>
                            Discovering amazing artwork...
                        </p>
                    </div>
                ) : products.length > 0 ? (
                    <div className="dreamaz-artwork-stories">
                        {products.map((product, index) => {
                            const image = getImage(product);
                            const video = getVideo(product);

                            return (
                                <article
                                    className={`dreamaz-artwork-story ${
                                        index % 2 !== 0 ? "reverse" : ""
                                    }`}
                                    key={product._id || index}
                                >
                                    {/* ARTWORK MEDIA */}

                                    <div
                                        className="dreamaz-story-media"
                                        data-reveal={
                                            index % 2 === 0
                                                ? "left"
                                                : "right"
                                        }
                                    >
                                        <div className="dreamaz-story-media-frame">
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={
                                                        product.name ||
                                                        "Dreamaz Ink artwork"
                                                    }
                                                    loading="lazy"
                                                />
                                            ) : video ? (
                                                <video
                                                    src={video}
                                                    muted
                                                    loop
                                                    autoPlay
                                                    playsInline
                                                    preload="metadata"
                                                />
                                            ) : (
                                                <div className="dreamaz-story-placeholder">
                                                    <span>DI</span>

                                                    <p>
                                                        Artwork Preview
                                                    </p>
                                                </div>
                                            )}

                                            <span className="dreamaz-story-number">
                                                {String(index + 1).padStart(
                                                    2,
                                                    "0"
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* ARTWORK DESCRIPTION */}

                                    <div
                                        className="dreamaz-story-content"
                                        data-reveal={
                                            index % 2 === 0
                                                ? "right"
                                                : "left"
                                        }
                                    >
                                        <span className="dreamaz-story-label">
                                            FEATURED ARTWORK /{" "}
                                            {String(index + 1).padStart(
                                                2,
                                                "0"
                                            )}
                                        </span>

                                        <h3>
                                            {product.name ||
                                                product.title ||
                                                "A Unique Creation"}
                                        </h3>

                                        {product.category && (
                                            <span className="dreamaz-story-category">
                                                {product.category}
                                            </span>
                                        )}

                                        <p>
                                            {product.description ||
                                                "Discover the creativity and inspiration behind this unique artwork. Every detail contributes to a visual experience that makes this creation special."}
                                        </p>

                                        <div className="dreamaz-story-bottom">
                                            <span>
                                                DREAMAZ INK
                                            </span>

                                            <span>
                                                ART THAT TELLS A STORY
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="dreamaz-no-artwork">
                        <span className="dreamaz-no-artwork-icon">
                            ✦
                        </span>

                        <h3>Artwork Coming Soon</h3>

                        <p>
                            We are preparing something creative for you.
                            Please check back soon.
                        </p>
                    </div>
                )}
            </section>

            {/* =================================================
                CONTACT SECTION
            ================================================= */}

            <section
                className="dreamaz-contact-section"
                id="contact"
            >
                <div className="dreamaz-contact-container">

                    {/* CONTACT INFORMATION */}

                    <div
                        className="dreamaz-contact-info"
                        data-reveal="left"
                    >
                        <span className="dreamaz-section-eyebrow">
                            LET'S CONNECT
                        </span>

                        <h2>
                            Have Something
                            <span> In Mind?</span>
                        </h2>

                        <p className="dreamaz-contact-description">
                            Have a question, an idea, or want to work
                            with us? We would love to hear from you.
                            Send us a message and let's start a
                            conversation.
                        </p>

                        <div className="dreamaz-contact-details">

                            <div className="dreamaz-contact-detail">
                                <div className="dreamaz-contact-icon">
                                    ✉
                                </div>

                                <div>
                                    <span>Email Us</span>

                                    <a href="mailto:your-email@example.com">
                                        your-email@example.com
                                    </a>
                                </div>
                            </div>

                            <div className="dreamaz-contact-detail">
                                <div className="dreamaz-contact-icon">
                                    ☎
                                </div>

                                <div>
                                    <span>Call Us</span>

                                    <a href="tel:+250000000000">
                                        +250 000 000 000
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="dreamaz-contact-note">
                            <span>✦</span>

                            <p>
                                Every great collaboration starts with
                                a conversation.
                            </p>
                        </div>
                    </div>

                    {/* CONTACT FORM */}

                    <div
                        className="dreamaz-contact-form-wrapper"
                        data-reveal="right"
                    >
                        <div className="dreamaz-contact-form-heading">
                            <span>GET IN TOUCH</span>

                            <h3>Send Us A Message</h3>

                            <p>
                                Fill in the form below and we will get
                                back to you.
                            </p>
                        </div>

                        {formMessage.text && (
                            <div
                                className={`dreamaz-form-message ${formMessage.type}`}
                                role="status"
                            >
                                {formMessage.text}
                            </div>
                        )}

                        <form
                            className="dreamaz-contact-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="dreamaz-form-row">

                                <div className="dreamaz-form-group">
                                    <label htmlFor="contact-name">
                                        Full Name
                                    </label>

                                    <input
                                        id="contact-name"
                                        type="text"
                                        name="name"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        autoComplete="name"
                                        required
                                    />
                                </div>

                                <div className="dreamaz-form-group">
                                    <label htmlFor="contact-email">
                                        Email Address
                                    </label>

                                    <input
                                        id="contact-email"
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="dreamaz-form-row">

                                <div className="dreamaz-form-group">
                                    <label htmlFor="contact-phone">
                                        Phone Number
                                    </label>

                                    <input
                                        id="contact-phone"
                                        type="tel"
                                        name="phone"
                                        placeholder="Enter your phone number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        autoComplete="tel"
                                    />
                                </div>

                                <div className="dreamaz-form-group">
                                    <label htmlFor="contact-subject">
                                        Subject
                                    </label>

                                    <input
                                        id="contact-subject"
                                        type="text"
                                        name="subject"
                                        placeholder="What is this about?"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="dreamaz-form-group">
                                <label htmlFor="contact-message">
                                    Your Message
                                </label>

                                <textarea
                                    id="contact-message"
                                    name="message"
                                    placeholder="Write your message here..."
                                    rows="6"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="dreamaz-contact-submit"
                                disabled={sending}
                            >
                                {sending ? (
                                    <>
                                        <span className="dreamaz-button-spinner" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        Send Message
                                        <span aria-hidden="true">
                                            ↗
                                        </span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* BACK TO TOP */}

            {showTopButton && (
                <button
                    type="button"
                    className="dreamaz-back-to-top"
                    onClick={scrollToTop}
                    aria-label="Back to top"
                >
                    ↑
                </button>
            )}

            {/* FOOTER */}

            <Footer />
        </div>
    );
};

export default About;
