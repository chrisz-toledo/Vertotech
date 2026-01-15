
import React from 'react';
import { StarIcon } from '../icons/StarIcon';

interface RatingStarsProps {
    rating: number;
    totalStars?: number;
    starClassName?: string;
    containerClassName?: string;
    onRate?: (value: number) => void;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
    rating,
    totalStars = 5,
    starClassName = 'w-6 h-6',
    containerClassName = 'flex items-center gap-1',
    onRate,
}) => {
    return (
        <div className={containerClassName}>
            {Array.from({ length: totalStars }, (_, i) => i + 1).map((star) => {
                const isInteractive = !!onRate;
                const starElement = (
                    <StarIcon
                        key={star}
                        className={`${starClassName} ${rating >= star ? 'text-amber-400' : 'text-gray-300'} ${isInteractive ? 'hover:scale-110' : ''} transition-all`}
                    />
                );

                if (isInteractive) {
                    return (
                        <button
                            type="button"
                            key={star}
                            onClick={() => onRate(star)}
                            className="p-1 rounded-full"
                            title={`Calificar ${star} estrella(s)`}
                        >
                            {starElement}
                        </button>
                    );
                }
                return starElement;
            })}
        </div>
    );
};
