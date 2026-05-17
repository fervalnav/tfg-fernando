import { Injectable } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class IdService {
  generate(): string {
    return uuidv7();
  }
}
