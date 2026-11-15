
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "./api";
import { useMessage } from "./ShowMessage";
import "./PrintsDetails.css";

function PrintsDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showError } = useMessage();

    const [print, setPrint] = useState(null);
    const [relatedPrints, setRelatedPrints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrintDetails = async () => {
            try {
                const response = await api.get("/getPrints");

                if (response.data.success) {
                    const allPrints = response.data.prints || [];

                    const selectedPrint = allPrints.find(
                        (item) => item._id === id
                    );

                    if (selectedPrint) {
                        setPrint(selectedPrint);

                        const related = allPrints
                            .filter((item) => item._id !== id)
                            .slice(0, 4);

                        setRelatedPrints(related);
                    } else {
                        setPrint(null);
                    }
                }
            } catch (error) {
                console.error("Error fetching print details:", error);
                showError("Failed to load print details.");
            } finally {
                setLoading(false);
            }
        };

        fetchPrintDetails();
    }, [id]);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="prints-details-status">
                    Loading print details...
                </div>
                <Footer />
            </>
        );
    }

    if (!print) {
        return (
            <>
                <Navbar />
                <div className="prints-details-status">
                    <h2>Print not found</h2>
                    <button onClick={() => navigate("/prints")}>
                        Back to Prints
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="prints-details-page">

                {/* Breadcrumb */}
                <div className="prints-breadcrumb">
                    <span onClick={() => navigate("/")}>Home</span>
                    {" / "}
                    <span onClick={() => navigate("/prints")}>Prints</span>
                    {" / "}
                    <strong>{print.name}</strong>
                </div>

                {/* Product Details */}
                <section className="prints-details-container">

                    <div className="prints-details-gallery">
                        {print.files?.length > 0 ? (
                            print.files.map((file, index) => (
                                <div
                                    className="prints-details-media"
                                    key={file.url || index}
                                >
                                    {file.type === "video" ? (
                                        <video
                                            src={file.url}
                                            controls
                                            playsInline
                                        />
                                    ) : (
                                        <img
                                            src={file.url}
                                            alt={`${print.name} ${index + 1}`}
                                        />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="prints-details-no-image">
                                No media available
                            </div>
                        )}
                    </div>

                    <div className="prints-details-info">
                        <span className="prints-details-category">
                            PRINT COLLECTION
                        </span>

                        <h1>{print.name}</h1>

                        <h2>
                            {Number(print.price).toLocaleString()} RWF
                        </h2>

                        <div className="prints-details-divider"></div>

                        <h3>Product Description</h3>

                        <p>{print.description}</p>

                        <button
                            className="prints-back-button"
                            onClick={() => navigate("/prints")}
                        >
                            Continue Shopping
                        </button>
                    </div>

                </section>

                {/* Related Prints */}
                {relatedPrints.length > 0 && (
                    <section className="prints-related-section">

                        <h2>You May Also Like</h2>

                        <div className="prints-related-grid">
                            {relatedPrints.map((item) => {
                                const media = item.files?.[0];

                                return (
                                    <div
                                        className="prints-related-card"
                                        key={item._id}
                                    >
                                        <div className="prints-related-image">
                                            {media?.type === "video" ? (
                                                <video
                                                    src={media.url}
                                                    muted
                                                    playsInline
                                                />
                                            ) : media?.url ? (
                                                <img
                                                    src={media.url}
                                                    alt={item.name}
                                                />
                                            ) : (
                                                <div className="prints-details-no-image">
                                                    No image
                                                </div>
                                            )}
                                        </div>

                                        <div className="prints-related-content">
                                            <h3>{item.name}</h3>

                                            <h4>
                                                {Number(item.price).toLocaleString()} RWF
                                            </h4>

                                            <button
                                                onClick={() =>
                                                    navigate(`/prints/${item._id}`)
                                                }
                                            >
                                                Explore More
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </section>
                )}

            </main>

            <Footer />
        </>
    );
}

export default PrintsDetails;
