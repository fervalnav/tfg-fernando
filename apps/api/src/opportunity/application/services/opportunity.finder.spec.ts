import { Opportunity } from '../../domain/opportunity.entity';
import { OpportunityNotFoundException } from '../../domain/exceptions/opportunity-not-found.exception';
import { OpportunityRepository } from '../../domain/opportunity.repository';
import { OpportunityFinder } from './opportunity.finder';

describe('OpportunityFinder', () => {
  const accountId = '019fa800-0000-7000-8000-000000000001';
  const opportunityId = '019fa800-0000-7000-8000-000000000002';

  function createFinder(opportunity: Opportunity | null) {
    const repository = {
      findById: jest.fn().mockResolvedValue(opportunity),
    } as unknown as jest.Mocked<OpportunityRepository>;
    return { finder: new OpportunityFinder(repository), repository };
  }

  it('returns the opportunity from the requested account', async () => {
    const opportunity = Opportunity.create({
      id: opportunityId,
      accountId,
      title: 'Opportunity',
      pipelineId: '019fa800-0000-7000-8000-000000000003',
      pipelineStatusId: '019fa800-0000-7000-8000-000000000004',
      sortPoints: 1000,
    });
    const { finder, repository } = createFinder(opportunity);

    await expect(finder.find(opportunityId, accountId)).resolves.toBe(opportunity);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.findById).toHaveBeenCalledWith(opportunityId, accountId);
  });

  it('throws when the opportunity does not exist in the account', async () => {
    const { finder } = createFinder(null);

    await expect(finder.find(opportunityId, accountId)).rejects.toBeInstanceOf(OpportunityNotFoundException);
  });
});
