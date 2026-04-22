import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { Organization } from '@prisma/client';
import { AutomationService } from '@gitroom/nestjs-libraries/database/prisma/automation/automation.service';
import * as Sentry from '@sentry/nestjs';

@ApiTags('Public API')
@Controller('/public/v1/automations')
export class PublicAutomationController {
    constructor(private _automationService: AutomationService) { }

    @Get('/ids')
    async getAutomationsIds(@GetOrgFromRequest() org: Organization) {
        Sentry.metrics.count('public_api-request', 1);
        const automations = await this._automationService.getAutomations(org.id);
        return automations.map((a) => ({ id: a.id, name: a.name }));
    }

    @Get('/:id')
    async getAutomationById(
        @GetOrgFromRequest() org: Organization,
        @Param('id') id: string
    ) {
        Sentry.metrics.count('public_api-request', 1);
        const automation = await this._automationService.getAutomationById(org.id, id);
        if (!automation) {
            throw new NotFoundException('Automation not found');
        }
        return automation;
    }

    @Get('/schedule/:id')
    async getAutomationSchedule(
        @GetOrgFromRequest() org: Organization,
        @Param('id') id: string
    ) {
        Sentry.metrics.count('public_api-request', 1);
        const automation = await this._automationService.getAutomationById(org.id, id);
        if (!automation) {
            throw new NotFoundException('Automation not found');
        }
        return {
            timeSlots: automation?.timeSlots || [],
            storyTimeSlots: automation?.storyTimeSlots || [],
            daysOfWeek: automation?.daysOfWeek || [],
        };
    }
}
