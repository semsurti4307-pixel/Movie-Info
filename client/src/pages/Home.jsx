import { useState, useEffect } from 'react';
import { moviesAPI } from '../services/api';
import HeroBanner from '../components/HeroBanner';
import MovieSlider from '../components/MovieSlider';

const Home = () => {
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [popularMovies, setPopularMovies] = useState([]);
    const [topRatedMovies, setTopRatedMovies] = useState([]);
    const [upcomingMovies, setUpcomingMovies] = useState([]);
    const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const [trending, popular, topRated, upcoming, nowPlaying] = await Promise.all([
                    moviesAPI.getTrending(),
                    moviesAPI.getPopular(),
                    moviesAPI.getTopRated(),
                    moviesAPI.getUpcoming(),
                    moviesAPI.getNowPlaying(),
                ]);

                setTrendingMovies(trending.data.results);
                setPopularMovies(popular.data.results);
                setTopRatedMovies(topRated.data.results);
                setUpcomingMovies(upcoming.data.results);
                setNowPlayingMovies(nowPlaying.data.results);
            } catch (error) {
                console.error('Error fetching movies:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    return (
        <div className="min-h-screen bg-dark-500">
            {/* Hero Banner */}
            <HeroBanner movies={trendingMovies.slice(0, 5)} />

            {/* Movie Sections */}
            <div className="max-w-7xl mx-auto py-8 -mt-32 relative z-10">
                <MovieSlider
                    title="🔥 Trending This Week"
                    movies={trendingMovies}
                    loading={loading}
                />

                <MovieSlider
                    title="🎬 Now Playing"
                    movies={nowPlayingMovies}
                    loading={loading}
                />

                <MovieSlider
                    title="⭐ Top Rated"
                    movies={topRatedMovies}
                    loading={loading}
                />

                <MovieSlider
                    title="🚀 Popular Movies"
                    movies={popularMovies}
                    loading={loading}
                />

                <MovieSlider
                    title="📅 Coming Soon"
                    movies={upcomingMovies}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default Home;
