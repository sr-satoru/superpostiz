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
                // Para storage local, precisamos do path absoluto no disco para o unlink funcionar
                // Se o path for uma URL (starts with http), convertemos para o caminho do UPLOAD_DIRECTORY
                const pathToDelete = path.startsWith('http') && path.includes('/uploads/')
                    ? process.env.UPLOAD_DIRECTORY + '/' + path.split('/uploads/')[1]
                    : (path.startsWith('/') ? path : process.env.UPLOAD_DIRECTORY + '/' + path);

                await this.storage.removeFile(pathToDelete);
                await this._automationRepository.deleteMediaByPath(orgId, path);
            } catch (e) {
                console.error(`Error deleting physical media: ${path}`, e);
            }
        }
    }
}
