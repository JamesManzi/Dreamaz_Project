
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "./api";
import { useMessage } from "./ShowMessage";
import "./TrendingDetails.css";

function TrendingDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [trending, setTrending] = useState(null);

    const [related, setRelated] = useState([]);

    const [activeIndex, setActiveIndex] = useState(0);

    const [loading, setLoading] = useState(true);

    const { showError } = useMessage();


    // 1. Fetch selected trending record

    useEffect(() => {

        const fetchTrendingDetails = async () => {

            try {

                setLoading(true);

                const res = await api.get(`/getTrending/${id}`);

                if (res.data.success) {

                    setTrending(res.data.trending);

                    setActiveIndex(0);

                } else {

                    showError("Trending item not found");

                }

            } catch (error) {

                console.log(error);

                showError("Failed to load trending details");

                setTrending(null);

            } finally {

                setLoading(false);

            }

        };

        fetchTrendingDetails();

    }, [id]);


    // 2. Fetch related trending records

    useEffect(() => {

        const fetchRelated = async () => {

            try {

                const res = await api.get(`/related/${id}`);

                if (res.data.success) {

                    setRelated(res.data.related);

                }

            } catch (error) {

                console.log("Related products error:", error);

            }

        };

        fetchRelated();

    }, [id]);


    // 3. Loading condition

    if (loading) {

        return <h2>Loading details...</h2>;

    }


    // 4. Not found condition

    if (!trending) {

        return (

            <div>

                <h2>Trending item not found</h2>

                <button onClick={() => navigate(-1)}>

                    Go Back

                </button>

            </div>

        );

    }


    const files = trending.files || [];

    const selectedFile = files[activeIndex];


    return (

        <div className="trending-details">


            {/* Back button */}

            <button onClick={() => navigate(-1)}>

                ← Back

            </button>


            {/* Trending information */}

            <div className="details-header">

                <h1>{trending.name}</h1>

                <p>{trending.description}</p>

                <span>{trending.category}</span>

            </div>


            {/* Main gallery */}

            <div className="details-gallery">

                {selectedFile && (

                    selectedFile.type === "image" ? (

                        <img

                            src={selectedFile.url}

                            alt={trending.name}

                            className="details-main-media"

                        />

                    ) : (

                        <video

                            src={selectedFile.url}

                            controls

                            className="details-main-media"

                        />

                    )

                )}

            </div>


            {/* Image and video thumbnails */}

            <div className="details-thumbnails">

                {files.map((file, index) => (

                    <button

                        key={file.public_id || index}

                        onClick={() => setActiveIndex(index)}

                        className={

                            activeIndex === index

                                ? "thumbnail active-thumbnail"

                                : "thumbnail"

                        }

                    >

                        {file.type === "image" ? (

                            <img

                                src={file.url}

                                alt={trending.name}

                            />

                        ) : (

                            <span>▶ Video</span>

                        )}

                    </button>

                ))}

            </div>


            {/* Full description */}

            <div className="details-description">

                <h2>About this content</h2>

                <p>{trending.description}</p>

                <p>Category: {trending.category}</p>

                <p>

                    Published: {

                        new Date(trending.createdAt)

                            .toLocaleDateString()

                    }

                </p>

            </div>


            {/* Related trending */}

            <section className="related-products">

                <h2>Related Content</h2>

                <div className="related-grid">

                    {related.map(item => (

                        <div

                            className="related-card"

                            key={item._id}

                        >

                            {item.files?.[0] && (

                                item.files[0].type === "image" ? (

                                    <img

                                        src={item.files[0].url}

                                        alt={item.name}

                                    />

                                ) : (

                                    <video

                                        src={item.files[0].url}

                                        muted

                                        controls

                                    />

                                )

                            )}

                            <h3>{item.name}</h3>

                            <p>{item.category}</p>

                            <button

                                onClick={() =>

                                    navigate(`/trending/${item._id}`)

                                }

                            >

                                Explore More

                            </button>

                        </div>

                    ))}

                </div>

                {related.length === 0 && (

                    <p>No related content available.</p>

                )}

            </section>

        </div>

    );

}

export default TrendingDetails;
