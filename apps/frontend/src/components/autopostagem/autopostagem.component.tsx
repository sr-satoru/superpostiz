'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@gitroom/react/form/button';
import { CreateAutomationModal } from './CreateAutomationModal';
import { AutomationCard } from './helpers/automation-card';
import { useAutomationList } from './helpers/use.automation.list';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useDecisionModal } from '@gitroom/frontend/components/layout/new-modal';

export const AutopostagemComponent: React.FC = () => {
    const fetch = useFetch();
    const t = useT();
    const toaster = useToaster();
    const decision = useDecisionModal();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingAutomationId, setEditingAutomationId] = useState<string | null>(null);
    const [generatingScheduleId, setGeneratingScheduleId] = useState<string | null>(null);

    const { data: automations = [], mutate, isLoading } = useAutomationList();

    // Desabilitar scroll quando modal estiver aberto
    React.useEffect(() => {
        const isModalOpen = isCreateModalOpen || editingAutomationId !== null;

        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isCreateModalOpen, editingAutomationId]);

    const handleGenerateSchedules = useCallback(async (automationId: string) => {
        if (!(await decision.open({
            title: t('generate_schedules', 'Gerar Agendamentos'),
            description: t('generate_schedules_confirmation', 'Deseja gerar agendamentos para esta automação? Isso criará posts no calendário.'),
            approveLabel: t('yes_generate', 'Sim, gerar!'),
            cancelLabel: t('cancel', 'Cancelar'),
        }))) {
            return;
        }

        setGeneratingScheduleId(automationId);
        try {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30);

            const response = await fetch(`/automation/${automationId}/schedule`, {
                method: 'POST',
                body: JSON.stringify({
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                }),
            });

            if (!response.ok) {
                throw new Error('Erro ao gerar agendamentos');
            }

            const result = await response.json();
            toaster.show(t('schedules_generated_successfully', `Agendamentos gerados com sucesso! ${result.totalScheduled} posts criados.`), 'success');

            // Atualiza a lista de automações para refletir os novos números de pendentes/agendados
            mutate();
        } catch (error: any) {
            console.error('Erro ao gerar agendamentos:', error);
            toaster.show(error.message || t('error_generating_schedules', 'Erro ao gerar agendamentos'), 'warning');
        } finally {
            setGeneratingScheduleId(null);
        }
    }, [fetch, t, toaster, decision, mutate]);

    const handleDelete = useCallback(async (automationId: string) => {
        if (!(await decision.open({
            title: t('delete_automation', 'Excluir Automação'),
            description: t('delete_automation_confirmation', 'Tem certeza que deseja excluir esta automação?'),
            approveLabel: t('yes_delete', 'Sim, excluir!'),
            cancelLabel: t('cancel', 'Cancelar'),
        }))) {
            return;
        }

        try {
            const response = await fetch(`/automation/${automationId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Erro ao deletar automação');
            }

            toaster.show(t('automation_deleted_successfully', 'Automação deletada com sucesso!'), 'success');
            mutate();
        } catch (error: any) {
            console.error('Erro ao deletar automação:', error);
            toaster.show(error.message || t('error_deleting_automation', 'Erro ao deletar automação'), 'warning');
        }
    }, [fetch, mutate, t, toaster, decision]);

    const handleDeleteScheduledPosts = useCallback(async (automationId: string) => {
        if (!(await decision.open({
            title: t('delete_scheduled_posts', 'Apagar Posts Agendados'),
            description: t('delete_scheduled_posts_confirmation', 'Tem certeza que deseja apagar todos os posts já agendados desta automação? Isso não excluirá a automação em si.'),
            approveLabel: t('yes_delete_posts', 'Sim, apagar posts!'),
            cancelLabel: t('cancel', 'Cancelar'),
        }))) {
            return;
        }

        try {
            const response = await fetch(`/automation/${automationId}/schedules`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Erro ao apagar posts agendados');
            }

            toaster.show(t('scheduled_posts_deleted_successfully', 'Posts agendados apagados com sucesso!'), 'success');
            mutate();
        } catch (error: any) {
            console.error('Erro ao apagar posts agendados:', error);
            toaster.show(error.message || t('error_deleting_scheduled_posts', 'Erro ao apagar posts agendados'), 'warning');
        }
    }, [fetch, mutate, t, toaster, decision]);

    return (
        <div className="p-[20px] flex flex-col gap-[15px] transition-all w-full">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-[24px] font-[600] text-textColor">{t('automations', 'Automações')}</h1>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    {t('create_automation', 'Criar Automação')}
                </Button>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-customColor18">
                        <p>{t('loading_automations', 'Carregando automações...')}</p>
                    </div>
                </div>
            ) : automations.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-customColor18">
                        <p className="text-lg mb-2">{t('no_automations_yet', 'Nenhuma automação criada ainda')}</p>
                        <p className="text-sm">{t('click_create_to_start', 'Clique em "Criar Automação" para começar')}</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {automations.map((automation: any) => (
                        <AutomationCard
                            key={automation.id}
                            automation={automation}
                            onEdit={() => setEditingAutomationId(automation.id)}
                            onDelete={() => handleDelete(automation.id)}
                            onGenerate={() => handleGenerateSchedules(automation.id)}
                            onDeleteScheduled={() => handleDeleteScheduledPosts(automation.id)}
                            isGenerating={generatingScheduleId === automation.id}
                        />
                    ))}
                </div>
            )}

            <CreateAutomationModal
                isOpen={isCreateModalOpen || editingAutomationId !== null}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingAutomationId(null);
                    mutate();
                }}
                editAutopostId={editingAutomationId}
                onSaved={() => {
                    mutate();
                }}
            />
        </div>
    );
};
