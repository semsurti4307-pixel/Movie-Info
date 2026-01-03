import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiGrid, FiList, FiChevronDown, FiX } from 'react-icons/fi';
import { moviesAPI } from '../services/api';
import MovieCard from '../components/MovieCard';

const Movies = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [movies, setMovies] = useState([]);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid');

    // Filter states
    const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || '');
    const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || '');
    const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'popularity.desc');
    const [category, setCategory] = useState(searchParams.get('category') || '');

    // Sync state with URL params when navigating between pages
    useEffect(() => {
        setCategory(searchParams.get('category') || '');
        setSelectedGenre(searchParams.get('genre') || '');
        setSelectedYear(searchParams.get('year') || '');
        setSelectedSort(searchParams.get('sort') || 'popularity.desc');
        setPage(1);
    }, [searchParams]);

    const sortOptions = [
        { value: 'popularity.desc', label: 'Most Popular' },
        { value: 'popularity.asc', label: 'Least Popular' },
        { value: 'vote_average.desc', label: 'Highest Rated' },
        { value: 'vote_average.asc', label: 'Lowest Rated' },
        { value: 'primary_release_date.desc', label: 'Newest First' },
        { value: 'primary_release_date.asc', label: 'Oldest First' },
        { value: 'original_title.asc', label: 'Title A-Z' },
        { value: 'original_title.desc', label: 'Title Z-A' },
    ];

    const years = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString());

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await moviesAPI.getGenres();
                setGenres(response.data.genres);
            } catch (error) {
                console.error('Error fetching genres:', error);
            }
        };
        fetchGenres();
    }, []);

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            try {
                let response;

                if (category) {
                    switch (category) {
                        case 'trending':
                            response = await moviesAPI.getTrending();
                            break;
                        case 'popular':
                            response = await moviesAPI.getPopular(page);
                            break;
                        case 'top-rated':
                            response = await moviesAPI.getTopRated(page);
                            break;
                        case 'upcoming':
                            response = await moviesAPI.getUpcoming(page);
                            break;
                        default:
                            response = await moviesAPI.getPopular(page);
                    }
                } else if (selectedGenre) {
                    response = await moviesAPI.getMoviesByGenre(selectedGenre, page);
                } else {
                    response = await moviesAPI.discoverMovies({
                        page,
                        sort_by: selectedSort,
                        year: selectedYear,
                        with_genres: selectedGenre,
                    });
                }

                setMovies(response.data.results);
                setTotalPages(Math.min(response.data.total_pages, 500));
            } catch (error) {
                console.error('Error fetching movies:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, [page, selectedGenre, selectedYear, selectedSort, category]);

    const handleFilterChange = (key, value) => {
        setPage(1);
        setCategory('');

        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        newParams.delete('category');
        setSearchParams(newParams);

        switch (key) {
            case 'genre':
                setSelectedGenre(value);
                break;
            case 'year':
                setSelectedYear(value);
                break;
            case 'sort':
                setSelectedSort(value);
                break;
        }
    };

    const clearFilters = () => {
        setSelectedGenre('');
        setSelectedYear('');
        setSelectedSort('popularity.desc');
        setCategory('');
        setPage(1);
        setSearchParams({});
    };

    const getCategoryTitle = () => {
        switch (category) {
            case 'trending':
                return '🔥 Trending Movies';
            case 'popular':
                return '🚀 Popular Movies';
            case 'top-rated':
                return '⭐ Top Rated Movies';
            case 'upcoming':
                return '📅 Upcoming Movies';
            default:
                return '🎬 All Movies';
        }
    };

    const SkeletonCard = () => (
        <div className="w-full">
            <div className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
            <div className="mt-3">
                <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-white/5 rounded w-1/2 mt-2 animate-pulse" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-dark-500 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="section-title">{getCategoryTitle()}</h1>

                    <div className="flex items-center gap-3">
                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-white/5 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                <FiGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                <FiList className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showFilters ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            <FiFilter className="w-5 h-5" />
                            Filters
                        </button>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="glass-card p-6 mb-8 animate-slide-up">
                        <div className="flex flex-wrap gap-6">
                            {/* Genre Filter */}
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Genre</label>
                                <div className="relative">
                                    <select
                                        value={selectedGenre}
                                        onChange={(e) => handleFilterChange('genre', e.target.value)}
                                        className="w-full input-dark appearance-none pr-10"
                                    >
                                        <option value="">All Genres</option>
                                        {genres.map((genre) => (
                                            <option key={genre.id} value={genre.id}>
                                                {genre.name}
                                            </option>
                                        ))}
                                    </select>
                                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Year Filter */}
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Year</label>
                                <div className="relative">
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => handleFilterChange('year', e.target.value)}
                                        className="w-full input-dark appearance-none pr-10"
                                    >
                                        <option value="">All Years</option>
                                        {years.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Sort Filter */}
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
                                <div className="relative">
                                    <select
                                        value={selectedSort}
                                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                                        className="w-full input-dark appearance-none pr-10"
                                    >
                                        {sortOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Clear Filters */}
                            <div className="flex items-end">
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-white transition-colors"
                                >
                                    <FiX className="w-5 h-5" />
                                    Clear All
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Filters Display */}
                {(selectedGenre || selectedYear || category) && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {category && (
                            <span className="badge-primary">
                                {getCategoryTitle().replace(/[🔥🚀⭐📅🎬]/g, '').trim()}
                                <button onClick={clearFilters} className="ml-2 hover:text-white">
                                    <FiX className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {selectedGenre && (
                            <span className="badge-secondary">
                                {genres.find(g => g.id.toString() === selectedGenre)?.name}
                                <button onClick={() => handleFilterChange('genre', '')} className="ml-2 hover:text-white">
                                    <FiX className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {selectedYear && (
                            <span className="badge-secondary">
                                {selectedYear}
                                <button onClick={() => handleFilterChange('year', '')} className="ml-2 hover:text-white">
                                    <FiX className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                    </div>
                )}

                {/* Movies Grid */}
                <div className={`grid gap-10 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'grid-cols-1 md:grid-cols-2'}`}>
                    {loading
                        ? Array(20).fill(0).map((_, i) => <SkeletonCard key={i} />)
                        : movies.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} size="full" />
                        ))
                    }
                </div>

                {/* Empty State */}
                {!loading && movies.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🎬</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No movies found</h3>
                        <p className="text-gray-400">Try adjusting your filters</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                        >
                            Previous
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (page <= 3) {
                                    pageNum = i + 1;
                                } else if (page >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${page === pageNum
                                            ? 'bg-red-500 text-white'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-lg bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Movies;
