import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class ApiKeyApplicationIdDto {
  @IsNotEmpty()
  @IsUUID()
  applicationId!: string;
}

export class ApiKeyIdApplicationIdDto {
  @IsNotEmpty()
  @IsUUID()
  applicationId!: string;

  @IsNotEmpty()
  @IsUUID()
  apiKeyId!: string;
}

export class CreateApiKeyDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  name!: string;

  @IsOptional()
  @IsDate()
  expiresAt?: Date;
}

export class UpdateApiKeyDto {
  @IsOptional()
  @IsString()
  @Length(3, 50)
  name?: string;

  @IsOptional()
  @IsDate()
  expiresAt?: Date;

  @IsOptional()
  @IsDate()
  revokedAt?: Date;
}
