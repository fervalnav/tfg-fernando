import { IsArray, IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { CustomFieldType } from '../../../domain/default-custom-field.entity';

export class UpdateDefaultCustomFieldDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) name?: string;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsString() description?: string | null;
  @ApiPropertyOptional({ enum: ['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'CLASSIFIER'] })
  @IsOptional()
  @IsIn(['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'CLASSIFIER'])
  type?: CustomFieldType;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) classifiers?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() canSelectMultiple?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() automatic?: boolean;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsString() aiPrompt?: string | null;
}
