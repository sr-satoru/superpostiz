'use client';

import React, { useState } from 'react';
import dayjs from 'dayjs';
import clsx from 'clsx';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

interface CalendarAutomationProps {
    selectedDates?: Date[];
    onDatesChange?: (dates: Date[]) => void;
}

export const CalendarAutomation: React.FC<CalendarAutomationProps> = ({
    selectedDates = [],
    onDatesChange
}) => {
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
        if (!onDatesChange) return;

        const dateObj = date.toDate();
        const isAlreadySelected = selectedDates.some(d => dayjs(d).isSame(date, 'day'));

        if (isAlreadySelected) {
            onDatesChange(selectedDates.filter(d => !dayjs(d).isSame(date, 'day')));
        } else {
            onDatesChange([...selectedDates, dateObj]);
        }
    };

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const goToPreviousMonth = () => {
        setCurrentMonth(currentMonth.subtract(1, 'month'));
    };

    const goToNextMonth = () => {
        setCurrentMonth(currentMonth.add(1, 'month'));
    };

    const goToToday = () => {
        setCurrentMonth(dayjs());
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Header com navegação */}
            <div className="flex items-center justify-between">
                <button
                    onClick={goToPreviousMonth}
                    className="p-2 hover:bg-fifth rounded-lg transition-colors"
                    title="Mês anterior"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M12 16L6 10L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <div className="flex flex-col items-center">
                    <span className="text-base font-semibold text-textColor capitalize">
                        {currentMonth.format('MMMM')}
                    </span>
                    <span className="text-xs text-customColor18">
                        {currentMonth.format('YYYY')}
                    </span>
                </div>

                <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-fifth rounded-lg transition-colors"
                    title="Próximo mês"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M8 4L14 10L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            {/* Grid do calendário */}
            <div className="flex-1 flex flex-col gap-2">
                {/* Dias da semana */}
                <div className="grid grid-cols-7 gap-1">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-[11px] font-bold text-customColor18 py-1">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Dias do mês */}
                <div className="grid grid-cols-7 gap-1 flex-1">
                    {days.map((day, index) => {
                        const isCurrentMonth = day.month() === currentMonth.month();
                        const isToday = day.isSame(dayjs(), 'day');
                        const selected = isSelected(day);
                        const isPast = day.isBefore(dayjs(), 'day');

                        return (
                            <button
                                key={index}
                                onClick={() => isCurrentMonth && !isPast && toggleDate(day)}
                                disabled={!isCurrentMonth || isPast}
                                className={clsx(
                                    'aspect-square text-sm rounded-lg flex items-center justify-center transition-all font-medium',
                                    !isCurrentMonth && 'text-customColor18 opacity-20 cursor-not-allowed',
                                    isPast && isCurrentMonth && 'text-customColor18 opacity-40 cursor-not-allowed line-through',
                                    isCurrentMonth && !selected && !isPast && 'hover:bg-fifth text-textColor cursor-pointer',
                                    selected && 'bg-forth text-white font-bold shadow-md',
                                    isToday && !selected && isCurrentMonth && 'border-2 border-forth'
                                )}
                            >
                                {day.date()}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer com informações */}
            <div className="flex flex-col gap-2 pt-3 border-t border-fifth">
                <button
                    onClick={goToToday}
                    className="text-xs text-forth hover:text-white transition-colors font-medium"
                >
                    Ir para hoje
                </button>

                <div className="flex items-center justify-between text-xs">
                    <span className="text-customColor18">
                        {selectedDates.length === 0 ? 'Nenhum dia selecionado' :
                            selectedDates.length === 1 ? '1 dia selecionado' :
                                `${selectedDates.length} dias selecionados`}
                    </span>
                    {selectedDates.length > 0 && (
                        <button
                            onClick={() => onDatesChange?.([])}
                            className="text-red-400 hover:text-red-300 transition-colors"
                        >
                            Limpar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
