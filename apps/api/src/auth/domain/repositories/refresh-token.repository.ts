import type { RefreshToken } from '../entities/refresh-token.entity';

export abstract class RefreshTokenRepository {
  abstract save(token: RefreshToken): Promise<void>;
  abstract findByTokenHash(hash: string): Promise<RefreshToken | null>;
  abstract update(token: RefreshToken): Promise<void>;
  abstract revokeAllByUser(userId: string): Promise<void>;
}
