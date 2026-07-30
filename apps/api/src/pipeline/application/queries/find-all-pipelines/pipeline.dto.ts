import { ApiProperty } from '@nestjs/swagger';
import type { PipelineDto as IPipelineDto, PipelineStatusDto as IPipelineStatusDto } from '@tfg/types';
import type { Pipeline } from '../../../domain/pipeline.entity';
import type { PipelineStatus } from '../../../domain/pipeline-status.entity';

export class PipelineStatusResponseDto implements IPipelineStatusDto {
  @ApiProperty() id!: string;
  @ApiProperty() pipelineId!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ nullable: true }) description!: string | null;
  @ApiProperty({ nullable: true }) backgroundColor!: string | null;
  @ApiProperty({ nullable: true }) textColor!: string | null;
  @ApiProperty() isInitial!: boolean;
  @ApiProperty() isTerminal!: boolean;
  @ApiProperty() outcomeType!: 'NONE' | 'WON' | 'LOST' | 'DROPPED';
  @ApiProperty() showInKanban!: boolean;
  @ApiProperty() sortPoints!: number;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;

  static fromEntity(entity: PipelineStatus): PipelineStatusResponseDto {
    const dto = new PipelineStatusResponseDto();
    dto.id = entity.id;
    dto.pipelineId = entity.pipelineId;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.backgroundColor = entity.backgroundColor;
    dto.textColor = entity.textColor;
    dto.isInitial = entity.isInitial;
    dto.isTerminal = entity.isTerminal;
    dto.outcomeType = entity.outcomeType;
    dto.showInKanban = entity.showInKanban;
    dto.sortPoints = entity.sortPoints;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}

export class PipelineResponseDto implements IPipelineDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ type: [PipelineStatusResponseDto] }) statuses!: PipelineStatusResponseDto[];
  @ApiProperty() createdAt!: string;

  static fromEntity(pipeline: Pipeline, statuses: PipelineStatus[]): PipelineResponseDto {
    const dto = new PipelineResponseDto();
    dto.id = pipeline.id;
    dto.name = pipeline.name;
    dto.statuses = statuses.map((status) => PipelineStatusResponseDto.fromEntity(status));
    dto.createdAt = pipeline.createdAt.toISOString();
    return dto;
  }
}
