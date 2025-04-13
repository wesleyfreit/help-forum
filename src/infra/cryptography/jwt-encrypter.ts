import { Encrypter } from '@/domain/forum/application/cryptography/encrypter';
import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

@Injectable()
export class JwtEncrypter implements Encrypter {
  constructor(private jwtService: JwtService) {}

  encrypt(payload: Buffer | object, options?: JwtSignOptions): Promise<string> {
    return this.jwtService.signAsync(payload, options);
  }
}
