import {NavLink,useNavigate } from "react-router-dom";
import { useState } from "react";
import "./AdminNavbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGauge,
    faBoxOpen,
    faPlus,
    faEnvelope,
    faLayerGroup,
    faUsersGear,
    faGear,
    faRightFromBracket
} from "@fortawesome/free-solid-svg-icons";
function AdminNavbar(){
    
    const navigate=useNavigate();

        const handleLogout=()=>{
            localStorage.removeItem("token");
            navigate("/login");
        }
    
    return(
        <>
        <div className="admin-navbar">
                    <div className="adminlogo">
                        <h1>Dreamaz <span className="logo1">ink</span></h1>

                        <h2>Admin Dashboard</h2>
                    </div>
                    <div className="admin-navlinks">
    <ul>
        <li>
            <NavLink to="/admin-dashboard">
                <FontAwesomeIcon icon={faGauge} />
                Dashboard
            </NavLink>
        </li>

        <li>
            <NavLink to="/createTrending">
                <FontAwesomeIcon icon={faLayerGroup}/>
                Create Trendings
            </NavLink>
        </li>

        <li>
            <NavLink to="#">
                <FontAwesomeIcon icon={faLayerGroup}/>
                Manage Trendings
            </NavLink>
        </li>

        <li>
            <NavLink to="/create-product">
                <FontAwesomeIcon icon={faLayerGroup} />
                Create Product
            </NavLink>
        </li>
        <li>
            <NavLink to="/manage-products">
            <FontAwesomeIcon icon={faLayerGroup} />
            Manage Products
            </NavLink>
        </li>

        <li>
            <NavLink to="/create-users">
                <FontAwesomeIcon icon={faUsersGear} />
                Create User
            </NavLink>
        </li>

        <li>
            <NavLink to="/Setting">
                <FontAwesomeIcon icon={faGear} />
                Settings
            </NavLink>
        </li>
        <li>
            <NavLink to="/manage-users">
            <FontAwesomeIcon icon={faUsersGear}/>
            Manage Users
            </NavLink>
        </li>

        <li>
            <NavLink onClick={handleLogout} to="/login">
                <FontAwesomeIcon icon={faRightFromBracket} />
                Logout
            </NavLink>
        </li>
    </ul>
</div>
                </div>
        </>
    )
}

export default AdminNavbar;