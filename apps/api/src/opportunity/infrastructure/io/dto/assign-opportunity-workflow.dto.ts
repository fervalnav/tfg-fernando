import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import type { AssignOpportunityWorkflowPayload } from '@tfg/types';

export class AssignOpportunityWorkflowDto implements AssignOpportunityWorkflowPayload {
  @ApiProperty()
  @IsUUID('all')
  workflowId!: string;
}
