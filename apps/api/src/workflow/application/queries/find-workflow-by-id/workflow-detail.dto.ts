import { ApiProperty } from '@nestjs/swagger';
import type {
  WorkflowDetailDto as IWorkflowDetailDto,
  WorkflowStepDto as IWorkflowStepDto,
  DefaultWorkflowStepActionDto as IDefaultWorkflowStepActionDto,
  ActionTargetType,
  StepType,
} from '@tfg/types';
import type { Workflow } from '../../../domain/workflow.entity';
import type { WorkflowStep } from '../../../domain/workflow-step.entity';
import type { DefaultWorkflowStepAction } from '../../../domain/default-workflow-step-action.entity';

export class DefaultWorkflowStepActionResponseDto implements IDefaultWorkflowStepActionDto {
  @ApiProperty() id!: string;
  @ApiProperty() workflowStepId!: string;
  @ApiProperty() name!: string;
  @ApiProperty() targetType!: ActionTargetType;
  @ApiProperty({ nullable: true }) targetId!: string | null;
  @ApiProperty({ nullable: true }) metadata!: Record<string, unknown> | null;
  @ApiProperty() position!: number;

  static fromEntity(entity: DefaultWorkflowStepAction): DefaultWorkflowStepActionResponseDto {
    const dto = new DefaultWorkflowStepActionResponseDto();
    dto.id = entity.id;
    dto.workflowStepId = entity.workflowStepId;
    dto.name = entity.name;
    dto.targetType = entity.targetType;
    dto.targetId = entity.targetId;
    dto.metadata = entity.metadata;
    dto.position = entity.position;
    return dto;
  }
}

export class WorkflowStepResponseDto implements IWorkflowStepDto {
  @ApiProperty() id!: string;
  @ApiProperty() workflowId!: string;
  @ApiProperty() name!: string;
  @ApiProperty() type!: StepType;
  @ApiProperty({ nullable: true }) condition!: string | null;
  @ApiProperty() position!: number;
  @ApiProperty({ type: () => [DefaultWorkflowStepActionResponseDto] })
  actions!: DefaultWorkflowStepActionResponseDto[];

  static fromEntity(entity: WorkflowStep, actions: DefaultWorkflowStepAction[]): WorkflowStepResponseDto {
    const dto = new WorkflowStepResponseDto();
    dto.id = entity.id;
    dto.workflowId = entity.workflowId;
    dto.name = entity.name;
    dto.type = entity.type;
    dto.condition = entity.condition;
    dto.position = entity.position;
    dto.actions = actions
      .sort((a, b) => a.position - b.position)
      .map((a) => DefaultWorkflowStepActionResponseDto.fromEntity(a));
    return dto;
  }
}

export class WorkflowDetailResponseDto implements IWorkflowDetailDto {
  @ApiProperty() id!: string;
  @ApiProperty() accountId!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ nullable: true }) description!: string | null;
  @ApiProperty() stepsCount!: number;
  @ApiProperty() createdAt!: string;
  @ApiProperty({ type: () => [WorkflowStepResponseDto] }) steps!: WorkflowStepResponseDto[];

  static fromEntity(
    entity: Workflow,
    steps: WorkflowStep[],
    actionsByStep: Map<string, DefaultWorkflowStepAction[]>,
  ): WorkflowDetailResponseDto {
    const dto = new WorkflowDetailResponseDto();
    dto.id = entity.id;
    dto.accountId = entity.accountId;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.createdAt = entity.createdAt.toISOString();
    const sortedSteps = steps.sort((a, b) => a.position - b.position);
    dto.steps = sortedSteps.map((s) => WorkflowStepResponseDto.fromEntity(s, actionsByStep.get(s.id) ?? []));
    dto.stepsCount = sortedSteps.length;
    return dto;
  }
}
