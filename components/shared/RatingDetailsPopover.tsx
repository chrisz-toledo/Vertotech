
import React from 'react';
import { RatingStars } from './RatingStars';

interface RatingDetailsPopoverProps<T extends object> {
    rating: T;
    labels: Record<keyof T, string>;
    specialtyFieldName?: keyof T;
    specialtyDescription?: string;
}

export function RatingDetailsPopover<T extends object>({
    rating,
    labels,
    specialtyFieldName,
    specialtyDescription,
}: RatingDetailsPopoverProps<T>) {

    return (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 bg-white border border-gray-200 shadow-xl rounded-lg p-4 z-10">
            <h4 className="font-bold text-gray-800 mb-3 text-center">Detalles de Calificación</h4>
            <ul className="space-y-2 text-sm">
                {(Object.keys(labels) as Array<keyof T>).map((key) => {
                    const isSpecialty = key === specialtyFieldName;
                    if (isSpecialty && !specialtyDescription) return null;

                    return (
                        <li key={key as string} className={`${isSpecialty ? 'pt-2 mt-2 border-t border-gray-200' : ''}`}>
                            <div className="flex justify-between items-start gap-4">
                                <span className="text-gray-600 flex-1 truncate pt-0.5" title={labels[key]}>
                                    {labels[key]}
                                </span>
                                <div className="flex flex-col items-end flex-shrink-0">
                                    <RatingStars rating={rating[key] as number} starClassName="w-4 h-4" />
                                    {isSpecialty && (
                                        <p className="text-xs italic text-gray-500 mt-1">{specialtyDescription}</p>
                                    )}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-3 h-3 bg-white border-b border-r border-gray-200 transform rotate-45 -mb-1.5"></div>
        </div>
    );
}
