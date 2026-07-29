import type { OpportunityWorkflowDto } from '@tfg/types';
import { OpportunityWorkflowService } from '../services/opportunity-workflow.service';
import {
  FindOpportunityDecisionResultsHandler,
  FindOpportunityDecisionResultsQuery,
} from './find-opportunity-decision-results';
import { FindOpportunityStepActionsHandler, FindOpportunityStepActionsQuery } from './find-opportunity-step-actions';
import { FindOpportunityWorkflowHandler, FindOpportunityWorkflowQuery } from './find-opportunity-workflow';

describe('Opportunity workflow query handlers', () => {
  const opportunityId = '019fa900-0000-7000-8000-000000000011';
  const accountId = '019fa900-0000-7000-8000-000000000012';
  const result = {
    workflow: { steps: [] },
    actions: [{ id: 'action' }],
    decisions: [{ id: 'decision' }],
  } as unknown as OpportunityWorkflowDto;

  function createService() {
    const find = jest.fn().mockResolvedValue(result);
    return {
      service: { find } as unknown as jest.Mocked<OpportunityWorkflowService>,
      find,
    };
  }

  it('returns the complete workflow view', async () => {
    const { service, find } = createService();
    const handler = new FindOpportunityWorkflowHandler(service);

    await expect(handler.execute(new FindOpportunityWorkflowQuery(opportunityId, accountId))).resolves.toBe(result);
    expect(find).toHaveBeenCalledWith(opportunityId, accountId);
  });

  it('returns runtime actions', async () => {
    const { service } = createService();
    const handler = new FindOpportunityStepActionsHandler(service);

    await expect(handler.execute(new FindOpportunityStepActionsQuery(opportunityId, accountId))).resolves.toBe(
      result.actions,
    );
  });

  it('returns decision results', async () => {
    const { service } = createService();
    const handler = new FindOpportunityDecisionResultsHandler(service);

    await expect(handler.execute(new FindOpportunityDecisionResultsQuery(opportunityId, accountId))).resolves.toBe(
      result.decisions,
    );
  });
});
