import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export interface AutomationAudio {
    id: string;
    title?: string;
    artist?: string;
    image?: string;
    previewUrl?: string;
    duration?: number;
    audio_volume?: number;
    video_volume?: number;
}

export class AutomationDto {
    @IsString()
    name: string;

    @IsArray()
    @IsString({ each: true })
    captions: string[];

    @IsArray()
    @IsString({ each: true })
    integrationIds: string[];

    @IsArray()
    media: Array<{ id: string; postType: string | null }>;

    @IsArray()
    daysOfWeek: number[];

    @IsArray()
    @IsString({ each: true })
    timeSlots: string[];

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    storyTimeSlots?: string[];

    @IsBoolean()
    deleteMediaAfterPost: boolean;

    @IsBoolean()
    @IsOptional()
    randomCaptions?: boolean;

    @IsBoolean()
    @IsOptional()
    deleteScheduledMedia?: boolean;

    @IsArray()
    @IsOptional()
    audios?: AutomationAudio[];
}
