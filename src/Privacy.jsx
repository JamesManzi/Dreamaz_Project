import { useEffect, useState } from "react";
import "./Privacy.css";

const ICONS = {
    collect: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6",
    use: "M13 2L3 14h8l-1 8 10-12h-8l1-8z",
    google: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
    sharing: "M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13",
    security: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    rights: "M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4L12 14l-3-3",
    cookies: "M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5zM8.5 11.5h.01M12 16h.01M15.5 13h.01",
    updates: "M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0 1 15-3.4L23 10M1 14l4.5 4.4A9 9 0 0 0 20.5 15",
    contact: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6",
};

const SECTIONS = [
    {
        id: "information-we-collect",
        icon: "collect",
        title: "Information We Collect",
        text: "We may collect your name, email address, account details, profile information, order information, and technical data when you use Dreamaz Ink.",
    },
    {
        id: "how-we-use-your-information",
        icon: "use",
        title: "How We Use Your Information",
        text: "Your information helps us manage accounts, process orders, provide customer support, improve our services, and maintain platform security.",
    },
    {
        id: "google-sign-in",
        icon: "google",
        title: "Google Sign-In",
        text: "If you sign in using Google, we may receive your name, email address, and profile information to create or authenticate your account. We never receive your Google password.",
    },
    {
        id: "information-sharing",
        icon: "sharing",
        title: "Information Sharing",
        text: "We do not sell your personal information. Information may be shared with trusted service providers when necessary to operate our website, process orders, or comply with legal obligations.",
    },
    {
        id: "data-security",
        icon: "security",
        title: "Data Security",
        text: "We use reasonable security measures to protect your personal information against unauthorized access, misuse, or disclosure. However, no online system is completely secure.",
    },
    {
        id: "your-rights",
        icon: "rights",
        title: "Your Rights",
        text: "You may request access to, correction of, or deletion of your personal information, subject to applicable laws and legal requirements.",
    },
    {
        id: "cookies",
        icon: "cookies",
        title: "Cookies",
        text: "Our website may use cookies and similar technologies to support essential functionality and improve your browsing experience.",
    },
    {
        id: "policy-updates",
        icon: "updates",
        title: "Policy Updates",
        text: "We may update this Privacy Policy when necessary. Any changes will be published on this page with an updated revision date.",
    },
];

const CONTACT_ID = "contact-us";

function Icon({ name }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d={ICONS[name]} />
        </svg>
    );
}

function Privacy() {
    const [active, setActive] = useState(SECTIONS[0].id);
    const [progress, setProgress] = useState(0);
    const [showTop, setShowTop] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Scroll progress + back-to-top visibility
    useEffect(() => {
        const onScroll = () => {
            const doc = document.documentElement;
            const max = doc.scrollHeight - window.innerHeight;
            setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
            setShowTop(window.scrollY > 500);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Reveal-on-scroll animation
    useEffect(() => {
        const items = document.querySelectorAll(".privacy-reveal");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );
        items.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    // Highlight the current section in the table of contents
    useEffect(() => {
        const targets = document.querySelectorAll(".privacy-section");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActive(entry.target.id);
                });
            },
            { rootMargin: "-30% 0px -60% 0px" }
        );
        targets.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const goBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = "/";
        }
    };

    const goTo = (id) => (e) => {
        e.preventDefault();
        document
            .getElementById(id)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <main className="privacy-page">
            <div className="privacy-progress" style={{ width: `${progress}%` }} />

            <section className="privacy-hero">
                <div className="privacy-orb privacy-orb-1" />
                <div className="privacy-orb privacy-orb-2" />
                <div className="privacy-grid" />

                <button type="button" className="privacy-back" onClick={goBack}>
                    <span>←</span> Back
                </button>

                <div className="privacy-hero-inner">
                    <div className="privacy-shield">
                        <Icon name="security" />
                    </div>
                    <span className="privacy-eyebrow">YOUR PRIVACY MATTERS</span>
                    <h1>
                        Privacy <strong>Policy</strong>
                    </h1>
                    <p>
                        We respect your privacy and are committed to protecting
                        your personal information.
                    </p>
                    <div className="privacy-updated">
                        <i /> Last updated: November 24, 2026
                    </div>
                </div>
            </section>

            <div className="privacy-layout">
                <aside className="privacy-toc">
                    <p className="privacy-toc-title">On this page</p>
                    <nav>
                        {[...SECTIONS, { id: CONTACT_ID, title: "Contact Us" }].map(
                            (s, i) => (
                                <a
                                    key={s.id}
                                    href={`#${s.id}`}
                                    onClick={goTo(s.id)}
                                    className={active === s.id ? "active" : ""}
                                >
                                    <span>{String(i + 1).padStart(2, "0")}</span>
                                    {s.title}
                                </a>
                            )
                        )}
                    </nav>
                </aside>

                <section className="privacy-container">
                    {SECTIONS.map((s, i) => (
                        <article
                            key={s.id}
                            id={s.id}
                            className="privacy-section privacy-reveal"
                        >
                            <div className="privacy-icon">
                                <Icon name={s.icon} />
                            </div>
                            <div className="privacy-body">
                                <h2>
                                    <em>{String(i + 1).padStart(2, "0")}</em>
                                    {s.title}
                                </h2>
                                <p>{s.text}</p>
                            </div>
                        </article>
                    ))}

                    <article
                        id={CONTACT_ID}
                        className="privacy-section privacy-contact privacy-reveal"
                    >
                        <div className="privacy-icon">
                            <Icon name="contact" />
                        </div>
                        <div className="privacy-body">
                            <h2>
                                <em>{String(SECTIONS.length + 1).padStart(2, "0")}</em>
                                Contact Us
                            </h2>
                            <p>
                                Have questions about your privacy? Contact the
                                Dreamaz Ink team.
                            </p>
                            <a href="mailto:YOUR_SUPPORT_EMAIL" className="privacy-cta">
                                Contact Support <span>→</span>
                            </a>
                        </div>
                    </article>
                </section>
            </div>

            <button
                type="button"
                className={`privacy-top ${showTop ? "show" : ""}`}
                aria-label="Back to top"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
                ↑
            </button>
        </main>
    );
}

export default Privacy;