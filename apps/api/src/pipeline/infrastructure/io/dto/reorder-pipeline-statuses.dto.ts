import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderPipelineStatusesDto {
  @ApiProperty({ type: [String] }) @IsArray() @IsUUID('all', { each: true }) ids!: string[];
}
