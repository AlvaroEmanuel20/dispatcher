import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  NotificationChannel,
  NotificationTemplate,
} from '../generated/prisma/enums';

export class NewNotificationDto {
  @IsNotEmpty()
  @IsEmail()
  recipient!: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(NotificationChannel, {
    message: () =>
      `The channel must to be: ${Object.values(NotificationChannel)
        .map((v) => v.toLowerCase())
        .join(', ')}`,
  })
  channel!: NotificationChannel;

  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(NotificationTemplate, {
    message: () =>
      `The template must to be: ${Object.values(NotificationTemplate)
        .map((v) => v.toLowerCase())
        .join(', ')}`,
  })
  template!: NotificationTemplate;
}
