'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from '@gitroom/react/form/button';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { MediaBox } from '@gitroom/frontend/components/media/media.component';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useIntegrationList } from '@gitroom/frontend/components/launches/helpers/use.integration.list';
import { IntegrationSelector } from './helpers/integration-selector';
import { CaptionList } from './helpers/caption-list';
import { MediaGrid } from './helpers/media-grid';
import { DaysSelector } from './helpers/days-selector';
import { TimeSlotsEditor } from './helpers/time-slots-editor';
import { CalendarAutomation } from './calendar/calendar-automation';

interface CreateAutomationModalProps {
    isOpen: boolean;
    onClose: () => void;
    editAutopostId?: string | null;
    onSaved?: () => void;
}

interface MediaItem {
    id: string;
    path: string;
    name?: string;
    type?: string;
    postType: string | null;
}

export const CreateAutomationModal: React.FC<CreateAutomationModalProps> = ({
    isOpen,
    onClose,
    editAutopostId,
    onSaved,
}) => {
    const fetch = useFetch();
    const t = useT();
    const modals = useModals();
    const toaster = useToaster();

    const { data: integrations = [] } = useIntegrationList();

    const [name, setName] = useState('');
    const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
    const [captions, setCaptions] = useState<string[]>([]);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [storyTimeSlots, setStoryTimeSlots] = useState<string[]>([]);
    const [deleteMediaAfterPost, setDeleteMediaAfterPost] = useState(false);
    const [randomCaptions, setRandomCaptions] = useState(false);
    const [deleteScheduledMedia, setDeleteScheduledMedia] = useState(false);
    const [selectedCalendarDates, setSelectedCalendarDates] = useState<Date[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (editAutopostId && isOpen) {
            setIsLoading(true);
            fetch(`/automation/${editAutopostId}`)
                .then((res) => res.json())
                .then((data) => {
                    setName(data.name);
                    setSelectedIntegrations(data.integrations.map((i: any) => i.integrationId));
                    setCaptions(data.captions.map((c: any) => c.text));
                    setMedia(data.media.map((m: any) => ({
                        id: m.mediaId,
                        path: m.media.path,
                        postType: m.postType,
                    })));
                    setDaysOfWeek(data.daysOfWeek);
                    setTimeSlots(data.timeSlots);
                    setStoryTimeSlots(data.storyTimeSlots || []);
                    setDeleteMediaAfterPost(data.deleteMediaAfterPost);
                    setRandomCaptions(data.randomCaptions || false);
                    setDeleteScheduledMedia(false); // Reset this as it's an action for the update
                })
                .finally(() => setIsLoading(false));
        } else if (isOpen) {
            setName('');
            setSelectedIntegrations([]);
            setCaptions([]);
            setMedia([]);
            setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
            setTimeSlots([]);
            setStoryTimeSlots([]);
            setDeleteMediaAfterPost(false);
            setRandomCaptions(false);
            setDeleteScheduledMedia(false);
        }
    }, [editAutopostId, isOpen, fetch]);

    const handleSave = async () => {
        if (!name) return toaster.show(t('name_is_required', 'Nome é obrigatório'), 'warning');
        if (selectedIntegrations.length === 0) return toaster.show(t('select_at_least_one_integration', 'Selecione pelo menos uma integração'), 'warning');
        if (daysOfWeek.length === 0) return toaster.show(t('select_at_least_one_day', 'Selecione pelo menos um dia da semana'), 'warning');
        if (timeSlots.length === 0 && storyTimeSlots.length === 0) return toaster.show(t('add_at_least_one_time_slot', 'Adicione pelo menos um horário'), 'warning');

        setIsSaving(true);
        try {
            const body = {
                name,
                captions,
                integrationIds: selectedIntegrations,
                media: media.map((m) => ({ id: m.id, postType: m.postType })),
                daysOfWeek,
                timeSlots,
                storyTimeSlots,
                deleteMediaAfterPost,
                randomCaptions,
                deleteScheduledMedia,
            };

            const res = await fetch(editAutopostId ? `/automation/${editAutopostId}` : '/automation', {
                method: editAutopostId ? 'PUT' : 'POST',
                body: JSON.stringify(body),
            });

            if (res.ok) {
                onSaved?.();
                onClose();
                toaster.show(editAutopostId ? t('automation_updated_successfully', 'Automação atualizada com sucesso!') : t('automation_created_successfully', 'Automação criada com sucesso!'), 'success');
            } else {
                toaster.show(t('error_saving_automation', 'Erro ao salvar automação'), 'warning');
            }
        } catch (error) {
            console.error(error);
            toaster.show(t('error_saving_automation', 'Erro ao salvar automação'), 'warning');
        } finally {
            setIsSaving(false);
        }
    };

    const openMediaSelector = (postType: string | null) => {
        modals.openModal({
            title: t('select_media', 'Selecionar Mídia'),
            askClose: false,
            closeOnEscape: true,
            fullScreen: true,
            size: 'calc(100% - 80px)',
            height: 'calc(100% - 80px)',
            children: (close) => (
                <MediaBox
                    setMedia={(selectedMedia) => {
                        setMedia((prev) => [
                            ...prev,
                            ...selectedMedia.map((m) => ({
                                id: m.id,
                                path: m.path,
                                postType,
                            })),
                        ]);
                        close();
                    }}
                    closeModal={close}
                />
            ),
        });
    };

    const removeMedia = (item: MediaItem) => {
        setMedia(media.filter(m => m !== item));
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editAutopostId ? 'Editar Automação' : 'Criar Automação'}
            size="80%"
            className="max-w-[1400px]"
        >
            {isLoading ? (
                <div className="p-12 text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-forth/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-forth border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-textColor/70 font-medium animate-pulse">Carregando automação...</p>
                </div>
            ) : (
                <div className="flex gap-6 max-h-[75vh]">
                    {/* Coluna Esquerda - Formulário */}
                    <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-3 scrollbar scrollbar-thumb-fifth scrollbar-track-transparent">
                        {/* Nome da Automação */}
                        <div className="flex flex-col gap-2 group">
                            <label className="text-sm font-bold text-textColor/90 group-focus-within:text-forth transition-colors duration-200">Nome da Automação</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="p-4 bg-newBgColorInner border border-newTextColor/10 rounded-xl text-textColor outline-none focus:border-forth/50 focus:ring-2 focus:ring-forth/20 transition-all duration-200 placeholder:text-textColor/30 hover:border-newTextColor/20"
                                placeholder="Ex: Posts Diários de Dicas"
                            />
                        </div>

                        {/* Integrações */}
                        <div className="bg-newSettings rounded-2xl p-6 border border-newTextColor/5 hover:border-newTextColor/10 transition-all duration-200">
                            <IntegrationSelector
                                integrations={integrations}
                                selected={selectedIntegrations}
                                onChange={setSelectedIntegrations}
                            />
                        </div>

                        {/* Legendas */}
                        <div className="bg-newSettings rounded-2xl p-6 border border-newTextColor/5 hover:border-newTextColor/10 transition-all duration-200">
                            <CaptionList
                                captions={captions}
                                onChange={setCaptions}
                            />
                        </div>

                        {/* Mídias */}
                        <div className="bg-newSettings rounded-2xl p-6 border border-newTextColor/5 hover:border-newTextColor/10 transition-all duration-200">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-4 bg-forth rounded-full"></div>
                                    <label className="text-sm font-bold text-textColor/90">Mídias (Aleatórias)</label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <MediaGrid
                                        label="Posts / Reels"
                                        media={media}
                                        postType={null}
                                        onAdd={() => openMediaSelector(null)}
                                        onRemove={removeMedia}
                                    />
                                    <MediaGrid
                                        label="Stories (Instagram)"
                                        media={media}
                                        postType="story"
                                        onAdd={() => openMediaSelector('story')}
                                        onRemove={removeMedia}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Agendamento (Dias e Horários) */}
                        <div className="bg-newSettings rounded-2xl p-6 border border-newTextColor/5 hover:border-newTextColor/10 transition-all duration-200 flex flex-col gap-8">
                            {/* Dias da Semana */}
                            <DaysSelector
                                selected={daysOfWeek}
                                onChange={setDaysOfWeek}
                            />

                            {/* Horários */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-4 bg-forth rounded-full"></div>
                                    <label className="text-sm font-bold text-textColor/90">Horários de Postagem</label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <TimeSlotsEditor
                                        label="Posts / Reels"
                                        timeSlots={timeSlots}
                                        onChange={setTimeSlots}
                                    />
                                    <TimeSlotsEditor
                                        label="Stories"
                                        timeSlots={storyTimeSlots}
                                        onChange={setStoryTimeSlots}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Opções Avançadas */}
                        <div className="bg-newSettings rounded-2xl p-6 border border-newTextColor/5 hover:border-newTextColor/10 transition-all duration-200 flex flex-col gap-6">
                            {/* Legendas Aleatórias */}
                            <div className="flex items-center gap-4 group cursor-pointer hover:bg-newBgColorInner/50 p-3 rounded-lg transition-all duration-200" onClick={() => setRandomCaptions(!randomCaptions)}>
                                <div className={`w-11 h-6 rounded-full p-0.5 transition-all duration-300 ${randomCaptions ? 'bg-forth shadow-lg shadow-forth/30' : 'bg-newTextColor/10'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md ${randomCaptions ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </div>
                                <label className="text-sm text-textColor/80 cursor-pointer flex-1 font-medium group-hover:text-textColor transition-colors duration-200">
                                    Usar legendas aleatórias (escolhe uma legenda diferente para cada post)
                                </label>
                            </div>

                            {/* Excluir Mídia Após Post */}
                            <div className="flex items-center gap-4 group cursor-pointer hover:bg-newBgColorInner/50 p-3 rounded-lg transition-all duration-200" onClick={() => setDeleteMediaAfterPost(!deleteMediaAfterPost)}>
                                <div className={`w-11 h-6 rounded-full p-0.5 transition-all duration-300 ${deleteMediaAfterPost ? 'bg-forth shadow-lg shadow-forth/30' : 'bg-newTextColor/10'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md ${deleteMediaAfterPost ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </div>
                                <label className="text-sm text-textColor/80 cursor-pointer flex-1 font-medium group-hover:text-textColor transition-colors duration-200">
                                    Excluir mídia após o uso (evita repetições se as mídias acabarem)
                                </label>
                            </div>

                            {/* Apagar Mídias de Posts Agendados (Apenas na Edição) */}
                            {editAutopostId && (
                                <div className="flex items-center gap-4 group cursor-pointer pt-4 border-t border-newTextColor/5 hover:bg-red-500/5 p-3 rounded-lg transition-all duration-200" onClick={() => setDeleteScheduledMedia(!deleteScheduledMedia)}>
                                    <div className={`w-11 h-6 rounded-full p-0.5 transition-all duration-300 ${deleteScheduledMedia ? 'bg-red-500 shadow-lg shadow-red-500/30' : 'bg-newTextColor/10'}`}>
                                        <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md ${deleteScheduledMedia ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <label className="text-sm text-textColor/80 cursor-pointer font-medium group-hover:text-textColor transition-colors duration-200">
                                            Apagar mídias de posts já publicados
                                        </label>
                                        <span className="text-[10px] text-textColor/40">Isso removerá as mídias dos posts que já foram publicados ou que apresentaram erro nesta automação.</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex justify-end gap-4 pt-6 border-t border-newTextColor/10 sticky bottom-0 bg-newBgColorInner pb-2">
                            <Button
                                onClick={onClose}
                                className="bg-transparent border-2 border-newTextColor/10 text-textColor/70 hover:text-textColor hover:bg-newSettings hover:border-newTextColor/20 transition-all duration-200 px-6"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-gradient-to-r from-forth to-forth/80 hover:from-forth hover:to-forth/90 shadow-lg shadow-forth/30 hover:shadow-xl hover:shadow-forth/40 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed px-8 font-bold"
                            >
                                {isSaving ? (
                                    <span className="flex items-center gap-2">
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        Salvando...
                                    </span>
                                ) : (
                                    'Salvar Automação'
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Coluna Direita - Calendário */}
                    <div className="w-[380px] flex flex-col gap-4">
                        <div className="bg-newSettings rounded-2xl p-6 border border-newTextColor/5 hover:border-newTextColor/10 transition-all duration-200">
                            <div className="flex flex-col gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-forth/10 rounded-lg">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-forth">
                                            <path d="M6 2V5M14 2V5M3 8H17M4 4H16C16.5523 4 17 4.44772 17 5V17C17 17.5523 16.5523 18 16 18H4C3.44772 18 3 17.5523 3 17V5C3 4.44772 3.44772 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <label className="text-sm font-bold text-textColor/90">Dias Específicos</label>
                                </div>
                                <div className="text-xs text-textColor/60 leading-relaxed bg-sixth/30 p-3 rounded-lg">
                                    Selecione o dia de partida para iniciar o agendamento nessa automação.
                                </div>
                            </div>
                            <div className="bg-newBgColorInner/30 rounded-xl p-2 shadow-inner">
                                <CalendarAutomation
                                    selectedDates={selectedCalendarDates}
                                    onDatesChange={setSelectedCalendarDates}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};
