import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "./api";
import Spinner from "./Spinner";
import { useMessage } from "./ShowMessage";

import "./Register.css";

/* =================================================================
   Icons
   ================================================================= */
const ICONS = {
    user: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
        </>
    ),
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
    alert: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6M12 16.5v.5" />
        </>
    ),
    check: <path d="M5 12l5 5 9-10" />,
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
   Static content + validation
   ================================================================= */
const BENEFITS = [
    "Explore a wide range of art materials",
    "Find quality products for your creative projects",
    "Save your favorite products for later",
    "Manage your orders easily",
    "Enjoy a simple and secure shopping experience"
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

const STRENGTH_LEVELS = [
    { label: "Too weak", className: "weak" },
    { label: "Weak", className: "weak" },
    { label: "Fair", className: "fair" },
    { label: "Good", className: "good" },
    { label: "Strong", className: "strong" }
];

const getStrength = (password) => {
    if (!password) return 0;

    let score = 0;
    if (password.length >= MIN_PASSWORD) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    return score;
};

/* =================================================================
   Page
   ================================================================= */
function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [shake, setShake] = useState(false);
    const [capsLock, setCapsLock] = useState(false);
    const [touched, setTouched] = useState({
        username: false,
        email: false,
        password: false,
        confirmPassword: false
    });

    const pageRef = useRef(null);
    const redirectTimer = useRef(null);

    const navigate = useNavigate();
    const { showSuccess, showError } = useMessage();

    /* ---------- Validation ---------- */
    const errors = {
        username: !username.trim()
            ? "Username is required"
            : username.trim().length < 3
            ? "Username must be at least 3 characters"
            : "",
        email: !email
            ? "Email is required"
            : !EMAIL_PATTERN.test(email)
            ? "Enter a valid email address"
            : "",
        password: !password
            ? "Password is required"
            : password.length < MIN_PASSWORD
            ? `Password must be at least ${MIN_PASSWORD} characters`
            : "",
        confirmPassword: !confirmPassword
            ? "Please confirm your password"
            : confirmPassword !== password
            ? "Passwords do not match"
            : ""
    };

    const isValid = Object.values(errors).every((error) => !error);
    const strength = getStrength(password);
    const strengthInfo = STRENGTH_LEVELS[strength];

    const touch = (field) => setTouched((t) => ({ ...t, [field]: true }));
    const showError_ = (field) => touched[field] && errors[field];

    /* ---------- Cursor glow ---------- */
    const handleMouseMove = (e) => {
        const el = pageRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    };

    useEffect(() => () => clearTimeout(redirectTimer.current), []);

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleKey = (e) => {
        setCapsLock(e.getModifierState && e.getModifierState("CapsLock"));
    };

    /* ---------- Submit ---------- */
    const handleSubmit = async (e) => {
        e.preventDefault();

        setTouched({
            username: true,
            email: true,
            password: true,
            confirmPassword: true
        });

        if (!isValid) {
            triggerShake();
            showError(
                errors.username ||
                    errors.email ||
                    errors.password ||
                    errors.confirmPassword
            );
            return;
        }

        setLoading(true);

        try {
            const res = await api.post("/register", {
                username: username.trim(),
                email: email.trim(),
                password
            });

            if (res.data.success) {
                setSuccess(true);
                showSuccess("Registration Successful.");

                redirectTimer.current = setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                showError(res.data.message || "Registration failed.");
                triggerShake();
            }
        } catch (error) {
            console.log("Registration Error:", error);
            console.log("Status:", error.response?.status);
            console.log("Backend response:", error.response?.data);

            showError(
                error.response?.data?.message ||
                    "An error occurred during registration."
            );
            triggerShake();
        } finally {
            setLoading(false);
        }
    };

    return (
        <main
            className="register-page"
            ref={pageRef}
            onMouseMove={handleMouseMove}
        >
            {/* Animated background */}
            <div className="register-bg" aria-hidden="true">
                <span className="register-orb orb-1" />
                <span className="register-orb orb-2" />
                <span className="register-orb orb-3" />
                <span className="register-grid" />
                <span className="register-cursor-glow" />
            </div>

            {/* Logo */}
            <Link to="/" className="register-logo" aria-label="Dreamaz Ink home">
                Dreamaz <span>Ink</span>
            </Link>

            {/* ---------- Brand panel ---------- */}
            <section className="register-brand">
                <span className="register-eyebrow">Join the community</span>

                <h1>
                    Welcome to
                    <span className="register-gradient-text"> Dreamaz Ink</span>
                </h1>

                <p className="register-lead">
                    Discover a world of creativity with quality art materials
                    made for artists, students and creative minds. Create your
                    account and enjoy a simple and inspiring shopping
                    experience.
                </p>

                <ul className="register-benefits">
                    {BENEFITS.map((benefit, index) => (
                        <li key={benefit} style={{ "--i": index }}>
                            <span className="register-benefit-icon">
                                <Icon name="check" size={14} />
                            </span>
                            {benefit}
                        </li>
                    ))}
                </ul>

                <p className="register-tagline">
                    Create your account today and start bringing your ideas to
                    life.
                </p>

                <div className="register-canvases" aria-hidden="true">
                    <span className="canvas canvas-a" />
                    <span className="canvas canvas-b" />
                    <span className="canvas canvas-c" />
                </div>
            </section>

            {/* ---------- Register card ---------- */}
            <section className={`register-card ${shake ? "shake" : ""}`}>
                {success ? (
                    <div className="register-success" role="status">
                        <div className="register-check">
                            <svg viewBox="0 0 52 52" aria-hidden="true">
                                <circle cx="26" cy="26" r="24" />
                                <path d="M15 27l8 8 14-16" />
                            </svg>
                        </div>
                        <h2>Account created!</h2>
                        <p>Taking you to the login page...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="register-card-head">
                            <h2>Create account</h2>
                            <p>It only takes a minute.</p>
                        </div>

                        {/* Username */}
                        <div
                            className={`register-field ${
                                showError_("username") ? "has-error" : ""
                            }`}
                            style={{ "--i": 0 }}
                        >
                            <label htmlFor="username">Username</label>
                            <div className="register-input">
                                <Icon name="user" />
                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    placeholder="Choose a username"
                                    autoComplete="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onBlur={() => touch("username")}
                                    aria-invalid={Boolean(showError_("username"))}
                                />
                            </div>
                            {showError_("username") && (
                                <span className="register-error" role="alert">
                                    <Icon name="alert" size={14} />
                                    {errors.username}
                                </span>
                            )}
                        </div>

                        {/* Email */}
                        <div
                            className={`register-field ${
                                showError_("email") ? "has-error" : ""
                            }`}
                            style={{ "--i": 1 }}
                        >
                            <label htmlFor="email">Email address</label>
                            <div className="register-input">
                                <Icon name="mail" />
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={() => touch("email")}
                                    aria-invalid={Boolean(showError_("email"))}
                                />
                            </div>
                            {showError_("email") && (
                                <span className="register-error" role="alert">
                                    <Icon name="alert" size={14} />
                                    {errors.email}
                                </span>
                            )}
                        </div>

                        {/* Password */}
                        <div
                            className={`register-field ${
                                showError_("password") ? "has-error" : ""
                            }`}
                            style={{ "--i": 2 }}
                        >
                            <label htmlFor="password">Password</label>
                            <div className="register-input">
                                <Icon name="lock" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder={`At least ${MIN_PASSWORD} characters`}
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyUp={handleKey}
                                    onKeyDown={handleKey}
                                    onBlur={() => {
                                        setCapsLock(false);
                                        touch("password");
                                    }}
                                    aria-invalid={Boolean(showError_("password"))}
                                />
                                <button
                                    type="button"
                                    className="register-toggle"
                                    onClick={() => setShowPassword((s) => !s)}
                                    aria-label={
                                        showPassword ? "Hide password" : "Show password"
                                    }
                                >
                                    <Icon name={showPassword ? "eyeOff" : "eye"} />
                                </button>
                            </div>

                            {/* Strength meter */}
                            {password && (
                                <div
                                    className={`register-strength ${strengthInfo.className}`}
                                    aria-live="polite"
                                >
                                    <div className="register-strength-bars">
                                        {[1, 2, 3, 4].map((level) => (
                                            <span
                                                key={level}
                                                className={level <= strength ? "on" : ""}
                                            />
                                        ))}
                                    </div>
                                    <small>{strengthInfo.label}</small>
                                </div>
                            )}

                            {showError_("password") && (
                                <span className="register-error" role="alert">
                                    <Icon name="alert" size={14} />
                                    {errors.password}
                                </span>
                            )}

                            {capsLock && (
                                <span className="register-warning" role="status">
                                    <Icon name="alert" size={14} />
                                    Caps Lock is on
                                </span>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div
                            className={`register-field ${
                                showError_("confirmPassword") ? "has-error" : ""
                            }`}
                            style={{ "--i": 3 }}
                        >
                            <label htmlFor="confirmPassword">Confirm password</label>
                            <div className="register-input">
                                <Icon name="lock" />
                                <input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Re-enter your password"
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onBlur={() => touch("confirmPassword")}
                                    aria-invalid={Boolean(showError_("confirmPassword"))}
                                />
                            </div>
                            {showError_("confirmPassword") && (
                                <span className="register-error" role="alert">
                                    <Icon name="alert" size={14} />
                                    {errors.confirmPassword}
                                </span>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="register-submit"
                            style={{ "--i": 4 }}
                            disabled={loading}
                        >
                            {loading ? (
                                <Spinner text="Creating account..." />
                            ) : (
                                <>
                                    Create Account
                                    <Icon name="arrow" size={18} />
                                </>
                            )}
                        </button>

                        <p className="register-switch">
                            Already have an account?
                            <Link to="/login">Sign in</Link>
                        </p>
                    </form>
                )}
            </section>
        </main>
    );
}

export default Register;