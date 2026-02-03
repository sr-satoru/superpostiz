'use client';

import React from 'react';
import { useMediaDirectory } from '@gitroom/react/helpers/use.media.directory';

interface MediaItem {
    id: string;
    path: string;
    postType: string | null;
}

interface MediaGridProps {
    label: string;
    media: MediaItem[];
    postType: string | null;
    onAdd: () => void;
    onRemove: (item: MediaItem) => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({ label, media, postType, onAdd, onRemove }) => {
    const mediaDir = useMediaDirectory();
    const filteredMedia = media.filter(m => m.postType === postType);

    return (
        <div className="flex flex-col gap-3 p-4 border border-newTextColor/10 rounded-xl bg-newBgColorInner shadow-inner">
            <span className="text-xs font-bold text-textColor/60 uppercase tracking-wider">{label}</span>
            <div className="flex flex-wrap gap-3">
                {filteredMedia.map((m, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl border border-fifth/50 overflow-hidden group shadow-sm hover:shadow-md transition-all">
                        <img src={mediaDir.set(m.path)} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" alt="" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                        <button
                            onClick={() => onRemove(m)}
                            className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-4px] group-hover:translate-y-0 shadow-lg"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                ))}
                <button
                    onClick={onAdd}
                    className="w-20 h-20 border-2 border-dashed border-forth/60 rounded-xl flex flex-col items-center justify-center gap-1 text-forth bg-forth/5 hover:bg-forth/10 hover:border-forth hover:shadow-lg hover:shadow-forth/30 hover:scale-105 transition-all duration-200 group"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform duration-200">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span className="text-[10px] font-bold uppercase">Add</span>
                </button>
            </div>
        </div>
    );
};
