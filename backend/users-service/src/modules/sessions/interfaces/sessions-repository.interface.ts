import { Session } from '../entities/session.entity';
import { CreateSession } from '../types/session.type';

export interface SessionsRepository {
  create(sessionData: CreateSession): Promise<Session>;
}
