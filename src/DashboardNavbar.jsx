import "./Navbar.css";
import { Link,useNavigate } from "react-router-dom";
function DashboardNavbar(){
    const navigate=useNavigate();
    const token=localStorage.getItem("token");
    const logout=()=>{
        localStorage.removeItem("token");
        navigate("/login");
    }
    return(
        <>
        <div className="menu-navbar">
            <div className="menu-logo">
                <h1>JACK<span className="logo1">$ON</span></h1>
            </div>
            <div className="menu-navbar-links">
                <ul>
                        <li><Link to="/fashion">Fashion</Link></li>
                        <li><Link to="/accessories">Accessories</Link></li>
                        <li><Link to="/prints">Prints</Link></li>
                        <li><Link to="/about">About</Link></li>
                        <li><Link to="/dashboard"></Link></li>
                        <li>
                            <button className="logout-btn" onClick={logout}>Logout</button>
                        </li>
                    </ul>
            </div>
        </div>
        </>
    )
}

export default DashboardNavbar;