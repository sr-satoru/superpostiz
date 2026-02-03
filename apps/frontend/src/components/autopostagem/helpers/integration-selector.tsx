'use client';

import React from 'react';
import clsx from 'clsx';
import Image from 'next/image';

interface Integration {
    id: string;
    name: string;
    picture: string;
    identifier?: string;
}

interface IntegrationSelectorProps {
    integrations: Integration[];
    selected: string[];
    onChange: (selected: string[]) => void;
}

export const IntegrationSelector: React.FC<IntegrationSelectorProps> = ({ integrations, selected, onChange }) => {
    const toggleIntegration = (id: string) => {
        const newSelected = selected.includes(id)
            ? selected.filter((selectedId) => selectedId !== id)
            : [...selected, id];
        onChange(newSelected);
    };

    const getPlatformIdentifier = (integration: Integration): string => {
        if (integration.identifier) return integration.identifier;

        const name = integration.name.toLowerCase();
        if (name.includes('instagram')) return 'instagram';
        if (name.includes('facebook')) return 'facebook';
        if (name.includes('twitter') || name.includes('x')) return 'x';
        if (name.includes('linkedin')) return 'linkedin';
        if (name.includes('youtube')) return 'youtube';
        if (name.includes('tiktok')) return 'tiktok';
        if (name.includes('threads')) return 'threads';
        if (name.includes('reddit')) return 'reddit';
        if (name.includes('pinterest')) return 'pinterest';

        return 'default';
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-forth rounded-full"></div>
                <label className="text-sm font-bold text-textColor/90">Canais de Postagem</label>
            </div>
            <div className="flex flex-wrap gap-4">
                {integrations.map((integration) => {
                    const isSelected = selected.includes(integration.id);
                    const platformId = getPlatformIdentifier(integration);

                    return (
                        <div
                            key={integration.id}
                            className="flex gap-2 items-center group"
                            data-tooltip-id="tooltip"
                            data-tooltip-content={integration.name}
                        >
                            <div
                                onClick={() => toggleIntegration(integration.id)}
                                className={clsx(
                                    'cursor-pointer border-2 relative rounded-full flex justify-center items-center transition-all duration-300 transform hover:scale-110 active:scale-95',
                                    !isSelected && 'border-transparent opacity-40 grayscale hover:opacity-100 hover:grayscale-0',
                                    isSelected && 'border-forth shadow-[0_0_15px_rgba(97,42,213,0.4)] scale-105'
                                )}
                            >
                                <div className="relative p-0.5 bg-newBgColorInner rounded-full overflow-hidden">
                                    <Image
                                        src={integration.picture || '/no-picture.jpg'}
                                        className={clsx(
                                            'rounded-full transition-all min-w-[48px] min-h-[48px] object-cover',
                                            !isSelected ? 'border-transparent' : 'border-forth/20'
                                        )}
                                        alt={integration.name}
                                        width={48}
                                        height={48}
                                    />
                                </div>
                                {platformId === 'youtube' ? (
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md z-20">
                                        <img
                                            src="/icons/platforms/youtube.svg"
                                            className="w-4 h-4"
                                            alt=""
                                        />
                                    </div>
                                ) : platformId !== 'default' ? (
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md z-20">
                                        <Image
                                            src={`/icons/platforms/${platformId}.png`}
                                            className="rounded-sm w-4 h-4"
                                            alt={platformId}
                                            width={16}
                                            height={16}
                                        />
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
