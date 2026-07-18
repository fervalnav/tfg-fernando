import { IsBoolean, IsHexColor, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OUTCOME_TYPES } from '../../../domain/value-objects/outcome-type.vo';

export class UpdatePipelineStatusDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsHexColor() backgroundColor?: string;
  @ApiPropertyOptional() @IsOptional() @IsHexColor() textColor?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isTerminal?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsIn(OUTCOME_TYPES) outcomeType?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() showInKanban?: boolean;
}
