
import { useState, useEffect } from "react";

function FashionMedia({ files, name }) {

    const [currentIndex, setCurrentIndex] = useState(0);

    // Filter valid media
    const mediaFiles = Array.isArray(files)
        ? files.filter(file =>
            file?.url &&
            ["image", "video"].includes(file.type)
        )
        : [];

    const currentFile = mediaFiles[currentIndex];

    // Reset media index when collection changes
    useEffect(() => {
        setCurrentIndex(0);
    }, [files]);

    // Automatically move to the next image
    useEffect(() => {

        if (
            !currentFile ||
            currentFile.type !== "image" ||
            mediaFiles.length <= 1
        ) {
            return;
        }

        const timer = setTimeout(() => {

            setCurrentIndex(prev =>
                (prev + 1) % mediaFiles.length
            );

        }, 4000);

        return () => clearTimeout(timer);

    }, [currentIndex, currentFile, mediaFiles.length]);

    // Move to next media
    const handleNext = () => {

        if (mediaFiles.length <= 1) return;

        setCurrentIndex(prev =>
            (prev + 1) % mediaFiles.length
        );

    };

    // Handle missing media
    if (mediaFiles.length === 0) {

        return (
            <div className="fashion-media-empty">
                <p>No media available</p>
            </div>
        );

    }

    return (

        <div className="fashion-media">

            {/* Display image */}

            {currentFile.type === "image" && (

                <img
                    key={currentFile._id || currentFile.url}
                    src={currentFile.url}
                    alt={currentFile.name || name || "Fashion collection"}
                    className="fashion-image"
                    loading="lazy"
                    onError={handleNext}
                />

            )}

            {/* Display video */}

            {currentFile.type === "video" && (

                <video
                    key={currentFile._id || currentFile.url}
                    src={currentFile.url}
                    autoPlay
                    muted
                    playsInline
                    onEnded={handleNext}
                    onError={handleNext}
                    className="fashion-video"
                />

            )}

            {/* Media counter */}

            {mediaFiles.length > 1 && (

                <div className="fashion-counter">

                    {currentIndex + 1} / {mediaFiles.length}

                </div>

            )}

        </div>

    );

}

export default FashionMedia;
