import { faker } from '@faker-js/faker';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { makeStudent } from 'test/factories/make-student';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository';
import { AuthenticateStudentUseCase } from './authenticate-student';

let studentsRepository: InMemoryStudentsRepository;
let hasher: FakeHasher;
let encrypter: FakeEncrypter;
let sut: AuthenticateStudentUseCase;

describe('Authenticate Student', () => {
  beforeEach(() => {
    studentsRepository = new InMemoryStudentsRepository();
    hasher = new FakeHasher();
    encrypter = new FakeEncrypter();
    sut = new AuthenticateStudentUseCase(studentsRepository, hasher, encrypter);
  });

  it('should be able to authenticate a new student', async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const hashedPassword = await hasher.hash(password);

    const student = makeStudent({
      email,
      password: hashedPassword,
    });

    await studentsRepository.create(student);

    const result = await sut.execute({
      email,
      password,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
      }),
    );
  });
});
