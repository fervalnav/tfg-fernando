import { Injectable } from '@nestjs/common';
import { Opportunity } from '../../domain/opportunity.entity';
import { OpportunityRepository } from '../../domain/opportunity.repository';
import { OpportunityNotFoundException } from '../../domain/exceptions/opportunity-not-found.exception';

@Injectable()
export class OpportunityFinder {
  constructor(private readonly repository: OpportunityRepository) {}

  async find(id: string, accountId: string): Promise<Opportunity> {
    const opportunity = await this.repository.findById(id, accountId);
    if (!opportunity) throw new OpportunityNotFoundException(id);
    return opportunity;
  }
}
