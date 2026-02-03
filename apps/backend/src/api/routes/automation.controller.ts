import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
} from '@nestjs/common';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { Organization } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { CheckPolicies } from '@gitroom/backend/services/auth/permissions/permissions.ability';
import { AutomationService } from '@gitroom/nestjs-libraries/database/prisma/automation/automation.service';
import { AutomationSchedulingService } from '@gitroom/nestjs-libraries/database/prisma/automation/automation.scheduling.service';
import { AutomationDto } from '@gitroom/nestjs-libraries/dtos/automation/automation.dto';
import { AuthorizationActions, Sections } from '@gitroom/backend/services/auth/permissions/permission.exception.class';

@ApiTags('Automation')
@Controller('/automation')
export class AutomationController {
    constructor(
        private _automationService: AutomationService,
        private _automationSchedulingService: AutomationSchedulingService
    ) { }

    @Get('/')
    async getAutomations(@GetOrgFromRequest() org: Organization) {
        return this._automationService.getAutomations(org.id);
    }

    @Get('/:id')
    async getAutomationById(
        @GetOrgFromRequest() org: Organization,
        @Param('id') id: string
    ) {
        return this._automationService.getAutomationById(org.id, id);
    }

    @Post('/')
    @CheckPolicies([AuthorizationActions.Create, Sections.POSTS_PER_MONTH])
    async createAutomation(
        @GetOrgFromRequest() org: Organization,
        @Body() body: AutomationDto
    ) {
        return this._automationService.createAutomation(org.id, body);
    }

    @Put('/:id')
    @CheckPolicies([AuthorizationActions.Update, Sections.POSTS_PER_MONTH])
    async updateAutomation(
        @GetOrgFromRequest() org: Organization,
        @Body() body: AutomationDto,
        @Param('id') id: string
    ) {
        return this._automationService.createAutomation(org.id, body, id);
    }

    @Delete('/:id')
    @CheckPolicies([AuthorizationActions.Delete, Sections.POSTS_PER_MONTH])
    async deleteAutomation(
        @GetOrgFromRequest() org: Organization,
        @Param('id') id: string
    ) {
        return this._automationService.deleteAutomation(org.id, id);
    }

    @Post('/:id/schedule')
    @CheckPolicies([AuthorizationActions.Create, Sections.POSTS_PER_MONTH])
    async generateSchedules(
        @GetOrgFromRequest() org: Organization,
        @Param('id') id: string,
        @Body('startDate') startDate: string,
        @Body('endDate') endDate: string,
        @Body('timezone') timezone: string
    ) {
        return this._automationSchedulingService.generateSchedules(
            org.id,
            id,
            startDate,
            endDate,
            timezone
        );
    }

    @Delete('/:id/schedules')
    @CheckPolicies([AuthorizationActions.Delete, Sections.POSTS_PER_MONTH])
    async deleteAutomationSchedules(
        @GetOrgFromRequest() org: Organization,
        @Param('id') id: string
    ) {
        return this._automationService.deleteAutomationSchedules(org.id, id);
    }
}
