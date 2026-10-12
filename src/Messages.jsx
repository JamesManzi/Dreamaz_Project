import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "./api";
import AdminNavbar from "./AdminNavbar";
import "./Messages.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope,faEnvelopeOpen } from "@fortawesome/free-regular-svg-icons";
function Messages() {
    return (
        <div className="admin-layout">
            {/* Sidebar Navigation */}
            <div className="messages-navbar">
                <AdminNavbar/>
                </div>

            
            </div>
    );
}

export default Messages;