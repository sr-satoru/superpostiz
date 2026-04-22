import {
    Body,
    Controller,
    Param,
    Patch,
    Post,
    NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { Organization } from '@prisma/client';
import { AutomationService } from '@gitroom/nestjs-libraries/database/prisma/automation/automation.service';
import { AutomationSchedulingService } from '@gitroom/nestjs-libraries/database/prisma/automation/automation.scheduling.service';
import { AutomationDto } from '@gitroom/nestjs-libraries/dtos/automation/automation.dto';
import { CheckPolicies } from '@gitroom/backend/services/auth/permissions/permissions.ability';
import {
    AuthorizationActions,
    Sections,
} from '@gitroom/backend/services/auth/permissions/permission.exception.class';
import * as Sentry from '@sentry/nestjs';

@ApiTags('Public API')
@Controller('/public/v2')
export class PublicAutomationV2Controller {
    constructor(
        private _automationService: AutomationService,
        private _automationSchedulingService: AutomationSchedulingService
    ) { }

    @Post('/new/automation')
    @CheckPolicies([AuthorizationActions.Create, Sections.POSTS_PER_MONTH])
    async createAutomation(
        @GetOrgFromRequest() org: Organization,
        @Body() body: AutomationDto
    ) {
        Sentry.metrics.count('public_api-request', 1);
        return this._automationService.createAutomation(org.id, body);
    }

    @Post('/automations/schedule/:id')
    @Patch('/automations/schedule/:id')
    @CheckPolicies([AuthorizationActions.Update, Sections.POSTS_PER_MONTH])
    async updateSchedule(
        @GetOrgFromRequest() org: Organization,
        @Param('id') id: string,
        @Body() body: Pick<AutomationDto, 'timeSlots' | 'daysOfWeek' | 'storyTimeSlots'>
    ) {
        Sentry.metrics.count('public_api-request', 1);
        const automation = await this._automationService.getAutomationById(org.id, id);
        if (!automation) {
            throw new NotFoundException('Automation not found');
        }

        const updatedData = this.mapToDto(automation, body);
        return this._automationService.createAutomation(org.id, updatedData, id);
    }

    @Post('/automations/media/:id')
    @CheckPolicies([AuthorizationActions.Update, Sections.POSTS_PER_MONTH])
    async updateMedia(
        @GetOrgFromRequest() org: Organization,
        @Param('id') id: string,
        @Body() body: Pick<AutomationDto, 'media'>
    ) {
        Sentry.metrics.count('public_api-request', 1);
        const automation = await this._automationService.getAutomationById(org.id, id);
        if (!automation) {
            throw new NotFoundException('Automation not found');
        }

        const updatedData = this.mapToDto(automation, body);
        return this._automationService.createAutomation(org.id, updatedData, id);
    }

    @Post('/automations/integrations/:id')
    @CheckPolicies([AuthorizationActions.Update, Sections.POSTS_PER_MONTH])
    async updateIntegrations(
        @GetOrgFromRequest() org: Organization,
        @Param('id') id: string,
        @Body() body: Pick<AutomationDto, 'integrationIds'>
    ) {
        Sentry.metrics.count('public_api-request', 1);
        const automation = await this._automationService.getAutomationById(org.id, id);
        if (!automation) {
            throw new NotFoundException('Automation not found');
        }

        const updatedData = this.mapToDto(automation, body);
        return this._automationService.createAutomation(org.id, updatedData, id);
    }

    @Post('/automations/:id/generate')
    @CheckPolicies([AuthorizationActions.Update, Sections.POSTS_PER_MONTH])
    async generateSchedules(
        @GetOrgFromRequest() org: Organization,
        @Param('id') id: string,
        @Body('startDate') startDate: string,
        @Body('endDate') endDate: string,
        @Body('timezone') timezone: string
    ) {
        Sentry.metrics.count('public_api-request', 1);
        return this._automationSchedulingService.generateSchedules(
            org.id,
            id,
            startDate,
            endDate,
            timezone
        );
    }

    private mapToDto(automation: any, override: Partial<AutomationDto>): AutomationDto {
        return {
            name: override.name ?? automation.name,
            captions: override.captions ?? automation.captions.map((c: any) => c.text),
            integrationIds: override.integrationIds ?? automation.integrations.map((i: any) => i.integrationId),
            media: override.media ?? automation.media.map((m: any) => ({ id: m.mediaId, postType: m.postType })),
            daysOfWeek: override.daysOfWeek ?? automation.daysOfWeek,
            timeSlots: override.timeSlots ?? automation.timeSlots,
            storyTimeSlots: override.storyTimeSlots ?? automation.storyTimeSlots,
            deleteMediaAfterPost: override.deleteMediaAfterPost ?? automation.deleteMediaAfterPost,
            randomCaptions: override.randomCaptions ?? automation.randomCaptions,
            deleteScheduledMedia: override.deleteScheduledMedia ?? automation.deleteScheduledMedia,
        };
    }
}
