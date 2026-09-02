import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class ApplicationIdDto {
  @IsNotEmpty()
  @IsUUID()
  id!: string;
}

export class CreateApplicationDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(3, 200)
  description?: string;
}

export class UpdateApplicationDto {
  @IsOptional()
  @IsString()
  @Length(3, 50)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(3, 200)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
