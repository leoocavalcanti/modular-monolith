import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initializeTransactionalContext } from 'typeorm-transactional';

export const createNestApp = async (modules: any[]) => {
  initializeTransactionalContext();

  const module: TestingModule = await Test.createTestingModule({
    imports: modules,
  }).compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.init();
  
  return { module, app };
};