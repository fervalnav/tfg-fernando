import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { AttachmentRepository } from '../../domain/attachment.repository';
import type { Attachment } from '../../domain/attachment.entity';
import { AttachmentOrmEntity } from './attachment.orm-entity';

@Injectable()
export class MikroOrmAttachmentRepository implements AttachmentRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<Attachment | null> {
    const entity = await this.em.findOne(AttachmentOrmEntity, { id });
    return entity?.toDomainEntity() ?? null;
  }

  async findByOpportunityId(opportunityId: string, accountId: string): Promise<Attachment[]> {
    const entities = await this.em.find(
      AttachmentOrmEntity,
      { opportunityId, accountId },
      { orderBy: { createdAt: 'ASC' } },
    );
    return entities.map((entity) => entity.toDomainEntity());
  }

  async save(attachment: Attachment): Promise<void> {
    await this.em.persistAndFlush(new AttachmentOrmEntity(attachment.toPrimitives()));
  }

  async delete(id: string): Promise<void> {
    await this.em.nativeDelete(AttachmentOrmEntity, { id });
  }
}
