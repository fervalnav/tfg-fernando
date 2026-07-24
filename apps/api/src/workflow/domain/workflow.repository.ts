import type { Workflow } from './workflow.entity';

export abstract class WorkflowRepository {
  abstract save(workflow: Workflow): Promise<void>;
  abstract findById(id: string): Promise<Workflow | null>;
  abstract findAllByAccountId(accountId: string, page: number, limit: number): Promise<Workflow[]>;
  abstract countByAccountId(accountId: string): Promise<number>;
  abstract delete(id: string): Promise<void>;
}
