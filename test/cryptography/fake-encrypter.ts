import { Encrypter } from '@/domain/forum/application/cryptography/encrypter';
import { JwtSignOptions } from '@nestjs/jwt';

export class FakeEncrypter implements Encrypter {
  async encrypt(payload: Buffer | object, options?: JwtSignOptions): Promise<string> {
    const objectPayload = { ...payload, ...options };
    return JSON.stringify(objectPayload);
  }
}
