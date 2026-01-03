import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSearch, FiLoader } from 'react-icons/fi';
import { moviesAPI } from '../services/api';
import MovieCard from '../components/MovieCard';

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(query);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    useEffect(() => {
        if (query) {
            setSearchQuery(query);
            fetchSearchResults(query, 1);
        }
    }, [query]);

    const fetchSearchResults = async (searchTerm, pageNum) => {
        if (!searchTerm.trim()) return;

        setLoading(true);
        try {
            const response = await moviesAPI.searchMovies(searchTerm.trim(), pageNum);
            setMovies(response.data.results);
            setTotalPages(Math.min(response.data.total_pages, 500));
            setTotalResults(response.data.total_results);
            setPage(pageNum);
        } catch (error) {
            console.error('Error searching movies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setSearchParams({ q: searchQuery.trim() });
        }
    };

    const handlePageChange = (newPage) => {
        fetchSearchResults(query, newPage);
        window.scrollTo(0, 0);
    };

    return (
        <div className="min-h-screen bg-dark-500 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Search Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Search Movies
                    </h1>
                    <p className="text-gray-400 mb-8">
                        Find your favorite movies, actors, and more
                    </p>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for movies..."
                                className="w-full px-6 py-4 pl-14 rounded-full bg-white/10 border border-white/20 text-white text-lg placeholder-gray-400 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                            />
                            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary !py-2.5"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results Count */}
                {query && !loading && (
                    <div className="mb-6">
                        <p className="text-gray-400">
                            {totalResults > 0 ? (
                                <>
                                    Found <span className="text-white font-semibold">{totalResults.toLocaleString()}</span> results for{' '}
                                    "<span className="text-red-400">{query}</span>"
                                </>
                            ) : (
                                <>No results found for "<span className="text-red-400">{query}</span>"</>
                            )}
                        </p>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <FiLoader className="w-12 h-12 text-red-500 animate-spin" />
                    </div>
                )}

                {/* Results Grid */}
                {!loading && movies.length > 0 && (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-10">
                            {movies.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} size="full" />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-12">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
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
                                                onClick={() => handlePageChange(pageNum)}
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
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 rounded-lg bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Empty State */}
                {!loading && !query && (
                    <div className="text-center py-20">
                        <div className="text-8xl mb-6">🔍</div>
                        <h3 className="text-2xl font-bold text-white mb-2">Start searching</h3>
                        <p className="text-gray-400 mb-8">Enter a movie name to find what you're looking for</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {['Avengers', 'Spider-Man', 'Batman', 'Star Wars', 'Marvel'].map((term) => (
                                <button
                                    key={term}
                                    onClick={() => {
                                        setSearchQuery(term);
                                        setSearchParams({ q: term });
                                    }}
                                    className="px-4 py-2 rounded-full bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition-colors"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Results */}
                {!loading && query && movies.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-8xl mb-6">😔</div>
                        <h3 className="text-2xl font-bold text-white mb-2">No movies found</h3>
                        <p className="text-gray-400 mb-8">Try searching with different keywords</p>
                        <Link to="/movies" className="btn-primary">
                            Browse All Movies
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
