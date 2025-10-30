import { HelloEntity } from '../../hello/infra/hello.entity';
import AppDataSource from '../data-source';

async function seed() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(HelloEntity);

  await repo.insert([
    { name: 'Alice', message: 'Hello Alice!' },
    { name: 'Bob', message: 'Hello Bob!' },
  ]);

  console.log('Seed complete');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
