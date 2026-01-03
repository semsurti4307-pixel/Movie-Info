import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiMenu, FiX, FiUser, FiLogOut, FiHeart, FiBookmark, FiSettings } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const profileRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setShowSearch(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsProfileOpen(false);
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Movies', path: '/movies' },
        { name: 'Trailers', path: '/trailers' },
        { name: 'Trending', path: '/movies?category=trending' },
        { name: 'Top Rated', path: '/movies?category=top-rated' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-dark-500/95 backdrop-blur-lg shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:shadow-red-500/50 transition-shadow">
                            <span className="text-white font-bold text-xl">M</span>
                        </div>
                        <span className="text-xl font-bold text-white hidden sm:block">
                            Movie<span className="text-red-500">Info</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-gray-300 hover:text-white font-medium transition-colors relative group"
                            >
                                {link.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all group-hover:w-full" />
                            </Link>
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className={`relative ${showSearch ? 'flex' : 'hidden md:flex'}`}>
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder="Search movies..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-48 lg:w-64 px-4 py-2 pl-10 rounded-full bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50 focus:bg-white/15 transition-all"
                                />
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </form>
                        </div>

                        {/* Mobile Search Toggle */}
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className="md:hidden p-2 text-gray-300 hover:text-white"
                        >
                            <FiSearch className="w-5 h-5" />
                        </button>

                        {/* Auth Buttons / Profile */}
                        {user ? (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="hidden lg:block text-white font-medium">{user.name}</span>
                                </button>

                                {/* Profile Dropdown */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 py-2 glass-card-dark shadow-xl animate-scale-in">
                                        <div className="px-4 py-3 border-b border-white/10">
                                            <p className="text-white font-semibold">{user.name}</p>
                                            <p className="text-gray-400 text-sm">{user.email}</p>
                                        </div>

                                        <Link
                                            to="/profile"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            <FiUser className="w-4 h-4" />
                                            My Profile
                                        </Link>

                                        <Link
                                            to="/profile?tab=favorites"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            <FiHeart className="w-4 h-4" />
                                            Favorites
                                        </Link>

                                        <Link
                                            to="/profile?tab=watchlist"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            <FiBookmark className="w-4 h-4" />
                                            Watchlist
                                        </Link>

                                        {isAdmin && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors"
                                            >
                                                <FiSettings className="w-4 h-4" />
                                                Admin Panel
                                            </Link>
                                        )}

                                        <div className="border-t border-white/10 mt-2 pt-2">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                                            >
                                                <FiLogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-3">
                                <Link to="/login" className="btn-ghost">
                                    Sign In
                                </Link>
                                <Link to="/register" className="btn-primary !py-2 !px-4">
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-gray-300 hover:text-white"
                        >
                            {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/10 animate-slide-up">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className="block py-3 text-gray-300 hover:text-white font-medium transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}

                        {!user && (
                            <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex-1 text-center py-2.5 rounded-lg bg-white/10 text-white font-medium"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex-1 btn-primary !py-2.5 text-center"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
