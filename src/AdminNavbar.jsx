
import { NavLink, useNavigate } from "react-router-dom";
import "./AdminNavbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faGaugeHigh,
    faBoxOpen,
    faPlus,
    faLayerGroup,
    faUsersGear,
    faGear,
    faRightFromBracket,
    faCartShopping,
    faChartLine,
    faEnvelope,
    faChevronRight
} from "@fortawesome/free-solid-svg-icons";

function AdminNavbar() {

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
    };

    const navigationGroups = [
        {
            title: "OVERVIEW",
            links: [
                {
                    name: "Dashboard",
                    path: "/admin-dashboard",
                    icon: faGaugeHigh
                }
            ]
        },
        {
            title: "STORE MANAGEMENT",
            links: [
                {
                    name: "Create Product",
                    path: "/create-product",
                    icon: faPlus
                },
                {
                    name: "Manage Products",
                    path: "/manage-products",
                    icon: faBoxOpen
                },
                {
                    name: "Create Trending",
                    path: "/createTrending",
                    icon: faChartLine
                },
                {
                    name: "Manage Trendings",
                    path: "/manage-trendings",
                    icon: faLayerGroup
                },
                {
                    name: "Manage Orders",
                    path: "/manageOrders",
                    icon: faCartShopping
                }
            ]
        },
        {
            title: "USER MANAGEMENT",
            links: [
                {
                    name: "Create User",
                    path: "/create-users",
                    icon: faPlus
                },
                {
                    name: "Manage Users",
                    path: "/manage-users",
                    icon: faUsersGear
                }
            ]
        },
        {
            title: "PREFERENCES",
            links: [
                {
                    name: "Settings",
                    path: "/Setting",
                    icon: faGear
                }
            ]
        }
    ];

    return (
        <aside className="admin-navbar">

            {/* BRAND */}
            <div className="adminlogo">

                <div className="admin-brand-icon">
                    D
                </div>

                <div className="admin-brand-text">
                    <h1>
                        Dreamaz <span className="logo1">ink</span>
                    </h1>

                    <p>ADMINISTRATION</p>
                </div>

            </div>


            {/* ADMIN PROFILE LABEL */}
            <div className="admin-sidebar-label">
                <span className="admin-online-indicator"></span>
                <span>Admin Workspace</span>
            </div>


            {/* SCROLLABLE NAVIGATION */}
            <nav className="admin-navlinks">

                {navigationGroups.map((group, index) => (

                    <div className="admin-nav-group" key={index}>

                        <p className="admin-nav-title">
                            {group.title}
                        </p>

                        <ul>
                            {group.links.map((link) => (

                                <li key={link.path}>

                                    <NavLink
                                        to={link.path}
                                        className={({ isActive }) =>
                                            isActive ? "active" : ""
                                        }
                                    >

                                        <FontAwesomeIcon
                                            icon={link.icon}
                                            className="admin-nav-icon"
                                        />

                                        <span>{link.name}</span>

                                        <FontAwesomeIcon
                                            icon={faChevronRight}
                                            className="admin-nav-arrow"
                                        />

                                    </NavLink>

                                </li>

                            ))}
                        </ul>

                    </div>

                ))}

            </nav>


            {/* BOTTOM LOGOUT */}
            <div className="admin-sidebar-bottom">

                <button
                    className="admin-logout"
                    onClick={handleLogout}
                >

                    <FontAwesomeIcon icon={faRightFromBracket} />

                    <span>Logout</span>

                </button>

                <div className="admin-sidebar-footer">
                    <p>Dreamaz Ink</p>
                    <span>Administration Panel</span>
                </div>

            </div>

        </aside>
    );
}

export default AdminNavbar;
