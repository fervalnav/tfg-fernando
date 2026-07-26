import { ApiProperty } from '@nestjs/swagger';
import type { OpportunityDto as IOpportunityDto, FinalOutcomeType } from '@tfg/types';
import type { Opportunity } from '../../../domain/opportunity.entity';

export class OpportunityDto implements IOpportunityDto {
  @ApiProperty() id!: string;
  @ApiProperty() accountId!: string;
  @ApiProperty() title!: string;
  @ApiProperty({ nullable: true }) description!: string | null;
  @ApiProperty({ nullable: true }) amount!: number | null;
  @ApiProperty({ nullable: true }) currency!: string | null;
  @ApiProperty() pipelineId!: string;
  @ApiProperty() pipelineStatusId!: string;
  @ApiProperty() sortPoints!: number;
  @ApiProperty({ nullable: true }) workflowId!: string | null;
  @ApiProperty({ nullable: true }) workflowStepId!: string | null;
  @ApiProperty({ nullable: true }) organizationId!: string | null;
  @ApiProperty({ nullable: true }) dueDate!: string | null;
  @ApiProperty({ nullable: true }) finalOutcomeType!: FinalOutcomeType | null;
  @ApiProperty({ nullable: true }) closedAt!: string | null;
  @ApiProperty({ type: [String] }) responsibleUserIds!: string[];
  @ApiProperty({ type: [String] }) responsibleTeamIds!: string[];
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;

  static fromEntity(entity: Opportunity): OpportunityDto {
    const dto = new OpportunityDto();
    const p = entity.toPrimitives();
    dto.id = p.id;
    dto.accountId = p.accountId;
    dto.title = p.title;
    dto.description = p.description;
    dto.amount = p.amount;
    dto.currency = p.currency;
    dto.pipelineId = p.pipelineId;
    dto.pipelineStatusId = p.pipelineStatusId;
    dto.sortPoints = p.sortPoints;
    dto.workflowId = p.workflowId;
    dto.workflowStepId = p.workflowStepId;
    dto.organizationId = p.organizationId;
    dto.dueDate = p.dueDate ? p.dueDate.toISOString() : null;
    dto.finalOutcomeType = p.finalOutcomeType;
    dto.closedAt = p.closedAt ? p.closedAt.toISOString() : null;
    dto.responsibleUserIds = p.responsibleUserIds;
    dto.responsibleTeamIds = p.responsibleTeamIds;
    dto.createdAt = p.createdAt.toISOString();
    dto.updatedAt = p.updatedAt.toISOString();
    return dto;
  }
}
