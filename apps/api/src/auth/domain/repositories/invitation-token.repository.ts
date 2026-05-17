import type { InvitationToken } from '../entities/invitation-token.entity';

export abstract class InvitationTokenRepository {
  abstract save(token: InvitationToken): Promise<void>;
  abstract findByTokenHash(hash: string): Promise<InvitationToken | null>;
  abstract update(token: InvitationToken): Promise<void>;
}
