
import React from "react";
import "./Loading.css";

function Loading({ message = "No content available", loading = false }) {
    return (
        <div className="loading-container">
            <div className="loading-content">

                <div className="loading-icon">
                    {loading ? (
                        <div className="loading-spinner"></div>
                    ) : (
                        <div className="empty-icon">
                            <i className="fa-regular fa-folder-open"></i>
                        </div>
                    )}
                </div>

                <h3>
                    {loading ? "Loading content..." : "Nothing to display"}
                </h3>

                <p>
                    {message}
                </p>

            </div>
        </div>
    );
}

export default Loading;
