import { Injectable } from '@nestjs/common';
import { UploadFactory } from '@gitroom/nestjs-libraries/upload/upload.factory';
import { AutomationRepository } from '@gitroom/nestjs-libraries/database/prisma/automation/automation.repository';

@Injectable()
export class AutomationMediaService {
    private storage = UploadFactory.createStorage();

    constructor(private _automationRepository: AutomationRepository) { }

    async deletePhysicalMedia(orgId: string, automationId: string) {
        const mediaPaths = await this._automationRepository.getScheduledMediaPaths(orgId, automationId);

        for (const path of mediaPaths) {
            try {
                // Para storage local, o path já vem no formato correto do banco
                // Para Cloudflare, path é a URL completa
                await this.storage.removeFile(path);
                await this._automationRepository.deleteMediaByPath(orgId, path);
            } catch (e) {
                console.error(`Error deleting physical media: ${path}`, e);
            }
        }
    }
}
