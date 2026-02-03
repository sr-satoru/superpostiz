import { Injectable } from '@nestjs/common';

@Injectable()
export class AutomationHelperService {
    selectCaption(automation: any, index: number, lastIndex?: number): { text: string, index: number } {
        if (!automation.captions || automation.captions.length === 0) {
            return { text: '', index: -1 };
        }

        if (automation.randomCaptions) {
            const availableIndices = automation.captions
                .map((_: any, i: number) => i)
                .filter((i: number) => i !== lastIndex);

            // Se só tiver uma legenda, não tem como não repetir, então usa a única disponível
            const finalIndices = availableIndices.length > 0 ? availableIndices : [0];
            const randomIndex = finalIndices[Math.floor(Math.random() * finalIndices.length)];

            return {
                text: automation.captions[randomIndex].text,
                index: randomIndex
            };
        }

        // Lógica sequencial e circular: usa o índice para selecionar a legenda
        const seqIndex = index % automation.captions.length;
        return {
            text: automation.captions[seqIndex].text,
            index: seqIndex
        };
    }

    orderMedia(
        media: any[],
        scheduledMediaPaths: Set<string>,
        shuffle: boolean = false
    ): any[] {
        const filteredMedia = media.filter((am) => !scheduledMediaPaths.has(am.media.path));

        if (shuffle) {
            // Implementação simples de shuffle (Fisher-Yates)
            const shuffled = [...filteredMedia];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }

        // Ordenação padrão por data de criação
        return filteredMedia.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }
}
