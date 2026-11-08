import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "./api";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEye,
    faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import {
    faUser
} from "@fortawesome/free-solid-svg-icons";
import "./CreateUsers.css";
import Spinner from "./Spinner";
import AdminNavbar from "./AdminNavbar";
import { useMessage } from "./ShowMessage";
function CreateUsers() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role,setRole]=useState("");

    const {showSuccess,showError}=useMessage();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const token=localStorage.getItem("token");
    const userId=localStorage.getItem("userId");
    if(!token||!userId){
        navigate("/login");
        return
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) {
            return;
        }

        try {
            setLoading(true);

            const res = await api.post(
                "/create-user",
                {
                    username: username.trim(),
                    email: email.trim(),
                    password: password,
                    role
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data.success) {
                showSuccess(
                    res.data.message ||
                    "User created successfully!"
                );


                setUsername("");
                setEmail("");
                setPassword("");
            } else {
                showError(
                    res.data.message ||
                    "Unable to create user."
                );
            }
        } catch (error) {
            console.log("Create User Error:", error);

            if (error.response) {
                showError(
                    error.response.data?.message ||
                    "Unable to create user."
                );
            } else if (error.request) {
                showError(
                    "Cannot connect to the server."
                );
            } else {
                showError(
                    "Something went wrong. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const togglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className="create-users">
                <AdminNavbar/>
            <div className="form-container">
                <div className="form-header">
                    <h2>
                        Create User
                    </h2>
                    <p>
                        Add a new authorized user to your platform.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="role">Role</label>

<select id="role" name="role" className="role" value={role} onChange={(e)=>setRole(e.target.value)}>
    <option value="">Select Role</option>
    <option value="user">User</option>
    <option value="admin">Admin</option>
</select>
                    {/* USERNAME */}
                    <label htmlFor="username">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                        placeholder="Enter username"
                        required
                    />

                    {/* EMAIL */}
                    <label htmlFor="email">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        placeholder="Enter email"
                        required
                    />

                    {/* PASSWORD */}
                    <div className="password-container">
                        <label htmlFor="password">
                            Password
                        </label>
                        <div className="password-input">
                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Enter password"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={togglePassword}
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

                    {/* BUTTONS */}
                    <div className="createUser-btn">
                        <button
                            type="submit"
                            className="user-btn"
                            disabled={loading}
                        >
                           {loading?(
                            <Spinner text="Creating...."></Spinner>
                           ):(
                           <>
                           <FontAwesomeIcon icon={faUser}/>
                           Create User
                           </>
                           )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateUsers;