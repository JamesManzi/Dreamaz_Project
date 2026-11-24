
import React from "react";
import "./Loading.css";

function Loading({
    message = "Please check back later.",
    loading = false,
    title
}) {
    return (
        <div className={`loading-container ${loading ? "is-loading" : "is-empty"}`}>
            <div className="loading-content">

                <div className="loading-icon-wrapper">
                    {loading ? (
                        <>
                            <div className="loading-ring"></div>
                            <div className="loading-ring-inner"></div>

                            <div className="loading-center">
                                <span></span>
                            </div>
                        </>
                    ) : (
                        <div className="empty-icon">
                            <i className="fa-regular fa-folder-open"></i>
                        </div>
                    )}
                </div>

                <div className="loading-text">
                    <h3>
                        {title || (
                            loading
                                ? "Loading content"
                                : "Nothing to display"
                        )}
                    </h3>

                    <p>{message}</p>
                </div>

                {loading && (
                    <div className="loading-progress">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}

                {!loading && (
                    <div className="empty-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}

            </div>
        </div>
    );
}

export default Loading;
