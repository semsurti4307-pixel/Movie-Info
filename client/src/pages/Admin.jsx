import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiFilm, FiMessageSquare, FiTrendingUp, FiTrash2, FiEdit2, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { adminAPI } from '../services/api';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'dashboard') {
                const response = await adminAPI.getStats();
                setStats(response.data);
            } else if (activeTab === 'users') {
                const response = await adminAPI.getUsers();
                setUsers(response.data);
            } else if (activeTab === 'reviews') {
                const response = await adminAPI.getReviews();
                setReviews(response.data);
            }
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('Delete this user?')) return;
        try {
            await adminAPI.deleteUser(id);
            setUsers(users.filter(u => u._id !== id));
            toast.success('User deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleDeleteReview = async (id) => {
        if (!confirm('Delete this review?')) return;
        try {
            await adminAPI.deleteReview(id);
            setReviews(reviews.filter(r => r._id !== id));
            toast.success('Review deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleUpdateRole = async (id, role) => {
        try {
            await adminAPI.updateUserRole(id, role);
            setUsers(users.map(u => u._id === id ? { ...u, role } : u));
            toast.success('Role updated');
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    const tabs = [
        { id: 'dashboard', name: 'Dashboard', icon: FiTrendingUp },
        { id: 'users', name: 'Users', icon: FiUsers },
        { id: 'reviews', name: 'Reviews', icon: FiMessageSquare },
    ];

    return (
        <div className="min-h-screen bg-dark-500 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>

                {/* Tabs */}
                <div className="flex gap-2 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === tab.id ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.name}
                        </button>
                    ))}
                </div>

                {loading && (
                    <div className="flex justify-center py-20">
                        <FiLoader className="w-12 h-12 text-red-500 animate-spin" />
                    </div>
                )}

                {/* Dashboard */}
                {!loading && activeTab === 'dashboard' && stats && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="glass-card p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <FiUsers className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Total Users</p>
                                        <p className="text-2xl font-bold text-white">{stats.stats.totalUsers}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="glass-card p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                                        <FiMessageSquare className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Total Reviews</p>
                                        <p className="text-2xl font-bold text-white">{stats.stats.totalReviews}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="glass-card p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                        <FiFilm className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Featured Movies</p>
                                        <p className="text-2xl font-bold text-white">{stats.stats.totalFeaturedMovies}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
                                <div className="space-y-3">
                                    {stats.recentUsers?.map((user) => (
                                        <div key={user._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <div>
                                                <p className="text-white font-medium">{user.name}</p>
                                                <p className="text-gray-500 text-sm">{user.email}</p>
                                            </div>
                                            <span className="text-gray-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Recent Reviews</h3>
                                <div className="space-y-3">
                                    {stats.recentReviews?.map((review) => (
                                        <div key={review._id} className="p-3 bg-white/5 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-white font-medium">{review.user?.name}</p>
                                                <span className="text-yellow-400">⭐ {review.rating}/10</span>
                                            </div>
                                            <p className="text-gray-400 text-sm line-clamp-2">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {!loading && activeTab === 'users' && (
                    <div className="glass-card overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="text-left p-4 text-gray-400 font-medium">User</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Role</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Joined</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-white/5">
                                        <td className="p-4">
                                            <p className="text-white font-medium">{user.name}</p>
                                            <p className="text-gray-500 text-sm">{user.email}</p>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                                                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleDeleteUser(user._id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg">
                                                <FiTrash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Reviews Tab */}
                {!loading && activeTab === 'reviews' && (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review._id} className="glass-card p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <p className="text-white font-medium">{review.user?.name}</p>
                                            <span className="text-yellow-400">⭐ {review.rating}/10</span>
                                            <span className="text-gray-500 text-sm">Movie ID: {review.movieId}</span>
                                        </div>
                                        <p className="text-gray-300">{review.comment}</p>
                                        <p className="text-gray-500 text-sm mt-2">{new Date(review.createdAt).toLocaleString()}</p>
                                    </div>
                                    <button onClick={() => handleDeleteReview(review._id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg">
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
