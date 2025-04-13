import { JwtSignOptions } from '@nestjs/jwt';

export abstract class Encrypter {
  abstract encrypt(payload: Buffer | object, options?: JwtSignOptions): Promise<string>;
}
