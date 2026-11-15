
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useState } from "react";
import api from "./api";
import "./About.css";

function About() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });

    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({
        message: "",
        type: ""
    });

    // Replace these with your real business contacts
    const businessEmail = "your-email@example.com";
    const businessPhone = "+250 7XX XXX XXX";

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

                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    subject: "",
                    message: ""
                });
            } else {
                setFeedback({
                    message: response.data.message || "Unable to send your message.",
                    type: "error"
                });
            }
        } catch (error) {
            console.error("Contact form error:", error);

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

            <main className="dreamaz-about">

                {/* Hero */}
                <section className="dreamaz-about-hero">
                    <div className="dreamaz-about-hero-content">
                        <span>WELCOME TO DREAMAZ INK</span>

                        <h1>Art That Tells A Story.</h1>

                        <p>
                            Discover creativity, imagination, and unique
                            artistic expressions. We believe every piece
                            of art has a story worth sharing.
                        </p>

                        <a href="#about-contact" className="dreamaz-hero-btn">
                            Contact Us
                        </a>
                    </div>
                </section>

                {/* About Information */}
                <section className="dreamaz-about-content">

                    <div className="dreamaz-about-image">
                        <div className="dreamaz-art-placeholder">
                            <span>Dreamaz Ink</span>
                            <h2>Creativity Without Limits</h2>
                        </div>
                    </div>

                    <div className="dreamaz-about-text">
                        <span className="dreamaz-section-label">
                            WHO WE ARE
                        </span>

                        <h2>About Dreamaz Ink</h2>

                        <p>
                            Dreamaz Ink is a creative art brand built around
                            imagination, originality, and artistic expression.
                            We believe art is more than decoration; it is a
                            powerful way to communicate ideas, emotions, and
                            personal identity.
                        </p>

                        <p>
                            Our goal is to connect people with creative
                            artwork that inspires them, adds personality
                            to their spaces, and makes every experience
                            more meaningful.
                        </p>

                        <p>
                            Through creativity and passion, we aim to make
                            art accessible to people who appreciate unique
                            designs and meaningful artistic experiences.
                        </p>
                    </div>

                </section>

                {/* Mission and Vision */}
                <section className="dreamaz-mission-section">

                    <div className="dreamaz-info-card">
                        <div className="dreamaz-info-icon">✦</div>
                        <h3>Our Mission</h3>
                        <p>
                            To create and share meaningful artwork that
                            inspires creativity, expresses individuality,
                            and connects people through art.
                        </p>
                    </div>

                    <div className="dreamaz-info-card">
                        <div className="dreamaz-info-icon">◎</div>
                        <h3>Our Vision</h3>
                        <p>
                            To become a recognized creative brand known
                            for originality, quality, innovation, and
                            artistic storytelling.
                        </p>
                    </div>

                    <div className="dreamaz-info-card">
                        <div className="dreamaz-info-icon">♡</div>
                        <h3>Our Values</h3>
                        <p>
                            Creativity, originality, customer satisfaction,
                            quality, and the belief that every story deserves
                            to be expressed.
                        </p>
                    </div>

                </section>

                {/* Contact Information */}
                <section className="dreamaz-contact-section" id="about-contact">

                    <div className="dreamaz-contact-heading">
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

                        {/* Contact details */}
                        <div className="dreamaz-contact-information">

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
                                    <a href={`tel:${businessPhone.replace(/\s/g, "")}`}>
                                        {businessPhone}
                                    </a>
                                </div>
                            </div>

                            <div className="dreamaz-contact-note">
                                We welcome questions, collaborations,
                                custom artwork requests, and business inquiries.
                            </div>

                        </div>

                        {/* Contact Form */}
                        <div className="dreamaz-contact-form-container">

                            <h3>Send Us a Message</h3>

                            <p>
                                Complete the form below and our team will
                                get back to you.
                            </p>

                            {feedback.message && (
                                <div className={`dreamaz-feedback ${feedback.type}`}>
                                    {feedback.message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>

                                <div className="dreamaz-form-row">
                                    <div className="dreamaz-form-group">
                                        <label>Your Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Enter your name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="dreamaz-form-group">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="dreamaz-form-row">
                                    <div className="dreamaz-form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="Enter your phone number"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="dreamaz-form-group">
                                        <label>Subject</label>
                                        <input
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
                                    <label>Your Message</label>
                                    <textarea
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
