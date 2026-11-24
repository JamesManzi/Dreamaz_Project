
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
    return (
        <footer className="isonga-footer">

            <div className="isonga-footer-container">

                {/* BRAND */}
                <div className="isonga-footer-brand">
                    <h2>
                        Dreamaz<span>Ink</span>
                    </h2>

                    <p>
                        Discover Trending Products<br />
                        All in One Marketplace
                    </p>
                </div>

                {/* QUICK LINKS */}
                <div className="isonga-footer-links">
                    <h3>Explore</h3>
                    <Link to="/">Home</Link>
                    <Link to="/fashion">Fashion</Link>
                    <Link to="/accessories">Accessories</Link>
                    <Link to="/prints">Prints</Link>
                </div>

                {/* MARKETPLACE */}
                <div className="isonga-footer-links">
                    <h3>Marketplace</h3>
                    <Link to="/login">Buyer Account</Link>
                </div>

                {/* INFORMATION */}
                <div className="isonga-footer-links">
                    <h3>Information</h3>
                    <Link to="/about">About Us</Link>
                    <Link to="/privacy">Privacy Policy</Link>
                </div>

            </div>

            <div className="isonga-footer-bottom">
                <p>
                    © {new Date().getFullYear()} Dreamaz Ink.
                    All rights reserved.
                </p>

                <p>
                    Discover Art That Tells a Story.
                </p>
            </div>

        </footer>
    );
}

export default Footer;
