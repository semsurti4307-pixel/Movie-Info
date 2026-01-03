import { FiStar } from 'react-icons/fi';

const StarRating = ({ rating, onRate, readonly = false, size = 'md' }) => {
    const sizes = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-3xl'
    };

    const stars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    return (
        <div className={`star-rating ${sizes[size]}`}>
            {stars.map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => !readonly && onRate?.(star)}
                    className={`transition-all ${star <= rating
                            ? 'text-yellow-400 scale-100'
                            : 'text-gray-600 hover:text-yellow-300'
                        } ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                >
                    <FiStar className={star <= rating ? 'fill-current' : ''} />
                </button>
            ))}
        </div>
    );
};

export default StarRating;
