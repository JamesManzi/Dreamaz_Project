
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
    UserRound,
    Mail,
    LockKeyhole,
    Eye,
    EyeOff,
    CircleAlert,
    Check,
    ArrowRight,
    Palette,
    Frame,
    ShoppingBag,
    ShieldCheck
} from "lucide-react";

import api from "./api";
import Spinner from "./Spinner";
import { useMessage } from "./ShowMessage";

import "./Register.css";

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

    if (password.length >= MIN_PASSWORD) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
};

function Register() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useMessage();

    const redirectTimer = useRef(null);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [capsLock, setCapsLock] = useState(false);

    const [touched, setTouched] = useState({
        username: false,
        email: false,
        password: false,
        confirmPassword: false
    });

    useEffect(() => {
        return () => clearTimeout(redirectTimer.current);
    }, []);

    // Form validation
    const errors = {
        username: !username.trim()
            ? "Username is required"
            : username.trim().length < 3
                ? "Username must be at least 3 characters"
                : "",

        email: !email.trim()
            ? "Email is required"
            : !EMAIL_PATTERN.test(email.trim())
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

    const touch = (field) => {
        setTouched((previous) => ({
            ...previous,
            [field]: true
        }));
    };

    const showFieldError = (field) => {
        return touched[field] && errors[field];
    };

    const handleKey = (e) => {
        setCapsLock(e.getModifierState("CapsLock"));
    };

    // Normal registration
    const handleSubmit = async (e) => {
        e.preventDefault();

        setTouched({
            username: true,
            email: true,
            password: true,
            confirmPassword: true
        });

        if (!isValid) {
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
                email: email.trim().toLowerCase(),
                password
            });

            if (res.data.success) {
                setSuccess(true);
                showSuccess("Registration successful!");

                redirectTimer.current = setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                showError(res.data.message || "Registration failed.");
            }

        } catch (error) {
            console.log(
                "Registration Error:",
                error.response?.data || error.message
            );

            showError(
                error.response?.data?.message ||
                "An error occurred during registration."
            );
        } finally {
            setLoading(false);
        }
    };

    // Google registration
    const handleGoogleSuccess = async (credentialResponse) => {
        if (!credentialResponse?.credential) {
            showError("Google did not return a valid credential.");
            return;
        }

        setGoogleLoading(true);

        try {
            const res = await api.post("/google-register", {
                credential: credentialResponse.credential
            });

            if (res.data.success) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("userId", res.data.user.id);

                showSuccess("Google registration successful!");

                navigate(
                    res.data.user.role === "admin"
                        ? "/admin-dashboard"
                        : "/dashboard"
                );
            } else {
                showError(
                    res.data.message || "Google registration failed."
                );
            }

        } catch (error) {
            console.log(
                "Google Registration Error:",
                error.response?.data || error.message
            );

            showError(
                error.response?.data?.message ||
                "Unable to register with Google."
            );
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleGoogleError = () => {
        showError("Google sign-in was unsuccessful. Please try again.");
    };

    return (
        <main className="register-page">

            {/* Navigation */}
            <header className="register-topbar">

                <Link to="/" className="register-logo">
                    <img src="/logo.svg" alt="Dreamaz Ink" />
                </Link>

                <Link to="/" className="register-home">
                    <ArrowRight size={16} />
                    Back to home
                </Link>

            </header>

            <div className="register-shell">

                {/* Brand section */}
                <section className="register-brand">

                    <span className="register-eyebrow">
                        <span className="register-eyebrow-dot" />
                        Join the community
                    </span>

                    <h1>
                        Create something
                        <span> extraordinary.</span>
                    </h1>

                    <p className="register-lead">
                        Discover a world of creativity with quality art
                        materials made for artists, students and creative
                        minds. Create your account and bring your ideas to life.
                    </p>

                    <ul className="register-benefits">

                        <li>
                            <div className="register-benefit-icon">
                                <Palette size={21} />
                            </div>

                            <div>
                                <strong>Explore creative materials</strong>
                                <span>Discover products for your artistic projects.</span>
                            </div>
                        </li>

                        <li>
                            <div className="register-benefit-icon">
                                <Frame size={21} />
                            </div>

                            <div>
                                <strong>Find quality products</strong>
                                <span>Choose materials that inspire creativity.</span>
                            </div>
                        </li>

                        <li>
                            <div className="register-benefit-icon">
                                <ShoppingBag size={21} />
                            </div>

                            <div>
                                <strong>Manage your orders</strong>
                                <span>Keep track of your shopping in one place.</span>
                            </div>
                        </li>

                    </ul>

                    <p className="register-tagline">
                        Art that tells a story.
                    </p>

                </section>

                {/* Registration form */}
                <section className="register-panel">

                    <div className="register-card">

                        {success ? (

                            <div className="register-success" role="status">

                                <div className="register-check">
                                    <Check size={28} />
                                </div>

                                <h2>Account created!</h2>

                                <p>
                                    Taking you to the login page...
                                </p>

                            </div>

                        ) : (

                            <form onSubmit={handleSubmit} noValidate>

                                <div className="register-card-head">
                                    <h2>Create account</h2>
                                    <p>Enter your details to get started.</p>
                                </div>

                                {/* Username */}
                                <div className={`register-field ${
                                    showFieldError("username") ? "has-error" : ""
                                }`}>

                                    <label htmlFor="username">
                                        Username
                                    </label>

                                    <div className="register-input">
                                        <UserRound size={19} />

                                        <input
                                            id="username"
                                            type="text"
                                            placeholder="Choose a username"
                                            autoComplete="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            onBlur={() => touch("username")}
                                        />
                                    </div>

                                    {showFieldError("username") && (
                                        <span className="register-error">
                                            <CircleAlert size={14} />
                                            {errors.username}
                                        </span>
                                    )}

                                </div>

                                {/* Email */}
                                <div className={`register-field ${
                                    showFieldError("email") ? "has-error" : ""
                                }`}>

                                    <label htmlFor="email">
                                        Email address
                                    </label>

                                    <div className="register-input">
                                        <Mail size={19} />

                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onBlur={() => touch("email")}
                                        />
                                    </div>

                                    {showFieldError("email") && (
                                        <span className="register-error">
                                            <CircleAlert size={14} />
                                            {errors.email}
                                        </span>
                                    )}

                                </div>

                                {/* Password */}
                                <div className={`register-field ${
                                    showFieldError("password") ? "has-error" : ""
                                }`}>

                                    <label htmlFor="password">
                                        Password
                                    </label>

                                    <div className="register-input">
                                        <LockKeyhole size={19} />

                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
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
                                        />

                                        <button
                                            type="button"
                                            className="register-toggle"
                                            onClick={() =>
                                                setShowPassword((previous) => !previous)
                                            }
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                        >
                                            {showPassword
                                                ? <EyeOff size={19} />
                                                : <Eye size={19} />
                                            }
                                        </button>
                                    </div>

                                    {password && (
                                        <div className={`register-strength ${strengthInfo.className}`}>
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

                                    {showFieldError("password") && (
                                        <span className="register-error">
                                            <CircleAlert size={14} />
                                            {errors.password}
                                        </span>
                                    )}

                                    {capsLock && (
                                        <span className="register-warning">
                                            <CircleAlert size={14} />
                                            Caps Lock is on
                                        </span>
                                    )}

                                </div>

                                {/* Confirm password */}
                                <div className={`register-field ${
                                    showFieldError("confirmPassword") ? "has-error" : ""
                                }`}>

                                    <label htmlFor="confirmPassword">
                                        Confirm password
                                    </label>

                                    <div className="register-input">
                                        <LockKeyhole size={19} />

                                        <input
                                            id="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Re-enter your password"
                                            autoComplete="new-password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            onBlur={() => touch("confirmPassword")}
                                        />
                                    </div>

                                    {showFieldError("confirmPassword") && (
                                        <span className="register-error">
                                            <CircleAlert size={14} />
                                            {errors.confirmPassword}
                                        </span>
                                    )}

                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className="register-submit"
                                    disabled={loading || googleLoading}
                                >
                                    {loading ? (
                                        <Spinner text="Creating account..." />
                                    ) : (
                                        <>
                                            Create Account
                                            <ArrowRight size={19} />
                                        </>
                                    )}
                                </button>

                                {/* Divider */}
                                <div className="register-divider">
                                    <span>OR CONTINUE WITH</span>
                                </div>

                                {/* Google */}
                                <div className="register-google">
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

                                {/* Login link */}
                                <p className="register-switch">
                                    Already have an account?
                                    <Link to="/login">Sign in</Link>
                                </p>

                                <p className="register-legal">
                                    <ShieldCheck size={15} />
                                    Your information is protected.
                                </p>

                            </form>
                        )}

                    </div>

                </section>

            </div>

        </main>
    );
}

export default Register;
