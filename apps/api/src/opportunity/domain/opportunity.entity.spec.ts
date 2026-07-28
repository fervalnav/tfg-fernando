import { Opportunity } from './opportunity.entity';

describe('Opportunity', () => {
  it('updates responsible users and teams without sharing the input arrays', () => {
    const opportunity = Opportunity.create({
      id: '019fa500-0000-7000-8000-000000000001',
      accountId: '019fa500-0000-7000-8000-000000000002',
      title: 'Opportunity',
      pipelineId: '019fa500-0000-7000-8000-000000000003',
      pipelineStatusId: '019fa500-0000-7000-8000-000000000004',
      sortPoints: 1000,
    });
    const userIds = ['019fa500-0000-7000-8000-000000000005'];
    const teamIds = ['019fa500-0000-7000-8000-000000000006'];

    opportunity.update({ responsibleUserIds: userIds, responsibleTeamIds: teamIds });
    userIds.length = 0;
    teamIds.length = 0;

    expect(opportunity.responsibleUserIds).toEqual(['019fa500-0000-7000-8000-000000000005']);
    expect(opportunity.responsibleTeamIds).toEqual(['019fa500-0000-7000-8000-000000000006']);
  });
});
