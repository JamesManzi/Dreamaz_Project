
import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Fashion", path: "/fashion" },
        { name: "Accessories", path: "/accessories" },
        { name: "Prints", path: "/prints" },
        { name: "About", path: "/about" }
    ];

    return (
        <header className="menu-navbar">

            {/* Logo */}
            <div className="menu-logo">
                <NavLink to="/" onClick={closeMenu}>
                    <h1>
                        JACK<span className="logo1">$ON</span>
                    </h1>
                    <span className="logo-tagline">STYLE YOUR IDENTITY</span>
                </NavLink>
            </div>

            {/* Desktop and Mobile Navigation */}
            <nav className={`menu-navbar-links ${menuOpen ? "active" : ""}`}>
                <ul>
                    {navLinks.map((link) => (
                        <li key={link.path}>
                            <NavLink
                                to={link.path}
                                end={link.path === "/"}
                                onClick={closeMenu}
                                className={({ isActive }) =>
                                    isActive ? "nav-active" : ""
                                }
                            >
                                {link.name}
                            </NavLink>
                        </li>
                    ))}

                    <li className="mobile-login">
                        <NavLink to="/login" onClick={closeMenu}>
                            Login
                        </NavLink>
                    </li>
                </ul>
            </nav>

            {/* Right Actions */}
            <div className="navbar-actions">
                <NavLink to="/login" className="navbar-login">
                    Login <span>↗</span>
                </NavLink>
            </div>

            {/* Mobile Menu Button */}
            <button
                className={`menu-toggle ${menuOpen ? "open" : ""}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
                type="button"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

        </header>
    );
}

export default Navbar;
