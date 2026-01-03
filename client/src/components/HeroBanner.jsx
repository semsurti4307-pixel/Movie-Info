import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlay, FiInfo, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getImageUrl } from '../services/api';

const HeroBanner = ({ movies }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (!movies?.length) return;

        const interval = setInterval(() => {
            handleNext();
        }, 8000);

        return () => clearInterval(interval);
    }, [movies, currentIndex]);

    const handleNext = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev + 1) % movies.length);
        setTimeout(() => setIsTransitioning(false), 500);
    };

    const handlePrev = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
        setTimeout(() => setIsTransitioning(false), 500);
    };

    if (!movies?.length) {
        return (
            <div className="h-[80vh] min-h-[500px] bg-dark-400 animate-pulse" />
        );
    }

    const movie = movies[currentIndex];
    const rating = movie.vote_average?.toFixed(1);

    return (
        <div className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden">
            {/* Background Image */}
            <div
                className={`absolute inset-0 transition-opacity duration-700 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
                style={{
                    backgroundImage: `url(${getImageUrl(movie.backdrop_path, 'original')})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                }}
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-dark-500 via-dark-500/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-500 via-transparent to-dark-500/30" />

            {/* Content */}
            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                <div className={`max-w-2xl transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                    {/* Category Badge */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className="badge-primary">Featured</span>
                        {rating && (
                            <div className="flex items-center gap-1 text-yellow-400">
                                <FiStar className="w-4 h-4 fill-current" />
                                <span className="font-semibold">{rating}</span>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                        {movie.title}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-gray-300 mb-6">
                        {movie.release_date && (
                            <span>{new Date(movie.release_date).getFullYear()}</span>
                        )}
                        {movie.vote_count && (
                            <>
                                <span>•</span>
                                <span>{movie.vote_count.toLocaleString()} votes</span>
                            </>
                        )}
                    </div>

                    {/* Overview */}
                    <p className="text-gray-300 text-lg leading-relaxed mb-8 line-clamp-3">
                        {movie.overview}
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-wrap gap-4">
                        <Link
                            to={`/movie/${movie.id}`}
                            className="btn-primary flex items-center gap-2"
                        >
                            <FiPlay className="w-5 h-5" />
                            Watch Now
                        </Link>
                        <Link
                            to={`/movie/${movie.id}`}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <FiInfo className="w-5 h-5" />
                            More Info
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute bottom-1/2 translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
                <button
                    onClick={handlePrev}
                    className="pointer-events-auto w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-all"
                >
                    <FiChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={handleNext}
                    className="pointer-events-auto w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-all"
                >
                    <FiChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Pagination Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {movies.slice(0, 5).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                ? 'w-8 bg-red-500'
                                : 'w-2 bg-white/40 hover:bg-white/60'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroBanner;
