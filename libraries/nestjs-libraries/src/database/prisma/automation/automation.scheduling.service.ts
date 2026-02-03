import { BadRequestException, Injectable } from '@nestjs/common';
import { PostsService } from '@gitroom/nestjs-libraries/database/prisma/posts/posts.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';
import { AutomationRepository } from '@gitroom/nestjs-libraries/database/prisma/automation/automation.repository';
import { AutomationHelperService } from '@gitroom/nestjs-libraries/database/prisma/automation/helpers/automation.helper';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class AutomationSchedulingService {
    constructor(
        private _automationRepository: AutomationRepository,
        private postsService: PostsService,
        private _automationHelperService: AutomationHelperService
    ) { }

    async generateSchedules(orgId: string, id: string, startDate: string, endDate: string, userTimezone: string) {
        console.log('Generating schedules for:', { orgId, id, startDate, endDate, userTimezone });
        const automation = await this._automationRepository.getAutomationWithPendingMedia(orgId, id);
        if (!automation) {
            console.log('Automation not found or no pending media');
            throw new BadRequestException('Automação não encontrada ou sem mídias pendentes');
        }

        console.log('Automation found:', automation.name);
        console.log('Integrations:', automation.integrations.length);
        console.log('Media count:', automation.media.length);

        if (automation.integrations.length === 0) {
            throw new BadRequestException('A automação não possui integrações configuradas');
        }

        if (automation.media.length === 0) {
            console.log('No pending media to schedule');
            throw new BadRequestException('Não há mídias pendentes para agendar');
        }

        const daysOfWeek = JSON.parse(automation.daysOfWeek) as number[];
        const timeSlots = JSON.parse(automation.timeSlots) as string[];
        const storyTimeSlots = automation.storyTimeSlots ? JSON.parse(automation.storyTimeSlots) as string[] : [];

        console.log('Config:', { daysOfWeek, timeSlots, storyTimeSlots });

        if (daysOfWeek.length === 0 || (timeSlots.length === 0 && storyTimeSlots.length === 0)) {
            throw new BadRequestException('A automação não possui dias ou horários configurados');
        }

        if (automation.media.some((m: any) => m.postType === 'story') && storyTimeSlots.length === 0) {
            throw new BadRequestException('Você tem mídias de story mas não configurou horários de story');
        }

        // Use user timezone or default to UTC if not provided
        const tz = userTimezone || 'UTC';
        console.log('Using timezone:', tz);

        const start = startDate ? dayjs(startDate).tz(tz) : dayjs().tz(tz);
        const end = endDate ? dayjs(endDate).tz(tz) : dayjs().tz(tz).add(30, 'days');

        console.log('Date range:', { start: start.format(), end: end.format() });

        // Fetch existing schedules to avoid duplicates
        const existingSchedules = await this._automationRepository.getExistingSchedules(id, start.toDate(), end.toDate());
        console.log('Existing schedules:', existingSchedules.length);

        // Remove existingPosts check to allow independent automations
        // const integrationIds = automation.integrations.map(i => i.integrationId);
        // const existingPosts = await this._automationRepository.getExistingPosts(orgId, integrationIds, start.toDate(), end.toDate());
        // console.log('Existing posts:', existingPosts.length);

        const daysWithSchedules = new Set(
            existingSchedules.map((s) => dayjs(s.scheduledAt).tz(tz).format('YYYY-MM-DD'))
        );

        // existingPosts.forEach((post) => {
        //     daysWithSchedules.add(dayjs(post.publishDate).tz(tz).format('YYYY-MM-DD'));
        // });

        const existingScheduleKeys = new Set(
            existingSchedules.map((s) => {
                const date = dayjs(s.scheduledAt).tz(tz);
                return `${date.format('YYYY-MM-DD')}-${date.format('HH:mm')}`;
            })
        );

        // existingPosts.forEach((post) => {
        //     const date = dayjs(post.publishDate).tz(tz);
        //     existingScheduleKeys.add(`${date.format('YYYY-MM-DD')}-${date.format('HH:mm')}`);
        // });

        // Check all existing schedules to avoid reusing media
        const allExistingSchedules = await this._automationRepository.getAllExistingSchedules(id);
        const scheduledMediaPaths = new Set(allExistingSchedules.map((s) => s.mediaPath));
        console.log('Already scheduled media paths:', scheduledMediaPaths.size);

        // Filter and order pending media using helper service
        const pendingMedia = this._automationHelperService.orderMedia(automation.media, scheduledMediaPaths);

        console.log('Pending media after filter:', pendingMedia.length);

        const schedulesToCreate: { scheduledAt: Date; mediaPath: string; automationMediaId: string; postType: string | null }[] = [];
        let mediaIndex = 0;

        let currentDate = start.startOf('day');
        while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
            const dayOfWeek = currentDate.day();

            if (!daysOfWeek.includes(dayOfWeek)) {
                currentDate = currentDate.add(1, 'day');
                continue;
            }

            const currentDateKey = currentDate.format('YYYY-MM-DD');
            // const dayHasSchedules = daysWithSchedules.has(currentDateKey);
            // const isToday = currentDate.isSame(dayjs().tz(tz), 'day');

            // // console.log('Checking day:', currentDateKey, 'Day has schedules:', dayHasSchedules, 'Is today:', isToday);

            // if (dayHasSchedules && !isToday) {
            //     currentDate = currentDate.add(1, 'day');
            //     continue;
            // }

            // Process regular posts
            for (const timeSlot of timeSlots) {
                if (mediaIndex >= pendingMedia.length) break;

                const [hours, minutes] = timeSlot.split(':').map(Number);
                const scheduleDateTime = currentDate.hour(hours).minute(minutes).second(0).millisecond(0);

                if (scheduleDateTime.isBefore(dayjs().tz(tz))) {
                    // console.log('Skipping past time:', scheduleDateTime.format());
                    continue;
                }

                const scheduleKey = `${scheduleDateTime.format('YYYY-MM-DD')}-${scheduleDateTime.format('HH:mm')}`;
                if (existingScheduleKeys.has(scheduleKey)) {
                    // console.log('Skipping existing slot:', scheduleKey);
                    continue;
                }

                let currentMedia = pendingMedia[mediaIndex];

                if (!currentMedia.media || !currentMedia.media.path || scheduledMediaPaths.has(currentMedia.media.path)) {
                    mediaIndex++;
                    continue;
                }

                console.log('Scheduling post for:', scheduleDateTime.format());

                schedulesToCreate.push({
                    scheduledAt: scheduleDateTime.toDate(), // toDate() converts to UTC automatically
                    mediaPath: currentMedia.media.path,
                    automationMediaId: currentMedia.id,
                    postType: null
                });

                scheduledMediaPaths.add(currentMedia.media.path);
                mediaIndex++;
            }

            // Process story posts
            for (const timeSlot of storyTimeSlots) {
                if (mediaIndex >= pendingMedia.length) break;

                const [hours, minutes] = timeSlot.split(':').map(Number);
                const scheduleDateTime = currentDate.hour(hours).minute(minutes).second(0).millisecond(0);

                if (scheduleDateTime.isBefore(dayjs().tz(tz))) continue;

                const scheduleKey = `${scheduleDateTime.format('YYYY-MM-DD')}-${scheduleDateTime.format('HH:mm')}`;
                if (existingScheduleKeys.has(scheduleKey)) continue;

                let currentMedia = pendingMedia[mediaIndex];

                if (!currentMedia.media || !currentMedia.media.path || scheduledMediaPaths.has(currentMedia.media.path)) {
                    mediaIndex++;
                    continue;
                }

                console.log('Scheduling story for:', scheduleDateTime.format());

                schedulesToCreate.push({
                    scheduledAt: scheduleDateTime.toDate(),
                    mediaPath: currentMedia.media.path,
                    automationMediaId: currentMedia.id,
                    postType: 'story'
                });

                scheduledMediaPaths.add(currentMedia.media.path);
                mediaIndex++;
            }

            if (mediaIndex >= pendingMedia.length) break;
            currentDate = currentDate.add(1, 'day');
        }

        // Bulk create schedules
        if (schedulesToCreate.length > 0) {
            await this._automationRepository.createSchedules(
                schedulesToCreate.map(s => ({
                    automationId: id,
                    scheduledAt: s.scheduledAt,
                    mediaPath: s.mediaPath,
                    postType: s.postType,
                    organizationId: orgId
                }))
            );

            // Update media status
            const mediaIds = schedulesToCreate.map(s => s.automationMediaId);
            await this._automationRepository.updateMediaStatus(mediaIds, 'AGENDADO');

            // Create actual posts
            // Calculate starting index for sequential captions or find last index for random
            let postIndex = (automation as any)._count?.posts || 0;
            let lastCaptionIndex: number | undefined = undefined;

            // Try to find the index of the last used caption to avoid immediate repetition in random mode
            const lastPost = (automation as any).posts?.[0];
            if (lastPost) {
                try {
                    const lastPostValue = JSON.parse(lastPost.content || '[]');
                    const lastCaptionText = lastPostValue[0]?.content || '';
                    lastCaptionIndex = automation.captions.findIndex((c: any) => c.text === lastCaptionText);
                    if (lastCaptionIndex === -1) lastCaptionIndex = undefined;
                } catch (e) {
                    // Ignore parsing errors
                }
            }

            for (const schedule of schedulesToCreate) {
                const { index: usedIndex } = await this.createPostFromAutomation(
                    orgId,
                    automation,
                    dayjs(schedule.scheduledAt).format('YYYY-MM-DDTHH:mm:ss'),
                    schedule.postType,
                    schedule.mediaPath,
                    schedule.automationMediaId,
                    postIndex++,
                    lastCaptionIndex
                );

                // Update lastCaptionIndex for the next iteration
                lastCaptionIndex = usedIndex;
            }
        }

        return { totalScheduled: schedulesToCreate.length };
    }

    private async createPostFromAutomation(
        orgId: string,
        automation: any,
        date: string,
        postType: string | null,
        mediaPath?: string,
        mediaId?: string,
        index: number = 0,
        lastIndex?: number
    ) {
        const group = makeId(10);
        const integrations = automation.integrations.map((i: any) => i.integrationId);

        // Pick a caption using helper service
        const { text: caption, index: usedIndex } = this._automationHelperService.selectCaption(automation, index, lastIndex);

        // Find the specific media used for this schedule
        let mediaItem: any = null;
        if (mediaId) {
            mediaItem = automation.media.find((m: any) => m.id === mediaId)?.media;
        }

        // Fallback if not found (should not happen with new logic)
        if (!mediaItem && mediaPath) {
            mediaItem = automation.media.find((m: any) => m.media.path === mediaPath)?.media;
        }

        const media = mediaItem ? [mediaItem] : [];

        const postData = {
            type: 'schedule' as const,
            date,
            order: '',
            shortLink: (automation.organization as any)?.shortlink === 'YES' || (automation.organization as any)?.shortlink === 'ASK',
            tags: [],
            automationId: automation.id,
            posts: integrations.map((integrationId: string) => ({
                group,
                integration: { id: integrationId },
                settings: {
                    __type: automation.integrations.find((i: any) => i.integrationId === integrationId).integration.providerIdentifier,
                    post_type: postType || 'post',
                },
                value: [{
                    id: '',
                    content: caption,
                    delay: 0,
                    image: media.map((m: any) => ({
                        id: m.id,
                        name: m.name,
                        path: m.path,
                    })),
                }],
            })),
        };

        await this.postsService.createPost(orgId, postData as any);
        return { index: usedIndex };
    }
}
