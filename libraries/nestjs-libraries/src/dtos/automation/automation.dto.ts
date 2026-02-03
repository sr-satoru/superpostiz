import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

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
}
