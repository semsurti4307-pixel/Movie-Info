import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram, FiMail, FiHeart } from 'react-icons/fi';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        'Browse': [
            { name: 'Trending', path: '/movies?category=trending' },
            { name: 'Popular', path: '/movies?category=popular' },
            { name: 'Top Rated', path: '/movies?category=top-rated' },
            { name: 'Upcoming', path: '/movies?category=upcoming' },
        ],
        'Genres': [
            { name: 'Action', path: '/movies?genre=28' },
            { name: 'Comedy', path: '/movies?genre=35' },
            { name: 'Drama', path: '/movies?genre=18' },
            { name: 'Horror', path: '/movies?genre=27' },
        ],
        'Account': [
            { name: 'Profile', path: '/profile' },
            { name: 'Favorites', path: '/profile?tab=favorites' },
            { name: 'Watchlist', path: '/profile?tab=watchlist' },
            { name: 'Settings', path: '/profile?tab=settings' },
        ],
    };

    return (
        <footer className="bg-dark-400 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                    {/* Brand */}
                    <div className="col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-lg shadow-red-500/30">
                                <span className="text-white font-bold text-xl">M</span>
                            </div>
                            <span className="text-xl font-bold text-white">
                                Movie<span className="text-red-500">Info</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm mb-6 max-w-xs">
                            Your ultimate destination for discovering, exploring, and saving your favorite movies.
                            Get complete information about any movie.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="#"
                                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                            >
                                <FiTwitter className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                            >
                                <FiInstagram className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                            >
                                <FiGithub className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                            >
                                <FiMail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h4 className="text-white font-semibold mb-4">{title}</h4>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            to={link.path}
                                            className="text-gray-400 hover:text-white text-sm transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm">
                        © {currentYear} MovieInfo. All rights reserved.
                    </p>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                        Made with <FiHeart className="text-red-500 w-4 h-4" /> using TMDB API
                    </p>
                    <div className="flex gap-6 text-sm">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                            Terms of Service
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
