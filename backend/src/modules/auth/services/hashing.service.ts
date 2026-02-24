import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { IHashingService } from '../domain/interfaces/hashing-service.interface';

@Injectable()
export class HashingService implements IHashingService {
  async hash(value: string): Promise<string> {
    return argon2.hash(value, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, value);
  }
}
