import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    FiPlay, FiHeart, FiBookmark, FiStar, FiClock,
    FiCalendar, FiGlobe, FiDollarSign, FiShare2, FiExternalLink
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { moviesAPI, userAPI, reviewsAPI, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MovieSlider from '../components/MovieSlider';
import TrailerModal from '../components/TrailerModal';
import StarRating from '../components/StarRating';

const MovieDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();

    const [movie, setMovie] = useState(null);
    const [credits, setCredits] = useState(null);
    const [videos, setVideos] = useState([]);
    const [similarMovies, setSimilarMovies] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isFavorite, setIsFavorite] = useState(false);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [showTrailer, setShowTrailer] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchMovieData();
    }, [id]);

    const fetchMovieData = async () => {
        setLoading(true);
        try {
            // 1. Fetch critical movie data first
            const [movieRes, creditsRes, videosRes, similarRes] = await Promise.all([
                moviesAPI.getMovieDetails(id),
                moviesAPI.getMovieCredits(id),
                moviesAPI.getMovieVideos(id),
                moviesAPI.getSimilarMovies(id)
            ]);

            setMovie(movieRes.data);
            setCredits(creditsRes.data);
            setVideos(videosRes.data.results);
            setSimilarMovies(similarRes.data.results);

            // Allow UI to render movie details immediately
            setLoading(false);

            // 2. Fetch reviews and user status in background
            try {
                const reviewsRes = await reviewsAPI.getMovieReviews(id);
                setReviews(reviewsRes.data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
                // Don't show toast for reviews error to avoid annoyance, just log
            }

            // Check movie status in favorites/watchlist
            try {
                if (user) { // Only check if user is logged in
                    const statusRes = await userAPI.checkMovieStatus(id);
                    setIsFavorite(statusRes.data.isFavorite);
                    setInWatchlist(statusRes.data.inWatchlist);
                }
            } catch (error) {
                console.warn('Error checking user status:', error);
            }

            // Add to recently viewed
            userAPI.addRecentlyViewed(parseInt(id)).catch(e => console.warn(e));

        } catch (error) {
            console.error('Error fetching movie:', error);
            toast.error('Failed to load movie details');
            setLoading(false);
        }
    };

    const handleFavorite = async () => {
        try {
            const response = await userAPI.toggleFavorite(parseInt(id));
            setIsFavorite(response.data.isFavorite);
            toast.success(response.data.isFavorite ? 'Added to favorites!' : 'Removed from favorites');
        } catch (error) {
            toast.error('Failed to update favorites');
        }
    };

    const handleWatchlist = async () => {
        try {
            const response = await userAPI.toggleWatchlist(parseInt(id));
            setInWatchlist(response.data.inWatchlist);
            toast.success(response.data.inWatchlist ? 'Added to watchlist!' : 'Removed from watchlist');
        } catch (error) {
            toast.error('Failed to update watchlist');
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.info('Please login to submit a review');
            return;
        }

        if (!reviewRating || !reviewComment.trim()) {
            toast.error('Please provide both rating and comment');
            return;
        }

        setSubmittingReview(true);
        try {
            const response = await reviewsAPI.createReview({
                movieId: parseInt(id),
                rating: reviewRating,
                comment: reviewComment.trim(),
            });

            setReviews([response.data, ...reviews]);
            setReviewRating(0);
            setReviewComment('');
            setShowReviewForm(false);
            toast.success('Review submitted successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const director = credits?.crew?.find(c => c.job === 'Director');
    const cast = credits?.cast?.slice(0, 10);

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-500 pt-20">
                <div className="h-[60vh] bg-dark-400 animate-pulse" />
                <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10">
                    <div className="flex gap-8">
                        <div className="w-80 aspect-[2/3] bg-dark-400 rounded-xl animate-pulse" />
                        <div className="flex-1 space-y-4">
                            <div className="h-12 bg-dark-400 rounded w-3/4 animate-pulse" />
                            <div className="h-6 bg-dark-400 rounded w-1/2 animate-pulse" />
                            <div className="h-24 bg-dark-400 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="min-h-screen bg-dark-500 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🎬</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Movie not found</h2>
                    <Link to="/movies" className="btn-primary">Browse Movies</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-500">
            {/* Backdrop */}
            <div
                className="relative h-[70vh] min-h-[500px]"
                style={{
                    backgroundImage: `url(${getImageUrl(movie.backdrop_path, 'original')})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-dark-500 via-dark-500/60 to-dark-500/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-dark-500 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-96 relative z-10 pb-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Poster */}
                    <div className="flex-shrink-0 mx-auto lg:mx-0">
                        <img
                            src={getImageUrl(movie.poster_path, 'w500')}
                            alt={movie.title}
                            className="w-64 lg:w-80 rounded-xl shadow-2xl"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                            {movie.title}
                            {movie.release_date && (
                                <span className="text-gray-400 font-normal ml-3">
                                    ({new Date(movie.release_date).getFullYear()})
                                </span>
                            )}
                        </h1>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 mb-6 text-gray-300">
                            {movie.vote_average > 0 && (
                                <div className="flex items-center gap-1 text-yellow-400">
                                    <FiStar className="w-5 h-5 fill-current" />
                                    <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                                    <span className="text-gray-500">/ 10</span>
                                </div>
                            )}

                            {movie.runtime > 0 && (
                                <div className="flex items-center gap-1">
                                    <FiClock className="w-4 h-4" />
                                    <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                                </div>
                            )}

                            {movie.release_date && (
                                <div className="flex items-center gap-1">
                                    <FiCalendar className="w-4 h-4" />
                                    <span>{new Date(movie.release_date).toLocaleDateString()}</span>
                                </div>
                            )}

                            {movie.original_language && (
                                <div className="flex items-center gap-1">
                                    <FiGlobe className="w-4 h-4" />
                                    <span className="uppercase">{movie.original_language}</span>
                                </div>
                            )}
                        </div>

                        {/* Genres */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {movie.genres?.map((genre) => (
                                <Link
                                    key={genre.id}
                                    to={`/movies?genre=${genre.id}`}
                                    className="badge-primary hover:bg-red-500/30 transition-colors"
                                >
                                    {genre.name}
                                </Link>
                            ))}
                        </div>

                        {/* Tagline */}
                        {movie.tagline && (
                            <p className="text-xl text-gray-400 italic mb-4">"{movie.tagline}"</p>
                        )}

                        {/* Overview */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
                            <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
                        </div>

                        {/* Director & Budget */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {director && (
                                <div>
                                    <p className="text-gray-500 text-sm">Director</p>
                                    <p className="text-white font-medium">{director.name}</p>
                                </div>
                            )}
                            {movie.budget > 0 && (
                                <div>
                                    <p className="text-gray-500 text-sm">Budget</p>
                                    <p className="text-white font-medium">${(movie.budget / 1000000).toFixed(1)}M</p>
                                </div>
                            )}
                            {movie.revenue > 0 && (
                                <div>
                                    <p className="text-gray-500 text-sm">Revenue</p>
                                    <p className="text-white font-medium">${(movie.revenue / 1000000).toFixed(1)}M</p>
                                </div>
                            )}
                            {movie.status && (
                                <div>
                                    <p className="text-gray-500 text-sm">Status</p>
                                    <p className="text-white font-medium">{movie.status}</p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                            {trailer && (
                                <button
                                    onClick={() => setShowTrailer(true)}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <FiPlay className="w-5 h-5" />
                                    Watch Trailer
                                </button>
                            )}

                            <button
                                onClick={handleFavorite}
                                className={`btn-secondary flex items-center gap-2 ${isFavorite ? 'bg-red-500/20 border-red-500/50' : ''}`}
                            >
                                <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                                {isFavorite ? 'Favorited' : 'Add Favorite'}
                            </button>

                            <button
                                onClick={handleWatchlist}
                                className={`btn-secondary flex items-center gap-2 ${inWatchlist ? 'bg-blue-500/20 border-blue-500/50' : ''}`}
                            >
                                <FiBookmark className={`w-5 h-5 ${inWatchlist ? 'fill-blue-500 text-blue-500' : ''}`} />
                                {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                            </button>

                            {movie.homepage && (
                                <a
                                    href={movie.homepage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-ghost flex items-center gap-2"
                                >
                                    <FiExternalLink className="w-5 h-5" />
                                    Official Site
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Cast Section */}
                {cast && cast.length > 0 && (
                    <section className="mt-16">
                        <h2 className="section-title">Top Cast</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {cast.map((person) => (
                                <Link to={`/person/${person.id}`} key={person.id} className="glass-card p-4 text-center block hover:bg-white/10 transition-colors">
                                    <img
                                        src={getImageUrl(person.profile_path, 'w185')}
                                        alt={person.name}
                                        className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/185x185?text=No+Image';
                                        }}
                                    />
                                    <h4 className="text-white font-medium text-sm line-clamp-1">{person.name}</h4>
                                    <p className="text-gray-500 text-xs line-clamp-1">{person.character}</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Reviews Section */}
                <section className="mt-16">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="section-title">Reviews</h2>
                        {user && (
                            <button
                                onClick={() => setShowReviewForm(!showReviewForm)}
                                className="btn-primary"
                            >
                                Write Review
                            </button>
                        )}
                    </div>

                    {/* Review Form */}
                    {showReviewForm && (
                        <form onSubmit={handleSubmitReview} className="glass-card p-6 mb-8 animate-slide-up">
                            <h3 className="text-lg font-semibold text-white mb-4">Your Review</h3>

                            <div className="mb-4">
                                <label className="block text-gray-400 text-sm mb-2">Rating</label>
                                <StarRating rating={reviewRating} onRate={setReviewRating} />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-400 text-sm mb-2">Comment</label>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="Write your thoughts about this movie..."
                                    className="input-dark min-h-[120px] resize-none"
                                    maxLength={1000}
                                />
                                <p className="text-gray-500 text-xs mt-1">{reviewComment.length}/1000</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="btn-primary"
                                >
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowReviewForm(false)}
                                    className="btn-ghost"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Reviews List */}
                    {reviews.length > 0 ? (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review._id} className="glass-card p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                                            <span className="text-white font-semibold">
                                                {review.user?.name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-white font-medium">{review.user?.name}</h4>
                                                <div className="flex items-center gap-1 text-yellow-400">
                                                    <FiStar className="w-4 h-4 fill-current" />
                                                    <span>{review.rating}/10</span>
                                                </div>
                                                <span className="text-gray-500 text-sm">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-300">{review.comment}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 glass-card">
                            <div className="text-4xl mb-3">💬</div>
                            <p className="text-gray-400">No reviews yet. Be the first to review!</p>
                        </div>
                    )}
                </section>

                {/* Similar Movies */}
                {similarMovies.length > 0 && (
                    <section className="mt-16">
                        <MovieSlider title="Similar Movies" movies={similarMovies} />
                    </section>
                )}
            </div>

            {/* Trailer Modal */}
            {showTrailer && trailer && (
                <TrailerModal
                    videoKey={trailer.key}
                    onClose={() => setShowTrailer(false)}
                />
            )}
        </div>
    );
};

export default MovieDetails;
