import { IsString, MinLength } from 'class-validator';
import type { UpdateSummaryResultPayload } from '@tfg/types';

export class UpdateSummaryResultDto implements UpdateSummaryResultPayload {
  @IsString()
  @MinLength(1)
  result!: string;
}
