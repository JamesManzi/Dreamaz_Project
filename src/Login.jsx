import { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import api from "./api";
import "./Login.css";
import { faEye,faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Spinner from "./Spinner";
function Login(){
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [message,setMessage]=useState("");
    const [messageType,setMessageType]=useState("");
    const [showPassword,setShowPassword]=useState(false);
    const [loading,setLoading]=useState(false);
    
    const navigate=useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
        setMessage("All Fields Required");
        setMessageType("error");
        return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
        const res = await api.post(
            "/login",
            {
                email,
                password
            }
        );

        if (res.data.success) {

            localStorage.setItem(
                "userId",
                res.data.user.id
            );

            localStorage.setItem(
                "token",
                res.data.token
            );

            // Stop loading
            setLoading(false);

            // Show success
            setMessage("Login Successfully");
            setMessageType("success");

            // Navigate after showing message
            setTimeout(() => {
                navigate("/admin-dashboard");
            }, 1500);

        } else {

            setLoading(false);

            setMessage(
                res.data.message || "Login Error"
            );

            setMessageType("error");
        }

    } catch (error) {

        console.log(
            "Login Error:",
            error.response?.data || error.message
        );

        setLoading(false);

        setMessage(
            error.response?.data?.message ||
            "Login Error"
        );

        setMessageType("error");
    }
};
    return(
        <>
        <div className="login-content">

    <div className="login-description">

        <h1>
            Dreamaz<span className="logo1">Ink</span>
        </h1>

        <h2>Manage. Create. Grow.</h2>

        <p>
            DreamazInk is a modern marketplace designed to connect
            customers with unique creative products while giving
            administrators powerful tools to manage the entire platform.
        </p>

        <div className="login-features">

            <div className="feature">
                <h3>Product Management</h3>
                <p>
                    Easily add, update, organize, and manage products
                    available on the marketplace.
                </p>
            </div>

            <div className="feature">
                <h3>Create Users</h3>
                <p>
                   Create User Admins to be able to help you
                   manage your platform efficiently.
                </p>
            </div>

            <div className="feature">
                <h3>Requests Management</h3>
                <p>
                    Keep track of requests and be able to resolve them
                </p>
            </div>

        </div>

        <div className="security-message">
            <strong> Secure Administrator Access</strong>
            <p>
                This page is restricted to authorized administrators.
            </p>
        </div>

    </div>

            <div className="login-container">
                <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            <div className="input-container">
            <label htmlFor="email">Email</label><br/>
            <input type="email" className="login" name="email"
            placeholder="Enter Email"  value={email}
            onChange={(e)=>setEmail(e.target.value)} required/><br/>
            <div className="password-inputs">
    <label htmlFor="password">Password</label>

    <div className="password-wrapper">
        <input
            type={showPassword ? "text" : "password"}
            className="login"
            name="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
        />

        <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
        >
            <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
            />
        </button>
    </div>
</div>
            </div>
            <div className="login-button">
                <button
    type="submit"
    className="btn"
    disabled={loading}
>
    {loading ? (
        <>
        <Spinner text="Verfying..."></Spinner>
        </>
    ):(
        "Login"
    )}
</button>

<div className="login-text">
        <p>Don't Have Account?
            <Link to="/register">Register</Link>
        </p>
        {message &&(
            <p className={messageType}>
                {message}
            </p>
        )}
        </div>
            </div>
        </form>
            </div>
        </div>
        </>
    )
}
export default Login;