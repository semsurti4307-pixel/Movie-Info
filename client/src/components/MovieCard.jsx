import { Link } from 'react-router-dom';
import { FiStar, FiPlay, FiHeart, FiBookmark } from 'react-icons/fi';
import { getImageUrl } from '../services/api';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { toast } from 'react-toastify';

const MovieCard = ({ movie, size = 'normal' }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [inWatchlist, setInWatchlist] = useState(false);
    const { user } = useAuth();

    // Fetch initial favorite/watchlist status
    useEffect(() => {
        const fetchStatus = async () => {
            if (movie?.id) {
                try {
                    const response = await userAPI.checkMovieStatus(movie.id);
                    setIsFavorite(response.data.isFavorite);
                    setInWatchlist(response.data.inWatchlist);
                } catch (error) {
                    // Silently fail
                }
            }
        };
        fetchStatus();
    }, [movie?.id]);

    const sizeClasses = {
        small: 'w-36 md:w-40',
        normal: 'w-44 md:w-52',
        large: 'w-56 md:w-64',
        full: 'w-full',
    };

    const handleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await userAPI.toggleFavorite(movie.id);
            setIsFavorite(response.data.isFavorite);
            toast.success(response.data.isFavorite ? 'Added to favorites!' : 'Removed from favorites');
        } catch (error) {
            toast.error('Failed to update favorites');
        }
    };

    const handleWatchlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await userAPI.toggleWatchlist(movie.id);
            setInWatchlist(response.data.inWatchlist);
            toast.success(response.data.inWatchlist ? 'Added to watchlist!' : 'Removed from watchlist');
        } catch (error) {
            toast.error('Failed to update watchlist');
        }
    };

    const releaseYear = movie.release_date?.split('-')[0];
    const rating = movie.vote_average?.toFixed(1);

    return (
        <Link
            to={`/movie/${movie.id}`}
            className={`movie-card group block ${sizeClasses[size]}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Poster Image */}
            <div className="relative aspect-[2/3] bg-dark-300 rounded-xl overflow-hidden">
                <img
                    src={getImageUrl(movie.poster_path)}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Rating Badge */}
                {rating && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
                        <FiStar className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-white text-sm font-semibold">{rating}</span>
                    </div>
                )}

                {/* Quick Actions */}
                <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
                    <button
                        onClick={handleFavorite}
                        className={`p-2 rounded-full backdrop-blur-sm transition-all ${isFavorite
                            ? 'bg-red-500 text-white'
                            : 'bg-black/50 text-white hover:bg-red-500'
                            }`}
                    >
                        <FiHeart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                        onClick={handleWatchlist}
                        className={`p-2 rounded-full backdrop-blur-sm transition-all ${inWatchlist
                            ? 'bg-blue-500 text-white'
                            : 'bg-black/50 text-white hover:bg-blue-500'
                            }`}
                    >
                        <FiBookmark className={`w-4 h-4 ${inWatchlist ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* Play Button */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-red-500/50 transform scale-75 group-hover:scale-100 transition-transform">
                        <FiPlay className="w-6 h-6 text-white ml-1" />
                    </div>
                </div>

                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none ${isHovered ? 'ring-2 ring-red-500/50 shadow-lg shadow-red-500/20' : ''}`} />
            </div>

            {/* Title Below */}
            <div className="mt-3 px-1">
                <h3 className="font-semibold text-sm line-clamp-1 text-gray-200 group-hover:text-red-500 transition-colors duration-300">
                    {movie.title}
                </h3>
                <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
                    {releaseYear && <span>{releaseYear}</span>}
                    {rating && (
                        <div className="flex items-center gap-1 text-yellow-500">
                            <FiStar className="w-3 h-3 fill-current" />
                            <span className="font-medium text-gray-300">{rating}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default MovieCard;
