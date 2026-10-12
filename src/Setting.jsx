import { useState, useEffect } from "react";
import "./Setting.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCamera,
    faEye,
    faEyeSlash,
    faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
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
import { Link, useNavigate } from "react-router-dom";
import api from "./api";
import Spinner from "./Spinner";
import AdminNavbar from "./AdminNavbar";
function Setting() {
    const [profilePreview, setProfilePreview] = useState(null);
    const [profileFile, setProfileFile] = useState(null);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchingProfile, setFetchingProfile] = useState(true);

    const navigate = useNavigate();

    const handleLogout=()=>{
        localStorage.removeItem("token");
        navigate("/login");
        return
    }


    // ==========================================
    // GET USER PROFILE EVERY TIME SETTINGS OPENS
    // ==========================================
    useEffect(() => {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
            navigate("/login");
            return;
        }

        const fetchUserProfile = async () => {
            try {
                setFetchingProfile(true);

               const res=await api.get(`/admin/user`,{
                headers:{
                    Authorization: `Bearer ${token}`
                }
               })

                if (res.data.success) {
                    const user = res.data.user;

                    // Load username
                    setUsername(user.username || "");

                    // Load email
                    setEmail(user.email || "");

                    // ==========================================
                    // LOAD SAVED PROFILE IMAGE FROM DATABASE
                    // ==========================================
                    if (user.profile) {
                        setProfilePreview(
                            user.profile
                        );
                    } else {
                        setProfilePreview(null);
                    }
                }

            } catch (error) {
                console.log(
                    "Fetch user profile error:",
                    error
                );

                setMessage("Unable to load your profile.");
                setMessageType("error");

            } finally {
                setFetchingProfile(false);
            }
        };

        fetchUserProfile();

    }, [navigate]);


    // ==========================================
    // UPDATE USER
    // ==========================================
    const handleChange = async (e) => {
        e.preventDefault();

        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
            navigate("/login");
            return;
        }

        const formData = new FormData();

        formData.append("username", username);
        formData.append("email", email);

        if (password) {
            formData.append("password", password);
        }

        if (newPassword) {
            formData.append("newPassword", newPassword);
        }

        // Only send a new image when user selected one
        if (profileFile) {
            formData.append("profile", profileFile);
        }

        try {
            setLoading(true);
            setMessage("");
            setMessageType("");

            const res = await api.put(
                `/setting/${userId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data.success) {

                // ==========================================
                // SHOW SUCCESS MESSAGE
                // ==========================================
                setMessage("Profile saved successfully!");
                setMessageType("success");

                // ==========================================
                // SHOW THE SAVED IMAGE
                // ==========================================
                if (res.data.user?.profile) {
                    setProfilePreview(
                        res.data.user.profile
                    );
                }

                // The selected file is now saved
                setProfileFile(null);

                // Clear password fields after successful update
                setPassword("");
                setNewPassword("");

            
            } else {
                setMessage(
                    res.data.message ||
                    "Unable to update profile."
                );

                setMessageType("error");
            }

        } catch (error) {

            console.log(
                "Update User Error:",
                error
            );

            const errorMsg =
                error.response?.data?.message ||
                "Unable to update profile.";

            setMessage(errorMsg);
            setMessageType("error");

        } finally {
            setLoading(false);
        }
    };


    // ==========================================
    // SELECT PROFILE IMAGE
    // ==========================================
    const handleProfileImage = (e) => {

        const file = e.target.files[0];

        if (!file) {
            return;
        }

        // Check image type
        if (!file.type.startsWith("image/")) {

            setMessage(
                "Please select a valid image."
            );

            setMessageType("error");

            return;
        }

        // Check image size
        if (file.size > 5 * 1024 * 1024) {

            setMessage(
                "Image must be less than 5MB."
            );

            setMessageType("error");

            return;
        }

        // Save file for upload
        setProfileFile(file);

        // Show immediate preview
        const imageUrl = URL.createObjectURL(file);

        setProfilePreview(imageUrl);

        // Remove previous message
        setMessage("");
        setMessageType("");
    };


    // ==========================================
    // CLEAN BLOB URL
    // ==========================================
    useEffect(() => {

        return () => {

            if (
                profilePreview &&
                profilePreview.startsWith("blob:")
            ) {
                URL.revokeObjectURL(profilePreview);
            }

        };

    }, [profilePreview]);


    return (
        <div className="profile-setting">

                <AdminNavbar/>
            <form
                className="profile-card"
                onSubmit={handleChange}
            >

                {/* =====================================
                    PROFILE IMAGE
                ====================================== */}

                <div className="profile-upload">

                    <label
                        htmlFor="profile-image"
                        className="profile-avatar"
                        title="Change profile picture"
                    >

                        {fetchingProfile ? (

                            <div className="profile-loading">
                                Loading...
                            </div>

                        ) : (

                            <img
                                src={
                                    profilePreview ||
                                    "/default-avatar.png"
                                }
                                alt="Profile"
                            />

                        )}

                        <span className="profile-edit">
                            <FontAwesomeIcon
                                icon={faCamera}
                            />
                        </span>

                    </label>

                    <input
                        type="file"
                        id="profile-image"
                        name="profile"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleProfileImage}
                        hidden
                    />

                    <p className="profile-help">
                        Click the camera icon to change your profile
                        picture.
                    </p>

                </div>


                {/* =====================================
                    SUCCESS / ERROR MESSAGE
                ====================================== */}

                {message && (

                    <div
                        className={`setting-message ${messageType}`}
                    >

                        {messageType === "success" && (
                            <FontAwesomeIcon
                                icon={faCheckCircle}
                            />
                        )}

                        <span>
                            {message}
                        </span>

                    </div>

                )}


                {/* =====================================
                    FORM INPUTS
                ====================================== */}

                <div className="setting-inputs">

                    {/* USERNAME */}

                    <div className="input-group">

                        <label htmlFor="username">
                            Username
                        </label>

                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                        />

                    </div>


                    {/* EMAIL */}

                    <div className="input-group">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />

                    </div>


                    {/* CURRENT PASSWORD */}

                    <div className="input-group">

                        <label htmlFor="current-password">
                            Current Password
                        </label>

                        <div className="password-input">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                id="current-password"
                                name="password"
                                placeholder="Enter current password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                            />

                            <button
                                type="button"
                                className="user-password"
                                onClick={() =>
                                    setShowPassword(
                                        (prev) => !prev
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >

                                <FontAwesomeIcon
                                    icon={
                                        showPassword
                                            ? faEyeSlash
                                            : faEye
                                    }
                                />

                            </button>

                        </div>

                    </div>


                    {/* NEW PASSWORD */}

                    <div className="input-group">

                        <label htmlFor="new-password">
                            New Password
                        </label>

                        <div className="password-input">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                id="new-password"
                                name="newPassword"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) =>
                                    setNewPassword(
                                        e.target.value
                                    )
                                }
                            />

                            <button
                                type="button"
                                className="user-password"
                                onClick={() =>
                                    setShowPassword(
                                        (prev) => !prev
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >

                                <FontAwesomeIcon
                                    icon={
                                        showPassword
                                            ? faEyeSlash
                                            : faEye
                                    }
                                />

                            </button>

                        </div>

                    </div>

                </div>


                {/* =====================================
                    BUTTONS
                ====================================== */}

                <div className="button">

                    <button
                        type="submit"
                        className="update-btn"
                        disabled={loading || fetchingProfile}
                    >

                        {loading?(
                            <Spinner text="Saving...."></Spinner>
                        ):(
                            "Save Changes"
                        )}

                    </button>


                    <Link
                        to="/admin-dashboard"
                        className="navigate-link"
                    >

                        <button
                            type="button"
                            className="navigate-btn"
                        >
                            Back
                        </button>

                    </Link>

                </div>

            </form>

        </div>
    );
}

export default Setting;