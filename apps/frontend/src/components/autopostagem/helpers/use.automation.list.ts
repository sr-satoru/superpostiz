'use client';

import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useCallback } from 'react';
import useSWR from 'swr';

export const useAutomationList = () => {
    const fetch = useFetch();

    const load = useCallback(async () => {
        const response = await fetch('/automation');
        if (!response.ok) {
            throw new Error('Erro ao buscar automações');
        }
        return response.json();
    }, [fetch]);

    return useSWR('automations', load, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        revalidateOnMount: true,
        refreshWhenHidden: false,
        refreshWhenOffline: false,
        fallbackData: [],
    });
};
