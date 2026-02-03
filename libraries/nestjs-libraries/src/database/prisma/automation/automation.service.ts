import { BadRequestException, Injectable } from '@nestjs/common';
import { AutomationDto } from '@gitroom/nestjs-libraries/dtos/automation/automation.dto';
import { AutomationRepository } from '@gitroom/nestjs-libraries/database/prisma/automation/automation.repository';
import { AutomationMediaService } from '@gitroom/nestjs-libraries/database/prisma/automation/automation.media.service';

@Injectable()
export class AutomationService {
    constructor(
        private _automationRepository: AutomationRepository,
        private _automationMediaService: AutomationMediaService
    ) { }

    async getAutomations(orgId: string) {
        const automations = await this._automationRepository.getAutomations(orgId);
        return automations.map((automation: any) => ({
            ...automation,
            timeSlots: JSON.parse(automation.timeSlots),
            storyTimeSlots: automation.storyTimeSlots ? JSON.parse(automation.storyTimeSlots) : [],
            daysOfWeek: JSON.parse(automation.daysOfWeek),
            pendingPostsCount: automation._count?.schedules || 0,
        }));
    }

    async getAutomationById(orgId: string, id: string) {
        const automation: any = await this._automationRepository.getAutomationById(orgId, id);

        if (!automation) return null;

        return {
            ...automation,
            timeSlots: JSON.parse(automation.timeSlots),
            storyTimeSlots: automation.storyTimeSlots ? JSON.parse(automation.storyTimeSlots) : [],
            daysOfWeek: JSON.parse(automation.daysOfWeek),
            pendingPostsCount: automation._count?.schedules || 0,
        };
    }

    async createAutomation(orgId: string, data: AutomationDto, id?: string) {
        if (data.media.some((m) => m.postType === 'story') && (!data.storyTimeSlots || data.storyTimeSlots.length === 0)) {
            throw new BadRequestException('Você precisa adicionar pelo menos um horário de story se tiver mídias de story');
        }

        if (id && data.deleteScheduledMedia) {
            await this._automationMediaService.deletePhysicalMedia(orgId, id);
        }
        return this._automationRepository.createAutomation(orgId, data, id);
    }

    async deleteAutomation(orgId: string, id: string) {
        return this._automationRepository.deleteAutomation(orgId, id);
    }

    async deleteAutomationSchedules(orgId: string, id: string) {
        return this._automationRepository.deleteAutomationSchedules(orgId, id);
    }
}
