
import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import api from "./api";
import Spinner from "./Spinner";
import { useMessage } from "./ShowMessage";

import "./Login.css";

/* =================================================================
   Icons
================================================================= */

const ICONS = {
    mail: (
        <>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
        </>
    ),

    lock: (
        <>
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </>
    ),

    eye: (
        <>
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
        </>
    ),

    eyeOff: (
        <>
            <path d="M3 3l18 18" />
            <path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6A17 17 0 0 0 2 12s3.6 7 10 7a10 10 0 0 0 4-.8" />
            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </>
    ),

    palette: (
        <>
            <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.5-1.9-.3-1 .4-2.1 1.5-2.1H17a4 4 0 0 0 4-4c0-5-4-10-9-10z" />
            <circle cx="7.5" cy="11" r="1" />
            <circle cx="10" cy="7" r="1" />
            <circle cx="15" cy="7.5" r="1" />
        </>
    ),

    shield: (
        <>
            <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" />
            <path d="M9 12l2 2 4-4" />
        </>
    ),

    sparkle: (
        <>
            <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
            <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />
        </>
    ),

    alert: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6M12 16.5v.5" />
        </>
    ),

    arrow: <path d="M5 12h14M13 6l6 6-6 6" />
};

const Icon = ({ name, size = 20 }) => (
    <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        {ICONS[name]}
    </svg>
);

/* =================================================================
   Static content
================================================================= */

const ROTATING_WORDS = [
    "tells a story",
    "inspires you",
    "makes it yours"
];

const FEATURES = [
    {
        icon: "palette",
        title: "Discover original artworks",
        text: "Browse unique pieces across many styles."
    },
    {
        icon: "sparkle",
        title: "Find art that fits your space",
        text: "Search and filter to find the right piece fast."
    },
    {
        icon: "shield",
        title: "Shop with your account",
        text: "Keep your cart and follow your orders."
    }
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* =================================================================
   Login page
================================================================= */

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const [success, setSuccess] = useState(false);
    const [capsLock, setCapsLock] = useState(false);

    const [touched, setTouched] = useState({
        email: false,
        password: false
    });

    const [shake, setShake] = useState(false);
    const [wordIndex, setWordIndex] = useState(0);

    const pageRef = useRef(null);
    const redirectTimer = useRef(null);

    const { showSuccess, showError } = useMessage();
    const navigate = useNavigate();

    /* ---------- Validation ---------- */

    const errors = {
        email: !email
            ? "Email is required"
            : !EMAIL_PATTERN.test(email)
            ? "Enter a valid email address"
            : "",

        password: !password
            ? "Password is required"
            : ""
    };

    const isValid = !errors.email && !errors.password;

    /* ---------- Rotating tagline ---------- */

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex(
                (i) => (i + 1) % ROTATING_WORDS.length
            );
        }, 2800);

        return () => clearInterval(interval);
    }, []);

    /* ---------- Cursor glow ---------- */

    const handleMouseMove = (e) => {
        const el = pageRef.current;

        if (!el) return;

        const rect = el.getBoundingClientRect();

        el.style.setProperty(
            "--mx",
            `${e.clientX - rect.left}px`
        );

        el.style.setProperty(
            "--my",
            `${e.clientY - rect.top}px`
        );
    };

    /* ---------- Cleanup ---------- */

    useEffect(() => {
        return () => clearTimeout(redirectTimer.current);
    }, []);

    /* ---------- Shake animation ---------- */

    const triggerShake = () => {
        setShake(true);

        setTimeout(() => {
            setShake(false);
        }, 500);
    };

    /* ---------- Authentication redirect ---------- */

    const authenticateUser = (user, token) => {
        localStorage.setItem("userId", user.id);
        localStorage.setItem("token", token);

        setSuccess(true);

        redirectTimer.current = setTimeout(() => {
            navigate(
                user.role === "admin"
                    ? "/admin-dashboard"
                    : "/dashboard"
            );
        }, 1500);
    };

    /* =================================================================
       NORMAL EMAIL AND PASSWORD LOGIN
    ================================================================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        setTouched({
            email: true,
            password: true
        });

        if (!isValid) {
            triggerShake();

            showError(
                errors.email ||
                errors.password ||
                "Please complete all fields."
            );

            return;
        }

        setLoading(true);

        try {
            const res = await api.post("/login", {
                email: email.trim().toLowerCase(),
                password
            });

            if (res.data.success) {
                authenticateUser(
                    res.data.user,
                    res.data.token
                );

                showSuccess("Login successful!");
            } else {
                showError(
                    res.data.message || "Login failed."
                );

                triggerShake();
            }
        } catch (error) {
            console.log(
                "Login Error:",
                error.response?.data || error.message
            );

            showError(
                error.response?.data?.message ||
                "Login failed. Please try again."
            );

            triggerShake();
        } finally {
            setLoading(false);
        }
    };

    /* =================================================================
       GOOGLE LOGIN
    ================================================================= */

    const handleGoogleSuccess = async (credentialResponse) => {
        if (!credentialResponse?.credential) {
            showError(
                "Google did not return a valid credential."
            );

            return;
        }

        setGoogleLoading(true);

        try {
            const res = await api.post("/google-register", {
                credential: credentialResponse.credential
            });

            if (!res.data.success) {
                showError(
                    res.data.message ||
                    "Google login failed."
                );

                return;
            }

            authenticateUser(
                res.data.user,
                res.data.token
            );

            showSuccess("Google login successful!");

        } catch (error) {
            console.log(
                "Google Login Error:",
                error.response?.data || error.message
            );

            showError(
                error.response?.data?.message ||
                "Unable to sign in with Google. Please try again."
            );

            triggerShake();

        } finally {
            setGoogleLoading(false);
        }
    };

    const handleGoogleError = () => {
        showError(
            "Google sign-in was cancelled or unsuccessful."
        );
    };

    /* ---------- Caps Lock ---------- */

    const handleKey = (e) => {
        setCapsLock(
            e.getModifierState &&
            e.getModifierState("CapsLock")
        );
    };

    /* =================================================================
       UI
    ================================================================= */

    return (
        <main
            className="login-page"
            ref={pageRef}
            onMouseMove={handleMouseMove}
        >
            {/* Animated background */}

            <div className="login-bg" aria-hidden="true">
                <span className="login-orb orb-1" />
                <span className="login-orb orb-2" />
                <span className="login-orb orb-3" />
                <span className="login-grid" />
                <span className="login-cursor-glow" />
            </div>

            {/* Logo */}

            <Link
                to="/"
                className="login-logo"
                aria-label="Dreamaz Ink home"
            >
                Dreamaz <span>Ink</span>
            </Link>

            {/* Brand panel */}

            <section className="login-brand">
                <span className="login-eyebrow">
                    Welcome back
                </span>

                <h1>
                    Art that
                    <span className="login-rotator">
                        <span
                            key={wordIndex}
                            className="login-rotator-word"
                        >
                            {ROTATING_WORDS[wordIndex]}
                        </span>
                    </span>
                </h1>

                <p className="login-lead">
                    Discover a world of creativity, inspiration and unique
                    artistic expression. Sign in to explore extraordinary
                    artworks and find pieces that tell your story.
                </p>

                <ul className="login-features">
                    {FEATURES.map((feature, index) => (
                        <li
                            key={feature.title}
                            style={{ "--i": index }}
                        >
                            <span className="login-feature-icon">
                                <Icon
                                    name={feature.icon}
                                    size={20}
                                />
                            </span>

                            <div>
                                <strong>{feature.title}</strong>
                                <span>{feature.text}</span>
                            </div>
                        </li>
                    ))}
                </ul>

                <div
                    className="login-canvases"
                    aria-hidden="true"
                >
                    <span className="canvas canvas-a" />
                    <span className="canvas canvas-b" />
                    <span className="canvas canvas-c" />
                </div>
            </section>

            {/* Login card */}

            <section
                className={`login-card ${shake ? "shake" : ""}`}
            >
                {success ? (
                    <div className="login-success" role="status">
                        <div className="login-check">
                            <svg
                                viewBox="0 0 52 52"
                                aria-hidden="true"
                            >
                                <circle cx="26" cy="26" r="24" />
                                <path d="M15 27l8 8 14-16" />
                            </svg>
                        </div>

                        <h2>You are in!</h2>

                        <p>
                            Taking you to your dashboard...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="login-card-head">
                            <h2>Sign in</h2>

                            <p>
                                Enter your details to continue.
                            </p>
                        </div>

                        {/* Email */}

                        <div
                            className={`login-field ${
                                touched.email && errors.email
                                    ? "has-error"
                                    : ""
                            }`}
                            style={{ "--i": 0 }}
                        >
                            <label htmlFor="email">
                                Email address
                            </label>

                            <div className="login-input">
                                <Icon name="mail" />

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    onBlur={() =>
                                        setTouched((t) => ({
                                            ...t,
                                            email: true
                                        }))
                                    }
                                    aria-invalid={Boolean(
                                        touched.email && errors.email
                                    )}
                                />
                            </div>

                            {touched.email && errors.email && (
                                <span
                                    className="login-error"
                                    role="alert"
                                >
                                    <Icon name="alert" size={14} />
                                    {errors.email}
                                </span>
                            )}
                        </div>

                        {/* Password */}

                        <div
                            className={`login-field ${
                                touched.password && errors.password
                                    ? "has-error"
                                    : ""
                            }`}
                            style={{ "--i": 1 }}
                        >
                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="login-input">
                                <Icon name="lock" />

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    onKeyUp={handleKey}
                                    onKeyDown={handleKey}
                                    onBlur={() => {
                                        setCapsLock(false);

                                        setTouched((t) => ({
                                            ...t,
                                            password: true
                                        }));
                                    }}
                                    aria-invalid={Boolean(
                                        touched.password && errors.password
                                    )}
                                />

                                <button
                                    type="button"
                                    className="login-toggle"
                                    onClick={() =>
                                        setShowPassword((s) => !s)
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    <Icon
                                        name={
                                            showPassword
                                                ? "eyeOff"
                                                : "eye"
                                        }
                                    />
                                </button>
                            </div>

                            {touched.password && errors.password && (
                                <span
                                    className="login-error"
                                    role="alert"
                                >
                                    <Icon name="alert" size={14} />
                                    {errors.password}
                                </span>
                            )}

                            {capsLock && (
                                <span
                                    className="login-warning"
                                    role="status"
                                >
                                    <Icon name="alert" size={14} />
                                    Caps Lock is on
                                </span>
                            )}
                        </div>

                        {/* Normal login button */}

                        <button
                            type="submit"
                            className="login-submit"
                            style={{ "--i": 2 }}
                            disabled={loading || googleLoading}
                        >
                            {loading ? (
                                <Spinner text="Verifying..." />
                            ) : (
                                <>
                                    Sign In
                                    <Icon name="arrow" size={18} />
                                </>
                            )}
                        </button>

                        {/* Divider */}

                        <div className="login-divider">
                            <span>OR CONTINUE WITH</span>
                        </div>

                        {/* Google login */}

                        <div className="login-google">
                            {googleLoading ? (
                                <Spinner text="Connecting to Google..." />
                            ) : (
                                <GoogleLogin
    onSuccess={handleGoogleSuccess}
    onError={handleGoogleError}
    theme="outline"
    size="large"
    shape="rectangular"
    text="continue_with"
    width={320}
/>
                            )}
                        </div>

                        {/* Register link */}

                        <p className="login-switch">
                            Don't have an account?
                            <Link to="/register">
                                Create one
                            </Link>
                        </p>
                    </form>
                )}
            </section>
        </main>
    );
}

export default Login;
