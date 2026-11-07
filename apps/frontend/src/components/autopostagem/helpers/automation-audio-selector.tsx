'use client';

import React, { FC, useState, useEffect, useRef, useCallback } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { Button } from '@gitroom/react/form/button';
import { Modal } from '../Modal';
import clsx from 'clsx';

export interface AutomationAudio {
    id: string;
    title?: string;
    artist?: string;
    image?: string;
    previewUrl?: string;
    duration?: number;
    audio_volume?: number;
    video_volume?: number;
}

interface AutomationAudioSelectorProps {
    audios: AutomationAudio[];
    onChange: (audios: AutomationAudio[]) => void;
    integrations: any[];
    selectedIntegrations: string[];
}

const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

export const AutomationAudioSelector: FC<AutomationAudioSelectorProps> = ({
    audios,
    onChange,
    integrations,
    selectedIntegrations,
}) => {
    const fetch = useFetch();
    const t = useT();

    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [audioType, setAudioType] = useState<'music' | 'original_sound'>('music');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [playingId, setPlayingId] = useState<string>('');
    const player = useRef<HTMLAudioElement | undefined>(undefined);

    // Encontrar uma conta do Instagram ativa (preferencialmente selecionada para esta automação)
    const instagramIntegration =
        integrations.find(
            (i) =>
                selectedIntegrations.includes(i.id) &&
                (i.identifier === 'instagram' || i.identifier === 'instagram-standalone')
        ) ||
        integrations.find(
            (i) => i.identifier === 'instagram' || i.identifier === 'instagram-standalone'
        );

    const stopPreview = useCallback(() => {
        player.current?.pause();
        player.current = undefined;
        setPlayingId('');
    }, []);

    useEffect(() => {
        return () => stopPreview();
    }, [stopPreview]);

    // Buscar áudios na API oficial do Instagram (vazio = trending)
    const searchAudios = useCallback(
        async (searchQuery: string, type: 'music' | 'original_sound') => {
            if (!instagramIntegration) return;
            setLoading(true);
            try {
                const response = await fetch('/integrations/function', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: 'audioSearch',
                        id: instagramIntegration.id,
                        data: {
                            q: searchQuery,
                            type,
                        },
                    }),
                });
                if (response.ok) {
                    const list = await response.json();
                    setResults(Array.isArray(list) ? list : []);
                } else {
                    setResults([]);
                }
            } catch (err) {
                console.error('Erro ao buscar áudios:', err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        },
        [fetch, instagramIntegration]
    );

    // Carregar em alta automaticamente ao abrir o seletor
    useEffect(() => {
        if (!isPickerOpen) {
            stopPreview();
            return;
        }

        const timer = setTimeout(() => {
            searchAudios(query, audioType);
        }, query ? 500 : 0);

        return () => clearTimeout(timer);
    }, [isPickerOpen, query, audioType, searchAudios, stopPreview]);

    const togglePreview = (audio: { id: string; previewUrl?: string }) => {
        if (playingId === audio.id) {
            stopPreview();
            return;
        }
        stopPreview();
        if (!audio.previewUrl) return;

        const newPlayer = new Audio(audio.previewUrl);
        newPlayer.onended = () => setPlayingId('');
        newPlayer.play().catch(() => setPlayingId(''));
        player.current = newPlayer;
        setPlayingId(audio.id);
    };

    const addAudio = (audio: any) => {
        if (audios.some((a) => a.id === audio.id)) return;
        onChange([
            ...audios,
            {
                id: audio.id,
                title: audio.title || 'Sem título',
                artist: audio.artist || 'Artista desconhecido',
                image: audio.image || '',
                previewUrl: audio.previewUrl || '',
                duration: audio.duration || 0,
                audio_volume: 100,
                video_volume: 100,
            },
        ]);
    };

    const removeAudio = (id: string) => {
        onChange(audios.filter((a) => a.id !== id));
    };

    const updateVolume = (
        id: string,
        field: 'audio_volume' | 'video_volume',
        val: number
    ) => {
        onChange(
            audios.map((a) => (a.id === id ? { ...a, [field]: val } : a))
        );
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-forth rounded-full"></div>
                    <label className="text-sm font-bold text-textColor/90">
                        {t('automation_audios_title', 'Áudios & Músicas (Reels do Instagram)')}
                    </label>
                </div>
                <Button
                    type="button"
                    onClick={() => setIsPickerOpen(true)}
                    disabled={!instagramIntegration}
                >
                    + {t('add_audio', 'Buscar / Músicas em Alta')}
                </Button>
            </div>

            <p className="text-xs text-textColor/60">
                {t(
                    'automation_audios_description',
                    'Escolha uma ou mais músicas para formar uma lista. O sistema distribuirá os áudios em rotação nos seus Reels de vídeo e ignorará imagens e stories automaticamente para evitar erros.'
                )}
            </p>

            {!instagramIntegration && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-400">
                    {t(
                        'no_instagram_connected_for_audio',
                        'Para buscar músicas em alta e adicioná-las aos seus Reels, selecione ou conecte uma conta do Instagram.'
                    )}
                </div>
            )}

            {/* Lista de áudios já adicionados */}
            {audios.length === 0 ? (
                <div className="border border-dashed border-newTextColor/20 rounded-xl p-6 text-center text-xs text-textColor/40">
                    {t('no_audios_selected', 'Nenhuma música selecionada. Os Reels serão postados com o som original do vídeo.')}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {audios.map((audio, index) => (
                        <div
                            key={audio.id}
                            className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-newBgColorInner border border-newTextColor/10 rounded-xl"
                        >
                            <div className="flex items-center gap-3 min-w-[200px]">
                                {audio.image ? (
                                    <img
                                        src={audio.image}
                                        alt={audio.title}
                                        className="w-10 h-10 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-lg bg-newTextColor/10 flex items-center justify-center text-xs font-bold text-forth">
                                        🎵
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <div className="text-sm font-medium text-textColor max-w-[180px] truncate">
                                        {audio.title}
                                    </div>
                                    <div className="text-xs text-textColor/60 max-w-[180px] truncate">
                                        {audio.artist}
                                    </div>
                                </div>
                            </div>

                            {/* Controles de Volume e Preview */}
                            <div className="flex items-center gap-6 flex-1 justify-end">
                                {audio.previewUrl && (
                                    <button
                                        type="button"
                                        onClick={() => togglePreview(audio)}
                                        className={clsx(
                                            'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                                            playingId === audio.id
                                                ? 'bg-forth text-white border-forth'
                                                : 'bg-newTextColor/5 border-newTextColor/15 text-textColor hover:bg-newTextColor/10'
                                        )}
                                    >
                                        {playingId === audio.id ? '⏹ Parar' : '▶ Ouvir'}
                                    </button>
                                )}

                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-textColor/60 whitespace-nowrap">
                                        Música: {audio.audio_volume ?? 100}%
                                    </span>
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        value={audio.audio_volume ?? 100}
                                        onChange={(e) =>
                                            updateVolume(audio.id, 'audio_volume', +e.target.value)
                                        }
                                        className="w-20 accent-forth"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-textColor/60 whitespace-nowrap">
                                        Vídeo: {audio.video_volume ?? 100}%
                                    </span>
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        value={audio.video_volume ?? 100}
                                        onChange={(e) =>
                                            updateVolume(audio.id, 'video_volume', +e.target.value)
                                        }
                                        className="w-20 accent-forth"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeAudio(audio.id)}
                                    className="text-red-400 hover:text-red-300 text-sm font-bold px-2 py-1"
                                    title="Remover música"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="text-right text-[11px] text-forth font-medium">
                        ✓ {audios.length} {audios.length === 1 ? 'música configurada' : 'músicas configuradas'} para rotação automática
                    </div>
                </div>
            )}

            {/* Modal de Busca e Músicas em Alta */}
            {isPickerOpen && (
                <Modal
                    isOpen={isPickerOpen}
                    onClose={() => {
                        stopPreview();
                        setIsPickerOpen(false);
                    }}
                    title={t('trending_and_search_audio', 'Explorar Músicas em Alta & Buscar')}
                    className="w-[95%] max-w-[800px]"
                >
                    <div className="flex flex-col gap-4 p-2 max-h-[70vh]">
                        {/* Barra de Pesquisa e Filtro */}
                        <div className="flex gap-2">
                            <select
                                value={audioType}
                                onChange={(e) => setAudioType(e.target.value as any)}
                                className="bg-newBgColorInner border border-newTextColor/10 rounded-xl px-3 py-2 text-xs text-textColor outline-none focus:border-forth"
                            >
                                <option value="music">Música</option>
                                <option value="original_sound">Áudio Original</option>
                            </select>

                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buscar música ou artista (deixe vazio para ver em alta)..."
                                className="flex-1 bg-newBgColorInner border border-newTextColor/10 rounded-xl px-4 py-2 text-xs text-textColor outline-none focus:border-forth placeholder:text-textColor/30"
                            />

                            <button
                                type="button"
                                onClick={() => searchAudios(query, audioType)}
                                className="px-4 py-2 bg-forth text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-all"
                            >
                                Buscar
                            </button>
                        </div>

                        {/* Lista de Resultados */}
                        <div className="flex-1 overflow-y-auto max-h-[50vh] flex flex-col gap-2 pr-1 scrollbar scrollbar-thumb-fifth scrollbar-track-transparent">
                            {loading ? (
                                <div className="py-12 text-center text-xs text-textColor/60">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forth mx-auto mb-2"></div>
                                    Carregando áudios da Meta...
                                </div>
                            ) : results.length === 0 ? (
                                <div className="py-12 text-center text-xs text-textColor/40">
                                    Nenhum áudio encontrado. Tente outra busca ou deixe vazio para ver as faixas em alta.
                                </div>
                            ) : (
                                results.map((result) => {
                                    const isAdded = audios.some((a) => a.id === result.id);
                                    return (
                                        <div
                                            key={result.id}
                                            className="flex items-center justify-between p-3 bg-newBgColorInner border border-newTextColor/5 hover:border-newTextColor/15 rounded-xl transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                {result.image ? (
                                                    <img
                                                        src={result.image}
                                                        alt={result.title}
                                                        className="w-10 h-10 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-newTextColor/10 flex items-center justify-center text-xs font-bold text-forth">
                                                        🎵
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <div className="text-xs font-semibold text-textColor">
                                                        {result.title}
                                                    </div>
                                                    <div className="text-[11px] text-textColor/60">
                                                        {[result.artist, result.duration ? formatDuration(result.duration) : '']
                                                            .filter(Boolean)
                                                            .join(' • ')}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {result.previewUrl && (
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePreview(result)}
                                                        className={clsx(
                                                            'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                                                            playingId === result.id
                                                                ? 'bg-forth text-white border-forth'
                                                                : 'bg-newTextColor/5 border-newTextColor/15 text-textColor hover:bg-newTextColor/10'
                                                        )}
                                                    >
                                                        {playingId === result.id ? '⏹ Parar' : '▶ Ouvir'}
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => addAudio(result)}
                                                    disabled={isAdded}
                                                    className={clsx(
                                                        'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                                                        isAdded
                                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                                                            : 'bg-forth text-white hover:opacity-90'
                                                    )}
                                                >
                                                    {isAdded ? '✓ Adicionado' : '+ Adicionar'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="flex justify-end pt-2 border-t border-newTextColor/10">
                            <Button
                                type="button"
                                onClick={() => {
                                    stopPreview();
                                    setIsPickerOpen(false);
                                }}
                            >
                                Concluir Seleção ({audios.length})
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

