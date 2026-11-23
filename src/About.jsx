import Navbar from "./Navbar";
import Footer from "./Footer";
import { useState, useEffect, useMemo, useRef } from "react";
import api from "./api";
import "./About.css";
import "./AboutAnimations.css";

const MARQUEE_WORDS = [
    "Art",
    "Creativity",
    "Expression",
    "Storytelling",
    "Originality",
    "Imagination"
];

const INITIAL_FORM = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
};

function About() {
    const [formData, setFormData] = useState(INITIAL_FORM);

    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({
        message: "",
        type: ""
    });

    const [scrollProgress, setScrollProgress] = useState(0);
    const [showTop, setShowTop] = useState(false);

    const pageRef = useRef(null);

    // Replace these with your real business contact details.
    const businessEmail = "your-email@example.com";
    const businessPhone = "+250 7XX XXX XXX";

    /* ---------- Fetch trending artwork ---------- */
    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const response = await api.get("/getTrending");

                if (response.data.success) {
                    setProducts(response.data.trending || []);
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error(
                    "Unable to load artwork:",
                    error.response?.data || error.message
                );
                setProducts([]);
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchTrending();
    }, []);

    /* ---------- Categories ---------- */
    const categories = useMemo(() => {
        return [
            "All",
            ...new Set(
                products.map((product) => product.category).filter(Boolean)
            )
        ];
    }, [products]);

    /* ---------- Newest artwork first ---------- */
    const trendingProducts = useMemo(() => {
        return [...products]
            .sort(
                (a, b) =>
                    new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            )
            .filter(
                (product) =>
                    selectedCategory === "All" ||
                    product.category === selectedCategory
            )
            .slice(0, 8);
    }, [products, selectedCategory]);

    const getImage = (product) =>
        product.files?.find((file) => file.type === "image" && file.url)
            ?.url || "";

    const getVideo = (product) =>
        product.files?.find((file) => file.type === "video" && file.url)
            ?.url || "";

    const heroVideo = useMemo(() => {
        for (const product of products) {
            const video = product.files?.find(
                (file) => file.type === "video" && file.url
            );

            if (video) return video.url;
        }

        return "";
    }, [products]);

    const getName = (product) => product.name || "Untitled Artwork";

    /* ---------- Scroll progress, back-to-top, hero parallax ---------- */
    useEffect(() => {
        let ticking = false;

        const onScroll = () => {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const top = window.scrollY;
                const height =
                    document.documentElement.scrollHeight - window.innerHeight;

                setScrollProgress(height > 0 ? top / height : 0);
                setShowTop(top > 600);

                // Parallax only while the hero is on screen
                if (pageRef.current && top < 1000) {
                    pageRef.current.style.setProperty(
                        "--parallax",
                        `${top * 0.25}px`
                    );
                    pageRef.current.style.setProperty(
                        "--hero-fade",
                        `${Math.max(0, 1 - top / 650)}`
                    );
                }

                ticking = false;
            });
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* ---------- Reveal on scroll ---------- */
    useEffect(() => {
        if (!("IntersectionObserver" in window)) return undefined;

        const targets = document.querySelectorAll(
            ".dreamaz-about [data-reveal]"
        );

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
        );

        targets.forEach((el) => {
            if (!el.classList.contains("is-visible")) {
                el.classList.add("reveal");
                observer.observe(el);
            }
        });

        return () => observer.disconnect();
    }, [loadingProducts, trendingProducts]);

    /* ---------- Contact form ---------- */
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setFeedback({ message: "", type: "" });

        try {
            const response = await api.post("/sendContactMessage", formData);

            if (response.data.success) {
                setFeedback({
                    message: "Your message has been sent successfully!",
                    type: "success"
                });

                setFormData(INITIAL_FORM);
            } else {
                setFeedback({
                    message:
                        response.data.message || "Unable to send your message.",
                    type: "error"
                });
            }
        } catch (error) {
            setFeedback({
                message:
                    error.response?.data?.message ||
                    "Something went wrong. Please try again later.",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <main className="dreamaz-about" ref={pageRef}>
                {/* Scroll progress + back to top */}
                <div className="dreamaz-progress" aria-hidden="true">
                    <span style={{ transform: `scaleX(${scrollProgress})` }} />
                </div>

                <button
                    type="button"
                    className={`dreamaz-top ${showTop ? "visible" : ""}`}
                    onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    aria-label="Back to top"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                </button>

                {/* HERO SECTION WITH VIDEO ANIMATION */}
                <section className="dreamaz-about-hero">
                    <div className="dreamaz-hero-video">
                        {heroVideo ? (
                            <video
                                key={heroVideo}
                                src={heroVideo}
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="auto"
                            />
                        ) : (
                            <div className="dreamaz-hero-fallback"></div>
                        )}
                    </div>

                    <div className="dreamaz-hero-overlay"></div>

                    <div className="dreamaz-about-hero-content">
                        <span>WELCOME TO DREAMAZ INK</span>

                        <h1>Art That Tells A Story.</h1>

                        <p>
                            Discover creativity, imagination, and unique
                            artistic expressions. Every piece of art has a
                            story worth sharing.
                        </p>

                        <a href="#about-contact" className="dreamaz-hero-btn">
                            Get In Touch <span>→</span>
                        </a>
                    </div>

                    <div className="dreamaz-hero-decoration">
                        <span>ART</span>
                        <span>CREATIVITY</span>
                        <span>EXPRESSION</span>
                    </div>

                    <div className="dreamaz-hero-scroll">
                        <span></span>
                        SCROLL TO EXPLORE
                    </div>
                </section>

                {/* MARQUEE BAND */}
                <div className="dreamaz-marquee" aria-hidden="true">
                    <div className="dreamaz-marquee-track">
                        {[...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS].map(
                            (word, index) => (
                                <span key={`${word}-${index}`}>
                                    {word}
                                    <i>✦</i>
                                </span>
                            )
                        )}
                    </div>
                </div>

                {/* ABOUT INFORMATION */}
                <section className="dreamaz-about-content">
                    <div className="dreamaz-about-image" data-reveal="left">
                        <div className="dreamaz-art-placeholder">
                            <span>THE WORLD OF ART</span>
                            <h2>Creativity Without Limits</h2>
                            <div className="dreamaz-art-decoration">✦</div>
                        </div>
                    </div>

                    <div className="dreamaz-about-text">
                        <span
                            className="dreamaz-section-label"
                            data-reveal="right"
                        >
                            WHO WE ARE
                        </span>

                        <h2 data-reveal="right" style={{ "--delay": "80ms" }}>
                            More Than Art. It's An Expression.
                        </h2>

                        <p data-reveal="right" style={{ "--delay": "160ms" }}>
                            Dreamaz Ink is a creative art brand built around
                            imagination, originality, and artistic
                            expression. We believe art is more than
                            decoration; it is a powerful way to communicate
                            ideas, emotions, and personal identity.
                        </p>

                        <p data-reveal="right" style={{ "--delay": "240ms" }}>
                            Our goal is to connect people with creative
                            artwork that inspires them, adds personality to
                            their spaces, and makes every experience more
                            meaningful.
                        </p>

                        <p data-reveal="right" style={{ "--delay": "320ms" }}>
                            Through creativity and passion, we aim to make
                            art accessible to people who appreciate unique
                            designs and meaningful artistic experiences.
                        </p>

                        <a
                            href="#trending-artwork"
                            className="dreamaz-text-link"
                            data-reveal="right"
                            style={{ "--delay": "400ms" }}
                        >
                            Discover Our Artwork <span>→</span>
                        </a>
                    </div>
                </section>

                {/* MISSION, VISION AND VALUES */}
                <section className="dreamaz-mission-section">
                    <div
                        className="dreamaz-info-card"
                        data-reveal="up"
                        style={{ "--delay": "0ms" }}
                    >
                        <div className="dreamaz-info-icon">✦</div>
                        <h3>Our Mission</h3>
                        <p>
                            To create and share meaningful artwork that
                            inspires creativity, expresses individuality, and
                            connects people through art.
                        </p>
                    </div>

                    <div
                        className="dreamaz-info-card"
                        data-reveal="up"
                        style={{ "--delay": "120ms" }}
                    >
                        <div className="dreamaz-info-icon">◎</div>
                        <h3>Our Vision</h3>
                        <p>
                            To become a recognized creative brand known for
                            originality, quality, innovation, and artistic
                            storytelling.
                        </p>
                    </div>

                    <div
                        className="dreamaz-info-card"
                        data-reveal="up"
                        style={{ "--delay": "240ms" }}
                    >
                        <div className="dreamaz-info-icon">♡</div>
                        <h3>Our Values</h3>
                        <p>
                            Creativity, originality, customer satisfaction,
                            quality, and the belief that every story deserves
                            to be expressed.
                        </p>
                    </div>
                </section>

                {/* TRENDING ARTWORK */}
                <section
                    className="dreamaz-trending-section"
                    id="trending-artwork"
                >
                    <div className="dreamaz-trending-heading" data-reveal="up">
                        <div>
                            <span className="dreamaz-section-label">
                                DISCOVER CREATIVITY
                            </span>

                            <h2>Trending Artwork</h2>

                            <p>
                                Explore artwork people are discovering and
                                loving across Dreamaz Ink.
                            </p>
                        </div>

                        <span className="dreamaz-trending-symbol">✳</span>
                    </div>

                    {/* CATEGORY FILTERS */}
                    <div
                        className="dreamaz-category-filters"
                        data-reveal="up"
                        style={{ "--delay": "100ms" }}
                    >
                        {categories.map((category) => (
                            <button
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

                    {loadingProducts ? (
                        <div className="dreamaz-art-loading">
                            <div className="dreamaz-loader"></div>
                            Loading trending artwork...
                        </div>
                    ) : trendingProducts.length > 0 ? (
                        <div className="dreamaz-trending-grid">
                            {trendingProducts.map((product, index) => {
                                const image = getImage(product);
                                const video = getVideo(product);

                                return (
                                    <article
                                        className="dreamaz-art-card"
                                        key={product._id || index}
                                        data-reveal="zoom"
                                        style={{
                                            "--delay": `${(index % 4) * 90}ms`
                                        }}
                                    >
                                        <div className="dreamaz-art-card-image">
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={getName(product)}
                                                    loading="lazy"
                                                />
                                            ) : video ? (
                                                <video
                                                    src={video}
                                                    autoPlay
                                                    muted
                                                    loop
                                                    playsInline
                                                    preload="metadata"
                                                />
                                            ) : (
                                                <div className="dreamaz-no-image">
                                                    <span>✦</span>
                                                    Artwork
                                                </div>
                                            )}

                                            <span className="dreamaz-trending-badge">
                                                ✦ Trending
                                            </span>
                                        </div>

                                        <div className="dreamaz-art-card-info">
                                            <span className="dreamaz-art-category">
                                                {product.category || "Artwork"}
                                            </span>

                                            <h3>{getName(product)}</h3>

                                            {product.description && (
                                                <p>{product.description}</p>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="dreamaz-empty-artwork" data-reveal="up">
                            <span>✦</span>
                            <h3>New Creativity Is Coming!</h3>
                            <p>
                                There is no trending artwork to display in
                                this category yet.
                            </p>
                        </div>
                    )}
                </section>

                {/* WHY CHOOSE US */}
                <section className="dreamaz-why-section">
                    <div className="dreamaz-why-heading" data-reveal="up">
                        <span className="dreamaz-section-label">
                            THE DREAMAZ EXPERIENCE
                        </span>

                        <h2>Why Choose Dreamaz Ink?</h2>

                        <p>
                            We believe creativity should inspire, connect, and
                            make a difference.
                        </p>
                    </div>

                    <div className="dreamaz-why-grid">
                        <div data-reveal="up" style={{ "--delay": "0ms" }}>
                            <span>01</span>
                            <h3>Unique Creativity</h3>
                            <p>
                                Discover artwork that expresses originality
                                and individuality.
                            </p>
                        </div>

                        <div data-reveal="up" style={{ "--delay": "140ms" }}>
                            <span>02</span>
                            <h3>Art For Everyone</h3>
                            <p>
                                Explore different artistic styles,
                                categories, and creative ideas.
                            </p>
                        </div>

                        <div data-reveal="up" style={{ "--delay": "280ms" }}>
                            <span>03</span>
                            <h3>Creative Community</h3>
                            <p>
                                Connect with creativity and discover inspiring
                                artistic expressions.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CONTACT SECTION */}
                <section className="dreamaz-contact-section" id="about-contact">
                    <div className="dreamaz-contact-heading" data-reveal="up">
                        <span className="dreamaz-section-label">
                            GET IN TOUCH
                        </span>

                        <h2>Let's Talk About Your Ideas</h2>

                        <p>
                            Have a question, project idea, or special request?
                            We'd love to hear from you.
                        </p>
                    </div>

                    <div className="dreamaz-contact-layout">
                        {/* CONTACT INFORMATION */}
                        <div
                            className="dreamaz-contact-information"
                            data-reveal="left"
                        >
                            <h3>Contact Information</h3>

                            <p>
                                Reach out to us through any of the following
                                channels.
                            </p>

                            <div className="dreamaz-contact-item">
                                <span className="dreamaz-contact-icon">✉</span>

                                <div>
                                    <h4>Email Address</h4>
                                    <a href={`mailto:${businessEmail}`}>
                                        {businessEmail}
                                    </a>
                                </div>
                            </div>

                            <div className="dreamaz-contact-item">
                                <span className="dreamaz-contact-icon">☎</span>

                                <div>
                                    <h4>Phone Number</h4>
                                    <a
                                        href={`tel:${businessPhone.replace(/\s/g, "")}`}
                                    >
                                        {businessPhone}
                                    </a>
                                </div>
                            </div>

                            <div className="dreamaz-contact-note">
                                We welcome questions, collaborations, custom
                                artwork requests, and business inquiries.
                            </div>
                        </div>

                        {/* CONTACT FORM */}
                        <div
                            className="dreamaz-contact-form-container"
                            data-reveal="right"
                        >
                            <h3>Send Us a Message</h3>

                            <p>
                                Complete the form below and our team will get
                                back to you.
                            </p>

                            {feedback.message && (
                                <div
                                    className={`dreamaz-feedback ${feedback.type}`}
                                    role={
                                        feedback.type === "error"
                                            ? "alert"
                                            : "status"
                                    }
                                >
                                    {feedback.message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="dreamaz-form-row">
                                    <div className="dreamaz-form-group">
                                        <label htmlFor="contact-name">
                                            Your Name
                                        </label>

                                        <input
                                            id="contact-name"
                                            type="text"
                                            name="name"
                                            placeholder="Enter your name"
                                            autoComplete="name"
                                            value={formData.name}
                                            onChange={handleChange}
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
                                            autoComplete="email"
                                            value={formData.email}
                                            onChange={handleChange}
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
                                            autoComplete="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
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
                                            placeholder="What is your inquiry about?"
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
                                    disabled={loading}
                                    className="dreamaz-send-btn"
                                >
                                    {loading ? "Sending..." : "Send Message"}

                                    {!loading && <span> →</span>}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}

export default About;