'use client';

import React, { useState } from 'react';
import dayjs from 'dayjs';
import clsx from 'clsx';

interface CompactCalendarProps {
    selectedDates: Date[];
    onChange: (dates: Date[]) => void;
}

export const CompactCalendar: React.FC<CompactCalendarProps> = ({ selectedDates, onChange }) => {
    const [currentMonth, setCurrentMonth] = useState(dayjs());

    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    const startDate = startOfMonth.startOf('week');
    const endDate = endOfMonth.endOf('week');

    const days = [];
    let day = startDate;

    while (day.isBefore(endDate) || day.isSame(endDate, 'day')) {
        days.push(day);
        day = day.add(1, 'day');
    }

    const isSelected = (date: dayjs.Dayjs) => {
        return selectedDates.some(d => dayjs(d).isSame(date, 'day'));
    };

    const toggleDate = (date: dayjs.Dayjs) => {
        const dateObj = date.toDate();
        const isAlreadySelected = selectedDates.some(d => dayjs(d).isSame(date, 'day'));

        if (isAlreadySelected) {
            onChange(selectedDates.filter(d => !dayjs(d).isSame(date, 'day')));
        } else {
            onChange([...selectedDates, dateObj]);
        }
    };

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <div className="flex flex-col gap-3 bg-sixth border border-fifth rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
                    className="p-1 hover:bg-fifth rounded"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <span className="text-sm font-semibold text-textColor">
                    {currentMonth.format('MMMM YYYY')}
                </span>
                <button
                    onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))}
                    className="p-1 hover:bg-fifth rounded"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-[10px] font-bold text-customColor18 py-1">
                        {day}
                    </div>
                ))}
                {days.map((day, index) => {
                    const isCurrentMonth = day.month() === currentMonth.month();
                    const isToday = day.isSame(dayjs(), 'day');
                    const selected = isSelected(day);

                    return (
                        <button
                            key={index}
                            onClick={() => isCurrentMonth && toggleDate(day)}
                            disabled={!isCurrentMonth}
                            className={clsx(
                                'aspect-square text-xs rounded flex items-center justify-center transition-all',
                                !isCurrentMonth && 'text-customColor18 opacity-30 cursor-not-allowed',
                                isCurrentMonth && !selected && 'hover:bg-fifth text-textColor',
                                selected && 'bg-forth text-white font-bold',
                                isToday && !selected && 'border border-forth'
                            )}
                        >
                            {day.date()}
                        </button>
                    );
                })}
            </div>

            <div className="text-xs text-customColor18 mt-2">
                {selectedDates.length} dia(s) selecionado(s)
            </div>
        </div>
    );
};
