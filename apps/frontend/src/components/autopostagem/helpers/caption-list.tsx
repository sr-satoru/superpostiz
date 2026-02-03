'use client';

import React, { useState } from 'react';
import { Button } from '@gitroom/react/form/button';
import { EditorTextoModal } from '../EditorTextoModal';
import { Modal } from '../Modal';

interface CaptionListProps {
    captions: string[];
    onChange: (captions: string[]) => void;
}

export const CaptionList: React.FC<CaptionListProps> = ({ captions, onChange }) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState('');
    const [isListPopupOpen, setIsListPopupOpen] = useState(false);

    const startEdit = (index: number) => {
        setEditingIndex(index);
        setEditingValue(captions[index]);
        setIsListPopupOpen(false);
    };

    const saveEdit = () => {
        if (editingValue.trim()) {
            const newCaptions = [...captions];
            if (editingIndex !== null && editingIndex < captions.length) {
                newCaptions[editingIndex] = editingValue;
            } else {
                newCaptions.push(editingValue);
            }
            onChange(newCaptions);
            setEditingIndex(null);
            setEditingValue('');
        }
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditingValue('');
    };

    const removeCaption = (index: number) => {
        onChange(captions.filter((_, i) => i !== index));
    };

    const getPreview = (text: string) => {
        if (!text) return 'Legenda vazia...';
        return text.length > 50 ? text.slice(0, 50) + '...' : text;
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-forth rounded-full"></div>
                <label className="text-sm font-bold text-textColor/90">Gerenciar Legendas</label>
            </div>

            {/* Editor Inline no Topo */}
            <div className="flex flex-col gap-4">
                <EditorTextoModal
                    value={editingValue}
                    onChange={setEditingValue}
                    placeholder="Digite sua legenda aqui..."
                />
                <div className="flex justify-end gap-3">
                    {editingIndex !== null && (
                        <Button
                            onClick={cancelEdit}
                            className="bg-transparent border-2 border-fifth/50 text-textColor/70 hover:text-textColor hover:bg-fifth/30 transition-all px-6"
                        >
                            Cancelar
                        </Button>
                    )}
                    <Button
                        onClick={saveEdit}
                        disabled={!editingValue.trim()}
                        className="bg-gradient-to-r from-forth to-forth/80 hover:from-forth hover:to-forth/90 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed px-8 font-bold"
                    >
                        {editingIndex !== null && editingIndex < captions.length ? 'Atualizar Legenda' : 'Adicionar Legenda'}
                    </Button>
                </div>
            </div>

            {/* Botão para ver lista */}
            <div className="flex justify-center pt-2">
                <button
                    onClick={() => setIsListPopupOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sixth/30 border border-fifth/50 hover:bg-forth/10 hover:border-forth/50 text-textColor/60 hover:text-forth transition-all text-sm font-medium group"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100">
                        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                    </svg>
                    Ver Legendas Salvas ({captions.length})
                </button>
            </div>

            {/* Popup da Lista de Legendas */}
            <Modal
                isOpen={isListPopupOpen}
                onClose={() => setIsListPopupOpen(false)}
                title="Legendas Salvas"
                size="600px"
            >
                <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-2 scrollbar scrollbar-thumb-fifth scrollbar-track-transparent">
                    {captions.length === 0 ? (
                        <div className="text-center py-8 text-textColor/40 italic">
                            Nenhuma legenda salva ainda.
                        </div>
                    ) : (
                        captions.map((caption, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-4 p-4 bg-sixth/30 border border-fifth/50 rounded-xl hover:border-forth/40 hover:bg-sixth/50 transition-all group shadow-sm"
                            >
                                <div className="flex-1 flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-forth/10 text-forth flex items-center justify-center text-xs font-bold flex-shrink-0 border border-forth/20">
                                        {index + 1}
                                    </div>
                                    <div className="text-sm text-textColor/80 group-hover:text-textColor transition-colors truncate font-medium">
                                        {getPreview(caption)}
                                    </div>
                                </div>

                                <div className="flex gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => startEdit(index)}
                                        className="p-2 text-xs bg-fifth/30 hover:bg-forth/10 border border-fifth/50 hover:border-forth/50 rounded-lg text-textColor/70 hover:text-forth transition-all"
                                        title="Editar"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => removeCaption(index)}
                                        className="p-2 text-xs bg-fifth/30 hover:bg-red-500/10 border border-fifth/50 hover:border-red-500/50 rounded-lg text-textColor/50 hover:text-red-500 transition-all"
                                        title="Excluir"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Modal>
        </div>
    );
};
