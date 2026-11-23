import "./Navbar.css";
import { Link } from "react-router-dom";
function Navbar(){
    return(
        <>
        <div className="menu-navbar">
            <div className="menu-logo">
                <h1>JACK<span className="logo1">$ON</span></h1>
            </div>
            <div className="menu-navbar-links">
                <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/fashion">Fashion</Link></li>
                        <li><Link to="/accessories">Accessories</Link></li>
                        <li><Link to="/prints">Prints</Link></li>
                        <li><Link to="/about">About</Link></li>
                        <li><Link to="/login">Login</Link></li>
                    </ul>
            </div>
        </div>
        </>
    )
}

export default Navbar;