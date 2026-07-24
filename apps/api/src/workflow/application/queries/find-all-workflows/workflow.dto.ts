import { ApiProperty } from '@nestjs/swagger';
import type { WorkflowDto as IWorkflowDto } from '@tfg/types';
import type { Workflow } from '../../../domain/workflow.entity';

export class WorkflowDto implements IWorkflowDto {
  @ApiProperty() id!: string;
  @ApiProperty() accountId!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ nullable: true }) description!: string | null;
  @ApiProperty() stepsCount!: number;
  @ApiProperty() createdAt!: string;

  static fromEntity(entity: Workflow, stepsCount: number): WorkflowDto {
    const dto = new WorkflowDto();
    dto.id = entity.id;
    dto.accountId = entity.accountId;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.stepsCount = stepsCount;
    dto.createdAt = entity.createdAt.toISOString();
    return dto;
  }
}
