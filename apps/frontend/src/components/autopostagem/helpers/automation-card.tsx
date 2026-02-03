'use client';

import React from 'react';
import clsx from 'clsx';
import { Button } from '@gitroom/react/form/button';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

interface Automation {
    id: string;
    name: string;
    active: boolean;
    captions: Array<{ id: string; text: string }>;
    media: Array<{ id: string; mediaId: string; postType: string | null }>;
    timeSlots: string[];
    storyTimeSlots: string[];
    daysOfWeek: number[];
    pendingPostsCount?: number;
}

interface AutomationCardProps {
    automation: Automation;
    onEdit: () => void;
    onDelete: () => void;
    onGenerate: () => void;
    onDeleteScheduled: () => void;
    isGenerating: boolean;
}

const daysOfWeekLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const AutomationCard: React.FC<AutomationCardProps> = ({
    automation,
    onEdit,
    onDelete,
    onGenerate,
    onDeleteScheduled,
    isGenerating,
}) => {
    const t = useT();

    return (
        <div className="group relative p-6 rounded-[24px] bg-sixth/20 border border-black/5 dark:border-white/5 hover:border-forth/20 hover:-translate-y-1 transition-all duration-300 flex flex-col gap-6 shadow-sm hover:shadow-md overflow-hidden">
            {/* Background Accent Gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-forth/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-forth/5 transition-colors duration-300"></div>

            <div className="flex items-start justify-between relative z-10">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold text-textColor group-hover:text-forth transition-colors duration-300">
                        {automation.name}
                    </h3>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={onEdit}
                        className="p-2 rounded-xl bg-forth/10 text-forth hover:bg-forth hover:text-white transition-all duration-300 shadow-sm"
                        title={t('edit', 'Editar')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
                        title={t('delete', 'Excluir')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2 relative z-10">
                <div className="bg-black/5 dark:bg-white/5 p-2 rounded-2xl flex flex-col items-center justify-center gap-1 border border-black/5 dark:border-white/5 group-hover:border-forth/10 transition-colors">
                    <span className="text-base font-bold text-textColor">{automation.captions.length}</span>
                    <span className="text-[8px] uppercase font-bold text-textColor/40">Legendas</span>
                </div>
                <div className="bg-black/5 dark:bg-white/5 p-2 rounded-2xl flex flex-col items-center justify-center gap-1 border border-black/5 dark:border-white/5 group-hover:border-forth/10 transition-colors">
                    <span className="text-base font-bold text-textColor">{automation.media.length}</span>
                    <span className="text-[8px] uppercase font-bold text-textColor/40">Mídias</span>
                </div>
                <div className="bg-black/5 dark:bg-white/5 p-2 rounded-2xl flex flex-col items-center justify-center gap-1 border border-black/5 dark:border-white/5 group-hover:border-forth/10 transition-colors">
                    <span className="text-base font-bold text-textColor">{automation.timeSlots.length + (automation.storyTimeSlots?.length || 0)}</span>
                    <span className="text-[8px] uppercase font-bold text-textColor/40">Horários</span>
                </div>
                <div className="bg-forth/5 p-2 rounded-2xl flex flex-col items-center justify-center gap-1 border border-forth/10 group-hover:border-forth/30 transition-colors">
                    <span className="text-base font-bold text-forth">{automation.pendingPostsCount || 0}</span>
                    <span className="text-[8px] uppercase font-bold text-forth/60">Pendentes</span>
                </div>
            </div>

            {/* Days of Week */}
            {automation.daysOfWeek.length > 0 && (
                <div className="flex flex-wrap gap-1.5 relative z-10">
                    {daysOfWeekLabels.map((label, index) => {
                        const isSelected = automation.daysOfWeek.includes(index);
                        return (
                            <span
                                key={index}
                                className={clsx(
                                    "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border",
                                    isSelected
                                        ? "bg-forth/10 border-forth/20 text-forth"
                                        : "bg-black/5 dark:bg-white/5 border-transparent text-textColor/20"
                                )}
                            >
                                {label}
                            </span>
                        );
                    })}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-black/5 dark:border-white/5 relative z-10">
                <Button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-forth to-forth/80 hover:from-forth hover:to-forth/90 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                    {isGenerating ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <polyline points="1 20 1 14 7 14"></polyline>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                        </svg>
                    )}
                    {isGenerating ? t('generating', 'Gerando...') : t('generate_schedules', 'Gerar Agendamentos')}
                </Button>

                <button
                    onClick={onDeleteScheduled}
                    className="w-full py-2.5 text-[11px] font-bold uppercase tracking-wider text-textColor/40 hover:text-red-500 transition-colors flex items-center justify-center gap-2 group/del"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40 group-hover/del:opacity-100 transition-opacity">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                    {t('delete_scheduled_posts', 'Apagar Posts Agendados')}
                </button>
            </div>
        </div>
    );
};
