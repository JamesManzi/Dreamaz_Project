
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";
import api from "./api";
import { useMessage } from "./ShowMessage";
import Loading from "./Loading";
function Hero({ category = "all" }) {

    const navigate = useNavigate();

    const [trending, setTrending] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const { showError } = useMessage();

    // 1. Fetch trending data
    useEffect(() => {

        const fetchTrending = async () => {

            try {

                setLoading(true);

                const res = await api.get("/getTrending", {
                    params: { category }
                });

                if (res.data.success) {

                    setTrending(res.data.trending || []);
                    setActiveIndex(0);

                } else {

                    setTrending([]);
                    showError("Failed to fetch trending");

                }

            } catch (error) {

                console.log("Trending Error:", error);

                showError("Fetching Products Error");

            } finally {

                setLoading(false);

            }

        };

        fetchTrending();

    }, [category]);


    // 2. Convert nested files into one array
    // Preserve the MongoDB ID of each trending record

    const files = trending.flatMap(item =>

        (item.files || [])

            .filter(file => file.url)

            .map(file => ({

                ...file,

                trendingId: item._id,

                name: item.name,

                category: item.category,

                description: item.description

            }))

    );


    // 3. Automatically change images/videos

    useEffect(() => {

        if (files.length <= 1) return;

        const interval = setInterval(() => {

            setActiveIndex(previous =>

                (previous + 1) % files.length

            );

        }, 4000);

        return () => clearInterval(interval);

    }, [files.length]);


    // 4. Loading condition

    {/* FEATURED COLLECTIONS */}
    // Loading state
if (loading) {
    return (
        <section className="hero">
            <Loading
                loading={true}
                message="Loading featured artwork..."
            />
        </section>
    );
}

// Empty state
if (files.length === 0) {
    return (
        <section className="hero">
            <Loading
                loading={false}
                message="No trending artworks are available right now."
            />
        </section>
    );
}


    // 5. Empty condition

    if (files.length === 0) {

        return <h2>No trending files available</h2>;

    }


    // 6. Current active file

    const activeFile = files[activeIndex];


    // 7. Navigate to trending details

    const handleExploreMore = () => {

        navigate(`/trending/${activeFile.trendingId}`);

    };


    return (

        <section className="hero">

            {/* Display image or video */}

            {activeFile.type === "image" ? (

                <img

                    key={activeFile.url}

                    src={activeFile.url}

                    alt={activeFile.name}

                    className="hero-media"

                />

            ) : (

                <video

                    key={activeFile.url}

                    src={activeFile.url}

                    className="hero-media"

                    autoPlay

                    muted

                    loop

                    playsInline

                />

            )}


            {/* Trending information */}

            <div className="hero-overlay">

                <h1>{activeFile.name}</h1>

                <p>{activeFile.description}</p>

                <span>{activeFile.category}</span>

            </div>


            {/* Previous button */}

            {files.length > 1 && (

                <button

                    className="hero-prev"

                    onClick={() =>

                        setActiveIndex(previous =>

                            (previous - 1 + files.length) % files.length

                        )

                    }

                >

                    ❮

                </button>

            )}


            {/* Next button */}

            {files.length > 1 && (

                <button

                    className="hero-next"

                    onClick={() =>

                        setActiveIndex(previous =>

                            (previous + 1) % files.length

                        )

                    }

                >

                    ❯

                </button>

            )}


            {/* Navigation dots */}

            <div className="hero-dots">

                {files.map((file, index) => (

                    <button

                        key={file.url + index}

                        className={

                            activeIndex === index ? "active" : ""

                        }

                        onClick={() => setActiveIndex(index)}

                    />

                ))}

            </div>


            {/* Explore More */}

            <div className="read-more-btn">

                <button onClick={handleExploreMore}>

                    Explore More

                </button>

            </div>

        </section>

    );

}

export default Hero;
