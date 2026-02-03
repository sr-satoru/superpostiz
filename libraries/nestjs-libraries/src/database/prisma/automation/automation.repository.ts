import { PrismaRepository, PrismaTransaction } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { AutomationDto } from '@gitroom/nestjs-libraries/dtos/automation/automation.dto';

@Injectable()
export class AutomationRepository {
    constructor(
        private _automation: PrismaRepository<'automation'>,
        private _automationSchedule: PrismaRepository<'automationSchedule'>,
        private _automationMedia: PrismaRepository<'automationMedia'>,
        private _media: PrismaRepository<'media'>,
        private _post: PrismaRepository<'post'>,
        private _tx: PrismaTransaction
    ) { }

    getAutomations(orgId: string) {
        return this._automation.model.automation.findMany({
            where: { organizationId: orgId },
            include: {
                integrations: {
                    include: {
                        integration: true,
                    },
                },
                media: {
                    include: {
                        media: true,
                    },
                },
                captions: true,
                _count: {
                    select: {
                        schedules: true,
                    },
                },
            },
        });
    }

    getAutomationById(orgId: string, id: string) {
        return this._automation.model.automation.findFirst({
            where: { id, organizationId: orgId },
            include: {
                integrations: {
                    include: {
                        integration: true,
                    },
                },
                media: {
                    include: {
                        media: true,
                    },
                },
                captions: true,
                _count: {
                    select: {
                        schedules: true,
                    },
                },
            },
        });
    }

    async createAutomation(orgId: string, data: AutomationDto, id?: string) {
        const {
            name,
            captions,
            integrationIds,
            media,
            daysOfWeek,
            timeSlots,
            storyTimeSlots,
            deleteMediaAfterPost,
            randomCaptions,
            deleteScheduledMedia,
        } = data;

        const automationData = {
            name,
            organizationId: orgId,
            timeSlots: JSON.stringify(timeSlots),
            storyTimeSlots: storyTimeSlots ? JSON.stringify(storyTimeSlots) : null,
            daysOfWeek: JSON.stringify(daysOfWeek),
            deleteMediaAfterPost,
            randomCaptions: !!randomCaptions,
        };

        return this._tx.model.$transaction(async (tx) => {
            const automation = id
                ? await tx.automation.update({
                    where: { id },
                    data: automationData,
                })
                : await tx.automation.create({
                    data: automationData,
                });

            // Clear existing relations if updating
            if (id) {
                await tx.automationIntegration.deleteMany({ where: { automationId: id } });
                await tx.automationMedia.deleteMany({ where: { automationId: id } });
                await tx.automationCaption.deleteMany({ where: { automationId: id } });
            }

            // Create relations
            await tx.automationIntegration.createMany({
                data: integrationIds.map((integrationId) => ({
                    automationId: automation.id,
                    integrationId,
                })),
            });

            await tx.automationMedia.createMany({
                data: media.map((m) => ({
                    automationId: automation.id,
                    mediaId: m.id,
                    postType: m.postType,
                    organizationId: orgId,
                })),
            });

            await tx.automationCaption.createMany({
                data: captions.map((text) => ({
                    automationId: automation.id,
                    text,
                    organizationId: orgId,
                })),
            });

            return automation;
        });
    }

    async deleteAutomation(orgId: string, id: string) {
        return this._automation.model.automation.delete({
            where: { id, organizationId: orgId },
        });
    }

    async getAutomationWithPendingMedia(orgId: string, automationId: string) {
        return this._automation.model.automation.findFirst({
            where: {
                id: automationId,
                organizationId: orgId,
            },
            include: {
                integrations: {
                    include: {
                        integration: true,
                    },
                },
                media: {
                    include: {
                        media: true,
                    },
                    where: {
                        status: 'PENDENTE',
                    },
                },
                captions: true,
                _count: {
                    select: {
                        posts: true,
                    },
                },
                posts: {
                    take: 1,
                    orderBy: {
                        publishDate: 'desc',
                    },
                    where: {
                        state: 'PUBLISHED',
                    },
                },
            },
        });
    }

    async getExistingSchedules(automationId: string, start: Date, end: Date) {
        return this._automationSchedule.model.automationSchedule.findMany({
            where: {
                automationId: automationId,
                scheduledAt: {
                    gte: start,
                    lte: end,
                },
            },
        });
    }

    async getExistingPosts(orgId: string, integrationIds: string[], start: Date, end: Date) {
        return this._post.model.post.findMany({
            where: {
                organizationId: orgId,
                publishDate: {
                    gte: start,
                    lte: end,
                },
                integrationId: {
                    in: integrationIds,
                },
            },
        });
    }

    async getAllExistingSchedules(automationId: string) {
        return this._automationSchedule.model.automationSchedule.findMany({
            where: {
                automationId: automationId,
            },
            select: {
                mediaPath: true,
            },
        });
    }

    async createSchedules(schedules: { automationId: string; scheduledAt: Date; mediaPath: string; postType: string | null; organizationId: string }[]) {
        return this._automationSchedule.model.automationSchedule.createMany({
            data: schedules,
        });
    }

    async updateMediaStatus(mediaIds: string[], status: 'AGENDADO' | 'PENDENTE') {
        return this._automationMedia.model.automationMedia.updateMany({
            where: {
                id: {
                    in: mediaIds,
                },
            },
            data: {
                status: status,
            },
        });
    }

    async deleteAutomationSchedules(orgId: string, automationId: string) {
        return this._tx.model.$transaction(async (tx) => {
            // Delete all posts associated with this automation that are still in QUEUE
            await tx.post.deleteMany({
                where: {
                    automationId,
                    state: 'QUEUE',
                    organizationId: orgId,
                },
            });

            // Delete all schedules
            await tx.automationSchedule.deleteMany({
                where: {
                    automationId,
                    organizationId: orgId,
                },
            });

            // Reset all media status to PENDENTE for this automation
            await tx.automationMedia.updateMany({
                where: {
                    automationId,
                    organizationId: orgId,
                },
                data: {
                    status: 'PENDENTE',
                },
            });
        });
    }

    async getScheduledMediaPaths(orgId: string, automationId: string) {
        const posts = await this._post.model.post.findMany({
            where: {
                automationId,
                organizationId: orgId,
                state: {
                    in: ['PUBLISHED', 'ERROR'],
                },
                deletedAt: null,
            },
            select: {
                image: true,
            },
        });

        const paths = posts.flatMap((post) => {
            try {
                const images = JSON.parse(post.image || '[]');
                return images.map((img: any) => img.path).filter(Boolean);
            } catch (e) {
                return [];
            }
        });

        return [...new Set(paths)];
    }

    async deleteMediaByPath(orgId: string, path: string) {
        return this._media.model.media.deleteMany({
            where: {
                path,
                organizationId: orgId,
            },
        });
    }
}
