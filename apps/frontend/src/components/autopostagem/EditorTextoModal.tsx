'use client';

import React, { FC, useState, useCallback } from 'react';
import clsx from 'clsx';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { VideoFrame } from '@gitroom/react/helpers/video.frame';
import { useMediaDirectory } from '@gitroom/react/helpers/use.media.directory';

interface MediaItem {
    id: string;
    path: string;
    name?: string;
    type?: string;
    postType: string | null;
}

interface EditorTextoModalProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    onInsertMedia?: () => void;
    media?: MediaItem[];
    onRemoveMedia?: (index: number) => void;
    onDelete?: () => void;
    showDelete?: boolean;
}

export const EditorTextoModal: FC<EditorTextoModalProps> = ({
    value,
    onChange,
    placeholder = "O que você está pensando?",
    onInsertMedia,
    media = [],
    onRemoveMedia,
    onDelete,
    showDelete = false,
}) => {
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const mediaDirectory = useMediaDirectory();

    const handleEmojiClick = useCallback((emojiData: any) => {
        onChange(value + emojiData.emoji);
        setEmojiPickerOpen(false);
    }, [value, onChange]);

    return (
        <div className="flex flex-col gap-2 bg-sixth border border-fifth rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 p-2 border-b border-fifth bg-newBgColorInner">
                <button
                    type="button"
                    onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                    className="p-2 hover:bg-fifth rounded transition-colors text-xl"
                    title="Emoji"
                >
                    😀
                </button>
                {emojiPickerOpen && (
                    <div className="absolute z-[100] top-[50px]">
                        <EmojiPicker
                            theme={Theme.DARK}
                            onEmojiClick={handleEmojiClick}
                        />
                    </div>
                )}
                <div className="flex-1" />
                {showDelete && (
                    <button
                        type="button"
                        onClick={onDelete}
                        className="p-2 hover:bg-red-500/20 text-red-500 rounded transition-colors"
                        title="Excluir legenda"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                    </button>
                )}
            </div>

            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full min-h-[150px] p-4 bg-transparent outline-none text-textColor resize-y"
            />

            {media.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-newBgColorInner border-t border-fifth">
                    {media.map((item, index) => (
                        <div key={item.id} className="relative w-20 h-20 rounded border border-fifth overflow-hidden group">
                            {item.path.includes('mp4') ? (
                                <VideoFrame url={mediaDirectory.set(item.path)} />
                            ) : (
                                <img
                                    src={mediaDirectory.set(item.path)}
                                    alt="Media"
                                    className="w-full h-full object-cover"
                                />
                            )}
                            {onRemoveMedia && (
                                <button
                                    onClick={() => onRemoveMedia(index)}
                                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                            )}
                            {item.postType && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-white text-center py-0.5">
                                    {item.postType}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {onInsertMedia && (
                <div className="p-2 border-t border-fifth bg-newBgColorInner">
                    <button
                        type="button"
                        onClick={onInsertMedia}
                        className="flex items-center gap-2 px-3 py-1.5 rounded bg-fifth hover:bg-forth text-sm text-textColor transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                        Adicionar Mídia
                    </button>
                </div>
            )}
        </div>
    );
};
