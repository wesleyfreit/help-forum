import { StudentsRepository } from '@/domain/forum/application/repositories/students-repository';
import { Student } from '@/domain/forum/enterprise/entities/student';

export class InMemoryStudentsRepository implements StudentsRepository {
  public items: Student[] = [];

  async findByEmail(email: string) {
    const student = this.items.find((student) => student.email === email);

    if (!student) {
      return null;
    }

    return student;
  }

  async create(student: Student) {
    this.items.push(student);
  }
}
