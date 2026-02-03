'use client';

import React, { useState } from 'react';
import { Button } from '@gitroom/react/form/button';

interface TimeSlotsEditorProps {
    label: string;
    timeSlots: string[];
    onChange: (slots: string[]) => void;
}

export const TimeSlotsEditor: React.FC<TimeSlotsEditorProps> = ({ label, timeSlots, onChange }) => {
    const [newTime, setNewTime] = useState('09:00');

    const addTimeSlot = () => {
        if (!timeSlots.includes(newTime)) {
            onChange([...timeSlots, newTime].sort());
        }
    };

    const removeTimeSlot = (time: string) => {
        onChange(timeSlots.filter(t => t !== time));
    };

    return (
        <div className="flex flex-col gap-3 p-4 border border-black/5 dark:border-white/5 rounded-xl bg-sixth/20 shadow-inner">
            <span className="text-xs font-bold text-textColor/60 uppercase tracking-wider">{label}</span>
            <div className="flex flex-wrap gap-2 mb-3">
                {timeSlots.map((time) => (
                    <span key={time} className="pl-3 pr-1 py-1 bg-forth/10 border border-forth/20 text-forth rounded-lg text-xs font-bold flex items-center gap-2 group/tag hover:bg-forth hover:text-white transition-all shadow-sm">
                        {time}
                        <button
                            onClick={() => removeTimeSlot(time)}
                            className="p-1 hover:bg-black/10 rounded-md transition-colors"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="flex-1 bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-black dark:text-white outline-none focus:border-forth/50 focus:ring-4 focus:ring-forth/5 transition-all"
                />
                <Button
                    onClick={addTimeSlot}
                    className="text-xs py-2 px-4 bg-forth hover:bg-forth/90 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                    Add
                </Button>
            </div>
        </div>
    );
};
