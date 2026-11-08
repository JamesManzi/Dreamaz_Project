import {useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import "./Register.css";
import api from "./api";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye,faEyeSlash} from "@fortawesome/free-regular-svg-icons";
import { useMessage } from "./ShowMessage";
function Register(){
    const  [username,setUsername]=useState("");
    const navigate=useNavigate();
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [loading,setLoading]=useState(false);
    const [showPassword,setShowPassword]=useState(false);

    const {showSuccess,showError}=useMessage();

    const handleSubmit=async(e)=>{
        e.preventDefault();
        if(!username ||! email || !password){
           showError("Please All Fields required");
            return;
        }
        setLoading(true)
        try{
            const res=await api.post(
                "/register",{
                    username,
                    email,
                    password
                }
            );
            if(res.data.success){
                showSuccess("Registration Successful.");
                // Navigate to login page after successful registration
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else{
                showError(res.data.message);
            }
        }catch(error){
    console.log("Registration Error:", error);
    console.log("Status:", error.response?.status);
    console.log("Backend response:", error.response?.data);
    showError("An error occurred during registration.");
} finally{
            setLoading(false);
        }
    }
    return(
        <>
        <div className="register-page">
                <div className="comapany_logo">
                <h2>Dreamaz <span className="logo-accent">Ink</span></h2>
            
            </div>
            <div className="register-text">
  <div className="welcome-text">
    <h2>Welcome To Dreamaz Ink</h2>

    <p>
      Discover a world of creativity with quality art materials made for
      artists, students, and creative minds. Create your account and enjoy
      a simple and inspiring shopping experience.
    </p>

    <ul className="register-features">
      <li>Explore a wide range of art materials</li>
      <li>Find quality products for your creative projects</li>
      <li>Save your favorite products for later</li>
      <li>Manage your orders easily</li>
      <li>Enjoy a simple and secure shopping experience</li>
    </ul>

    <p className="register-bottom-text">
      Create your account today and start bringing your ideas to life.
    </p>
  </div>
</div>
            <div className="register-container">
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="username">Username</label><br/>
                    <input type="text" name="username" id="username" value={username}
                   onChange={(e)=>setUsername(e.target.value)} placeholder="Enter Username" required/><br/>
                    <label htmlFor="email">Email</label><br/>
                    <input type="email" name="email" id="email" value={email}
                    onChange={(e)=>setEmail(e.target.value)} placeholder="Enter Email" required/><br/>
                    <label htmlFor="password">Password</label><br/>
                    <input type={showPassword ? "text" : "password"} name="password" id="password" value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                     placeholder="Enter Password" required/><br/>
                     <div className="show-password">
                        <button type="button" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
                        </button>
                    </div>
                    <button type="submit" className="register-btn" disabled={loading}>
                        {loading ? "Registering..." : "Register"}
                    </button>
                    <div className="register-text">
                        <p>Already Have Account?
                            <Link to="/login">Login</Link>
                        </p>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Register;