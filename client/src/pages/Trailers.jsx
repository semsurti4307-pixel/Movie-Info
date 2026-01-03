import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiPlay, FiInfo, FiVolume2, FiVolumeX, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import YouTube from 'react-youtube';
import { moviesAPI, userAPI, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Trailers = () => {
    const { user } = useAuth();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const containerRef = useRef(null);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        fetchTrailers();
    }, []);

    useEffect(() => {
        if (user) {
            checkFavorites();
        }
    }, [user, movies]);

    const fetchTrailers = async () => {
        try {
            // Fetch trending and popular movies
            const [trendingRes, popularRes] = await Promise.all([
                moviesAPI.getTrending('week'),
                moviesAPI.getPopular()
            ]);

            // Combine and unique by ID
            const allMovies = [...trendingRes.data.results, ...popularRes.data.results];
            const uniqueMovies = Array.from(new Set(allMovies.map(a => a.id)))
                .map(id => allMovies.find(a => a.id === id));

            // Fetch videos for each movie
            // We'll limit to first 20 to avoid rate limits
            const limit = 20;
            const moviesWithTrailers = [];

            for (const movie of uniqueMovies.slice(0, limit)) {
                try {
                    const videoRes = await moviesAPI.getMovieVideos(movie.id);
                    const trailer = videoRes.data.results.find(
                        v => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube'
                    );
                    if (trailer) {
                        moviesWithTrailers.push({ ...movie, trailerKey: trailer.key });
                    }
                } catch (e) {
                    console.warn(`No video found for ${movie.id}`);
                }
            }

            setMovies(moviesWithTrailers);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching trailers:', error);
            toast.error('Failed to load trailers');
            setLoading(false);
        }
    };

    const checkFavorites = async () => {
        try {
            const res = await userAPI.getFavorites();
            if (res.data) {
                setFavorites(res.data.map(m => m.id));
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    const handleScroll = (e) => {
        const index = Math.round(e.target.scrollTop / e.target.clientHeight);
        if (index !== currentMovieIndex) {
            setCurrentMovieIndex(index);
        }
    };

    const toggleFavorite = async (movieId) => {
        if (!user) {
            toast.info('Please login to like movies');
            return;
        }

        try {
            const res = await userAPI.toggleFavorite(movieId);
            const isFav = res.data.isFavorite;

            if (isFav) {
                setFavorites([...favorites, movieId]);
                toast.success('Added to Favorites');
            } else {
                setFavorites(favorites.filter(id => id !== movieId));
                toast.success('Removed from Favorites');
            }
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const nextVideo = () => {
        if (currentMovieIndex < movies.length - 1) {
            containerRef.current.scrollTo({
                top: (currentMovieIndex + 1) * containerRef.current.clientHeight,
                behavior: 'smooth'
            });
        }
    };

    const prevVideo = () => {
        if (currentMovieIndex > 0) {
            containerRef.current.scrollTo({
                top: (currentMovieIndex - 1) * containerRef.current.clientHeight,
                behavior: 'smooth'
            });
        }
    };

    if (loading) {
        return (
            <div className="h-screen bg-black flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-black overflow-hidden relative">
            {/* Main Scroll Container */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
                style={{ scrollBehavior: 'smooth' }}
            >
                {movies.map((movie, index) => (
                    <div
                        key={movie.id}
                        className="h-full w-full snap-start relative flex items-center justify-center bg-black"
                    >
                        {/* Video Background */}
                        <div className="absolute inset-0 w-full h-full">
                            {/* Only render video if it's the current one or adjacent (for performance) */}
                            {Math.abs(index - currentMovieIndex) <= 1 && (
                                <div className="pointer-events-none w-full h-full relative overflow-hidden">
                                    <YouTube
                                        videoId={movie.trailerKey}
                                        opts={{
                                            height: '100%',
                                            width: '100%',
                                            playerVars: {
                                                autoplay: 1,
                                                controls: 0,
                                                modestbranding: 1,
                                                rel: 0,
                                                showinfo: 0,
                                                mute: isMuted ? 1 : 0,
                                                loop: 1,
                                                playlist: movie.trailerKey, // Required for looping
                                                start: 10 // Start a bit into header usually to avoid black screens
                                            },
                                        }}
                                        className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-60"
                                        onEnd={(e) => e.target.playVideo()}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
                                </div>
                            )}
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute inset-0 flex flex-col justify-end pb-20 px-6 md:pb-12 md:px-12 pointer-events-none">
                            <div className="max-w-4xl mx-auto w-full flex items-end justify-between pointer-events-auto">
                                {/* Left Side: Info */}
                                <div className="flex-1 pr-8 animate-fade-in-up">
                                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 text-shadow-lg">
                                        {movie.title}
                                    </h2>
                                    <p className="text-gray-300 line-clamp-2 md:line-clamp-3 mb-6 text-shadow-sm max-w-xl">
                                        {movie.overview}
                                    </p>
                                    <div className="flex gap-4">
                                        <Link
                                            to={`/movie/${movie.id}`}
                                            className="btn-primary flex items-center gap-2"
                                        >
                                            <FiPlay className="w-5 h-5" />
                                            Watch Now
                                        </Link>
                                        <button
                                            onClick={() => setIsMuted(!isMuted)}
                                            className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
                                        >
                                            {isMuted ? <FiVolumeX className="w-6 h-6 text-white" /> : <FiVolume2 className="w-6 h-6 text-white" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Right Side: Actions */}
                                <div className="flex flex-col gap-6 items-center animate-fade-in-right">
                                    <div className="relative group">
                                        <Link to={`/movie/${movie.id}`}>
                                            <img
                                                src={getImageUrl(movie.poster_path, 'w185')}
                                                alt={movie.title}
                                                className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-white object-cover group-hover:scale-110 transition-transform"
                                            />
                                        </Link>
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FiPlay className="w-3 h-3 text-white fill-current" />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => toggleFavorite(movie.id)}
                                        className="flex flex-col items-center gap-1 group"
                                    >
                                        <div className={`p-4 rounded-full bg-black/40 backdrop-blur-sm transition-all group-hover:bg-black/60 ${favorites.includes(movie.id) ? 'bg-red-500/20' : ''}`}>
                                            <FiHeart className={`w-8 h-8 transition-colors ${favorites.includes(movie.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                                        </div>
                                        <span className="text-xs font-medium text-white text-shadow">{movie.vote_average.toFixed(1)}</span>
                                    </button>

                                    <Link
                                        to={`/movie/${movie.id}`}
                                        className="flex flex-col items-center gap-1 group"
                                    >
                                        <div className="p-4 rounded-full bg-black/40 backdrop-blur-sm transition-all group-hover:bg-black/60">
                                            <FiInfo className="w-8 h-8 text-white" />
                                        </div>
                                        <span className="text-xs font-medium text-white text-shadow">Details</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Hints (Desktop) */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 pointer-events-none">
                <button onClick={prevVideo} className="p-2 rounded-full bg-white/5 pointer-events-auto hover:bg-white/10 transition-colors">
                    <FiArrowUp className="w-6 h-6 text-white/50" />
                </button>
                <div className="flex flex-col gap-2 items-center">
                    {movies.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentMovieIndex ? 'bg-red-500 h-4' : 'bg-white/20'}`}
                        />
                    ))}
                </div>
                <button onClick={nextVideo} className="p-2 rounded-full bg-white/5 pointer-events-auto hover:bg-white/10 transition-colors">
                    <FiArrowDown className="w-6 h-6 text-white/50" />
                </button>
            </div>
        </div>
    );
};

export default Trailers;
