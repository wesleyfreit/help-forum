import { Either, left, right } from '@/core/either';
import { Injectable } from '@nestjs/common';
import { Student } from '../../enterprise/entities/student';
import { Encrypter } from '../cryptography/encrypter';
import { HashComparer } from '../cryptography/hash-comparer';
import { StudentsRepository } from '../repositories/students-repository';
import { InvalidCredentialsError } from './errors/invalid-credentials-error';

interface AuthenticateStudentUseCaseRequest {
  email: string;
  password: string;
}

type AuthenticateStudentUseCaseResponse = Either<
  InvalidCredentialsError,
  {
    accessToken: string;
    student: Student;
  }
>;

@Injectable()
export class AuthenticateStudentUseCase {
  constructor(
    private studentsRepository: StudentsRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateStudentUseCaseRequest): Promise<AuthenticateStudentUseCaseResponse> {
    const student = await this.studentsRepository.findByEmail(email);

    if (!student) {
      return left(new InvalidCredentialsError());
    }

    const isValidPassword = await this.hashComparer.compare(password, student.password);

    if (!isValidPassword) {
      return left(new InvalidCredentialsError());
    }

    const accessToken = await this.encrypter.encrypt(
      {},
      { subject: student.id.toString(), expiresIn: '1h' },
    );

    return right({
      accessToken,
      student,
    });
  }
}
