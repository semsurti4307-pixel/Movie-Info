import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiUser, FiHeart, FiBookmark, FiClock, FiEdit2, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { userAPI, authAPI } from '../services/api';
import MovieCard from '../components/MovieCard';

const Profile = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'profile';
    const { user, updateUser } = useAuth();

    const [favorites, setFavorites] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');

    const tabs = [
        { id: 'profile', name: 'Profile', icon: FiUser },
        { id: 'favorites', name: 'Favorites', icon: FiHeart },
        { id: 'watchlist', name: 'Watchlist', icon: FiBookmark },
        { id: 'recent', name: 'Recently Viewed', icon: FiClock },
    ];

    useEffect(() => {
        if (activeTab === 'favorites') fetchFavorites();
        else if (activeTab === 'watchlist') fetchWatchlist();
        else if (activeTab === 'recent') fetchRecentlyViewed();
    }, [activeTab]);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const response = await userAPI.getFavorites();
            setFavorites(response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWatchlist = async () => {
        setLoading(true);
        try {
            const response = await userAPI.getWatchlist();
            setWatchlist(response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentlyViewed = async () => {
        setLoading(true);
        try {
            const response = await userAPI.getRecentlyViewed();
            setRecentlyViewed(response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await authAPI.updateProfile({ name, email });
            updateUser(response.data);
            setEditMode(false);
            toast.success('Profile updated!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update');
        }
    };

    const renderMovieGrid = (movies) => (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-10">
            {movies.map((movie) => <MovieCard key={movie.id} movie={movie} size="full" />)}
        </div>
    );

    const renderEmptyState = (icon, title, desc) => (
        <div className="text-center py-20 glass-card">
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400">{desc}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-dark-500 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-3xl font-bold text-white">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                        <p className="text-gray-400">{user?.email}</p>
                        {user?.role === 'admin' && <span className="badge-primary mt-2">Admin</span>}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSearchParams({ tab: tab.id })}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <FiLoader className="w-12 h-12 text-red-500 animate-spin" />
                    </div>
                )}

                {!loading && activeTab === 'profile' && (
                    <div className="glass-card p-8 max-w-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Profile Settings</h2>
                            <button onClick={() => setEditMode(!editMode)} className="btn-ghost flex items-center gap-2">
                                <FiEdit2 /> {editMode ? 'Cancel' : 'Edit'}
                            </button>
                        </div>
                        {editMode ? (
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Name</label>
                                    <input value={name} onChange={(e) => setName(e.target.value)} className="input-dark" />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Email</label>
                                    <input value={email} onChange={(e) => setEmail(e.target.value)} className="input-dark" />
                                </div>
                                <button type="submit" className="btn-primary">Save Changes</button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div><p className="text-gray-500 text-sm">Name</p><p className="text-white">{user?.name}</p></div>
                                <div><p className="text-gray-500 text-sm">Email</p><p className="text-white">{user?.email}</p></div>
                                <div><p className="text-gray-500 text-sm">Role</p><p className="text-white capitalize">{user?.role}</p></div>
                            </div>
                        )}
                    </div>
                )}

                {!loading && activeTab === 'favorites' && (
                    favorites.length > 0 ? renderMovieGrid(favorites) : renderEmptyState('❤️', 'No favorites yet', 'Movies you love will appear here')
                )}

                {!loading && activeTab === 'watchlist' && (
                    watchlist.length > 0 ? renderMovieGrid(watchlist) : renderEmptyState('📑', 'Watchlist is empty', 'Add movies to watch later')
                )}

                {!loading && activeTab === 'recent' && (
                    recentlyViewed.length > 0 ? renderMovieGrid(recentlyViewed) : renderEmptyState('🕐', 'No history yet', 'Movies you view will appear here')
                )}
            </div>
        </div>
    );
};

export default Profile;
