import { IsArray, IsBoolean, IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CustomFieldType } from '../../../domain/default-custom-field.entity';

export class CreateDefaultCustomFieldDto {
  @ApiProperty() @IsUUID('all') id!: string;
  @ApiProperty() @IsString() @MinLength(1) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({ enum: ['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'CLASSIFIER'] })
  @IsIn(['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'CLASSIFIER'])
  type!: CustomFieldType;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) classifiers?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() canSelectMultiple?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() automatic?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() aiPrompt?: string;
}
