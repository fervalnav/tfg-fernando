export { OpportunityModule } from './opportunity.module';
export { OpportunityNotFoundException } from './domain/exceptions/opportunity-not-found.exception';
export { OpportunityFinder } from './application/services/opportunity.finder';
export {
  OpportunityCreatedEvent,
  OpportunityQualificationUpdatedEvent,
} from './application/events/opportunity-workflow.events';
