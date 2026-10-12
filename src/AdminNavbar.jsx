import { Link,useNavigate } from "react-router-dom";
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
            <Link to="/admin-dashboard">
                <FontAwesomeIcon icon={faGauge} />
                Dashboard
            </Link>
        </li>


        <li>
            <Link to="/messages">
                <FontAwesomeIcon icon={faEnvelope} />
                Customer Messages
            </Link>
        </li>

        <li>
            <Link to="/create-product">
                <FontAwesomeIcon icon={faLayerGroup} />
                Create Product
            </Link>
        </li>
        <li>
            <Link to="/manage-products">
            <FontAwesomeIcon icon={faLayerGroup} />
            Manage Products
            </Link>
        </li>
        <li>
            <Link to="#">
            <FontAwesomeIcon icon={faLayerGroup}/>
             Create Content
            </Link>
        </li>
        <li>
            <Link to="#">
            <FontAwesomeIcon icon={faLayerGroup}/>
            Manage Contents
            </Link>
        </li>

        <li>
            <Link to="/create-users">
                <FontAwesomeIcon icon={faUsersGear} />
                Create User
            </Link>
        </li>

        <li>
            <Link to="/Setting">
                <FontAwesomeIcon icon={faGear} />
                Settings
            </Link>
        </li>
        <li>
            <Link to="/manage-users">
            <FontAwesomeIcon icon={faUsersGear}/>
            Manage Users
            </Link>
        </li>

        <li>
            <Link onClick={handleLogout} to="/login">
                <FontAwesomeIcon icon={faRightFromBracket} />
                Logout
            </Link>
        </li>
    </ul>
</div>
                </div>
        </>
    )
}

export default AdminNavbar;