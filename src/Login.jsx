
import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
    Eye,
    EyeOff,
    Mail,
    LockKeyhole,
    ArrowRight,
    ArrowLeft,
    Check,
    Palette,
    Frame,
    ShoppingBag,
    ShieldCheck
} from "lucide-react";

import api from "./api";
import Spinner from "./Spinner";
import { useMessage } from "./ShowMessage";

import "./Login.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REMEMBER_KEY = "rememberedEmail";

function Login() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useMessage();

    const redirectTimer = useRef(null);

    const [email, setEmail] = useState(
        () => localStorage.getItem(REMEMBER_KEY) || ""
    );

    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(
        () => Boolean(localStorage.getItem(REMEMBER_KEY))
    );

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [capsLock, setCapsLock] = useState(false);

    const [touched, setTouched] = useState({
        email: false,
        password: false
    });

    useEffect(() => {
        return () => clearTimeout(redirectTimer.current);
    }, []);

    const errors = {
        email: !email.trim()
            ? "Email is required"
            : !EMAIL_PATTERN.test(email.trim())
                ? "Enter a valid email address"
                : "",

        password: !password
            ? "Password is required"
            : ""
    };

    const isValid = !errors.email && !errors.password;

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        setTouched({
            email: true,
            password: true
        });

        if (!isValid) {
            showError(
                errors.email || errors.password ||
                "Please complete all fields."
            );
            return;
        }

        setLoading(true);

        try {
            const cleanEmail = email.trim().toLowerCase();

            const res = await api.post("/login", {
                email: cleanEmail,
                password
            });

            if (res.data.success) {
                if (remember) {
                    localStorage.setItem(REMEMBER_KEY, cleanEmail);
                } else {
                    localStorage.removeItem(REMEMBER_KEY);
                }

                authenticateUser(res.data.user, res.data.token);
                showSuccess("Login successful!");
            } else {
                showError(res.data.message || "Login failed.");
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
        } finally {
            setLoading(false);
        }
    };

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

            if (!res.data.success) {
                showError(
                    res.data.message || "Google login failed."
                );
                return;
            }

            authenticateUser(res.data.user, res.data.token);
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
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleGoogleError = () => {
        showError("Google sign-in was unsuccessful.");
    };

    const handleKey = (e) => {
        setCapsLock(e.getModifierState("CapsLock"));
    };

    return (
        <main className="login-page">

            <header className="login-topbar">
                <Link to="/" className="login-logo">
                    <img src="/logo.svg" alt="Dreamaz Ink" />
                </Link>

                <Link to="/" className="login-home">
                    <ArrowLeft size={16} />
                    Back to home
                </Link>
            </header>

            <div className="login-shell">

                <section className="login-brand">

                    <span className="login-eyebrow">
                        <span className="login-eyebrow-dot" />
                        Welcome back
                    </span>

                    <h1>Art that tells a story</h1>

                    <p className="login-lead">
                        Discover a world of creativity, inspiration and
                        unique artistic expression. Sign in to explore
                        extraordinary artworks and find pieces that
                        tell your story.
                    </p>

                    <ul className="login-features">

                        <li>
                            <div className="login-feature-icon">
                                <Palette size={21} />
                            </div>
                            <div>
                                <strong>Discover original artworks</strong>
                                <span>Browse unique pieces across many styles.</span>
                            </div>
                        </li>

                        <li>
                            <div className="login-feature-icon">
                                <Frame size={21} />
                            </div>
                            <div>
                                <strong>Find art that fits your space</strong>
                                <span>Explore artworks that match your taste.</span>
                            </div>
                        </li>

                        <li>
                            <div className="login-feature-icon">
                                <ShoppingBag size={21} />
                            </div>
                            <div>
                                <strong>Shop with confidence</strong>
                                <span>Keep your cart and follow your orders.</span>
                            </div>
                        </li>

                    </ul>

                </section>

                <section className="login-panel">

                    <div className="login-card">

                        {success ? (

                            <div className="login-success" role="status">
                                <div className="login-check">
                                    <Check size={28} />
                                </div>

                                <h2>You are in!</h2>
                                <p>Taking you to your dashboard...</p>
                            </div>

                        ) : (

                            <form onSubmit={handleSubmit} noValidate>

                                <div className="login-card-head">
                                    <h2>Sign in</h2>
                                    <p>Enter your details to continue.</p>
                                </div>

                                <div className={`login-field ${
                                    touched.email && errors.email
                                        ? "has-error"
                                        : ""
                                }`}>

                                    <div className="login-label-row">
                                        <label htmlFor="email">
                                            Email address
                                        </label>
                                    </div>

                                    <div className="login-input">
                                        <Mail size={19} />

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
                                                setTouched((prev) => ({
                                                    ...prev,
                                                    email: true
                                                }))
                                            }
                                            aria-invalid={Boolean(
                                                touched.email && errors.email
                                            )}
                                        />
                                    </div>

                                    {touched.email && errors.email && (
                                        <span className="login-error" role="alert">
                                            {errors.email}
                                        </span>
                                    )}

                                </div>

                                <div className={`login-field ${
                                    touched.password && errors.password
                                        ? "has-error"
                                        : ""
                                }`}>

                                    <div className="login-label-row">
                                        <label htmlFor="password">
                                            Password
                                        </label>

                                        <Link
                                            to="/forgot-password"
                                            className="login-forgot"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>

                                    <div className="login-input">
                                        <LockKeyhole size={19} />

                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
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

                                                setTouched((prev) => ({
                                                    ...prev,
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
                                                setShowPassword((prev) => !prev)
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

                                    {touched.password && errors.password && (
                                        <span className="login-error" role="alert">
                                            {errors.password}
                                        </span>
                                    )}

                                    {capsLock && (
                                        <span className="login-warning" role="status">
                                            Caps Lock is on
                                        </span>
                                    )}

                                </div>

                                <label className="login-remember">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) =>
                                            setRemember(e.target.checked)
                                        }
                                    />
                                    Remember my email
                                </label>

                                <button
                                    type="submit"
                                    className="login-submit"
                                    disabled={loading || googleLoading}
                                >
                                    {loading ? (
                                        <Spinner text="Verifying..." />
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight size={19} />
                                        </>
                                    )}
                                </button>

                                <div className="login-divider">
                                    <span>OR CONTINUE WITH</span>
                                </div>

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

                                <p className="login-switch">
                                    Don't have an account?
                                    <Link to="/register">Create one</Link>
                                </p>

                                <p className="login-legal">
                                    <ShieldCheck size={15} />
                                    By signing in you agree to our{" "}
                                    <Link to="/privacy">
                                        Privacy Policy
                                    </Link>.
                                </p>

                            </form>
                        )}

                    </div>

                </section>

            </div>

        </main>
    );
}

export default Login;
