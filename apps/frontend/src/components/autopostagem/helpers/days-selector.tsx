'use client';

import React from 'react';
import clsx from 'clsx';

interface DaysSelectorProps {
    selected: number[];
    onChange: (days: number[]) => void;
}

const days = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' },
];

export const DaysSelector: React.FC<DaysSelectorProps> = ({ selected, onChange }) => {
    const toggleDay = (dayValue: number) => {
        const newSelected = selected.includes(dayValue)
            ? selected.filter((v) => v !== dayValue)
            : [...selected, dayValue].sort();
        onChange(newSelected);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-forth rounded-full"></div>
                <label className="text-sm font-bold text-textColor/90">Dias da Semana</label>
            </div>
            <div className="flex flex-wrap gap-2">
                {days.map((day) => {
                    const isSelected = selected.includes(day.value);
                    return (
                        <div
                            key={day.value}
                            onClick={() => toggleDay(day.value)}
                            className={clsx(
                                'w-12 h-12 flex items-center justify-center rounded-xl border-2 cursor-pointer transition-all text-xs font-bold transform hover:scale-105 active:scale-95',
                                isSelected
                                    ? 'bg-forth border-forth text-white shadow-[0_5px_15px_rgba(97,42,213,0.4)]'
                                    : 'bg-sixth/50 border-black/5 dark:border-white/5 text-textColor/60 hover:border-forth/50 hover:text-forth hover:bg-forth/5'
                            )}
                        >
                            {day.label}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
