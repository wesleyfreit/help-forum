import { faker } from '@faker-js/faker';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository';
import { RegisterStudentUseCase } from './register-student';

let studentsRepository: InMemoryStudentsRepository;
let hasher: FakeHasher;
let sut: RegisterStudentUseCase;

describe('Register Student', () => {
  beforeEach(() => {
    studentsRepository = new InMemoryStudentsRepository();
    hasher = new FakeHasher();
    sut = new RegisterStudentUseCase(studentsRepository, hasher);
  });

  it('should be able to register a new student', async () => {
    const result = await sut.execute({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(
      expect.objectContaining({
        student: studentsRepository.items[0],
      }),
    );
  });

  it('should hash student upon registration', async () => {
    const password = faker.internet.password();

    const result = await sut.execute({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password,
    });

    const hashedPassword = await hasher.hash(password);

    expect(result.isRight()).toBe(true);
    expect(studentsRepository.items[0].password).toEqual(hashedPassword);
  });
});
