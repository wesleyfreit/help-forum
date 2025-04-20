import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Server } from 'node:net';
import request from 'supertest';
import { StudentFactory } from 'test/factories/make-student';

describe('Get question by slug (E2E)', () => {
  let app: INestApplication<Server>;
  let jwt: JwtService;
  let studentFactory: StudentFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    jwt = app.get(JwtService);
    studentFactory = app.get(StudentFactory);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[POST] /attachments', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({}, { subject: user.id.toString() });

    const response = await request(app.getHttpServer())
      .post('/attachments')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', 'test/fixtures/sample-upload.png');

    expect(response.statusCode).toBe(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        attachmentId: expect.any(String),
      }),
    );
  });
});
