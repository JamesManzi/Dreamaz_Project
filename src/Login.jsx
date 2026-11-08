import { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import api from "./api";
import "./Login.css";
import { faEye,faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Spinner from "./Spinner";
import { useMessage } from "./ShowMessage";
function Login(){
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [showPassword,setShowPassword]=useState(false);
    const [loading,setLoading]=useState(false);
    const {showSuccess,showError}=useMessage();

    const navigate=useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
        showError("All Fields Required");
        return;
    }

    setLoading(true);

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
            showSuccess("Login Successfully");

            // Navigate after showing message
            setTimeout(() => {
                if(res.data.user.role==="admin"){
                    navigate("/admin-dashboard");
                }else{
                    navigate("/dashboard");
                }
            }, 1500);

        } else {
            showError(res.data?.message);
            setLoading(false);
        }

    } catch (error) {

        console.log(
            "Login Error:",
            error.response?.data || error.message
        );
        showError("Login Error Try Again");

        setLoading(false);
    }
};
    return(
        <>
        <div className="login-content">
            <div className="comapany_logo">
                <h2>Dreamaz <span className="logo-accent">Ink</span></h2>
            </div>
        <div className="login-description">
    <h1>Welcome to Dreamaz Ink</h1>

    <h2>Where Creativity Comes to Life.</h2>

    <p>
        Discover a world of creativity, inspiration, and unique
        artistic expressions. Explore extraordinary artworks,
        connect with creativity, and find pieces that tell your story.
    </p>

    <h3>Art That Tells a Story.</h3>

    <span>
        Discover it. Experience it. Make it yours.
    </span>

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
        
        </div>
            </div>
        </form>
            </div>
            </div>
        </>
    )
}
export default Login;