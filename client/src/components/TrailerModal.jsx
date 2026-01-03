import { useState, useEffect } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';

const TrailerModal = ({ videoKey, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="modal-backdrop animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div className="relative w-full max-w-5xl mx-4 animate-scale-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                    <FiX className="w-6 h-6" />
                </button>

                {/* Video Container */}
                <div className="relative aspect-video bg-dark-400 rounded-xl overflow-hidden shadow-2xl">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <FiLoader className="w-12 h-12 text-red-500 animate-spin" />
                        </div>
                    )}

                    <iframe
                        src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
                        title="Movie Trailer"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                        onLoad={() => setIsLoading(false)}
                    />
                </div>
            </div>
        </div>
    );
};

export default TrailerModal;
