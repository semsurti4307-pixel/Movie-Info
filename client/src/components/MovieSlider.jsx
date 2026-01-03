import { useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import MovieCard from './MovieCard';

const MovieSlider = ({ title, movies, loading = false }) => {
    const sliderRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const handleScroll = () => {
        if (sliderRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    const scroll = (direction) => {
        if (sliderRef.current) {
            const scrollAmount = sliderRef.current.clientWidth * 0.8;
            sliderRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Skeleton loading cards
    const SkeletonCard = () => (
        <div className="flex-shrink-0 w-44 md:w-52">
            <div className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
            <div className="mt-3 px-1">
                <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-white/5 rounded w-1/2 mt-2 animate-pulse" />
            </div>
        </div>
    );

    return (
        <section className="relative py-6">
            {/* Title */}
            {title && (
                <h2 className="section-title px-4 mb-4">{title}</h2>
            )}

            {/* Slider Container */}
            <div className="relative group">
                {/* Left Arrow */}
                {showLeftArrow && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/80 text-white flex items-center justify-center transition-all duration-300 hover:bg-red-600 shadow-lg ml-2"
                        aria-label="Scroll left"
                    >
                        <FiChevronLeft className="w-6 h-6" />
                    </button>
                )}

                {/* Right Arrow */}
                {showRightArrow && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/80 text-white flex items-center justify-center transition-all duration-300 hover:bg-red-600 shadow-lg mr-2"
                        aria-label="Scroll right"
                    >
                        <FiChevronRight className="w-6 h-6" />
                    </button>
                )}

                {/* Movies Container */}
                <div
                    ref={sliderRef}
                    onScroll={handleScroll}
                    className="flex gap-10 overflow-x-auto pb-4 px-4 scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {loading
                        ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
                        : movies?.map((movie) => (
                            <div key={movie.id} className="flex-shrink-0">
                                <MovieCard movie={movie} />
                            </div>
                        ))
                    }
                </div>
            </div>
        </section>
    );
};

export default MovieSlider;
