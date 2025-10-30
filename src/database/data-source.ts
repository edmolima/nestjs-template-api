import 'dotenv/config';
import { DataSource } from 'typeorm';
import { HelloEntity } from '../hello/infra/hello.entity';

const isProd = process.env.NODE_ENV === 'production';

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
  username: process.env.POSTGRES_USER ?? 'postgres',
  password: process.env.POSTGRES_PASSWORD ?? 'postgres',
  database: process.env.POSTGRES_DB ?? 'postgres',
  synchronize: false,
  logging: false,
  entities: [HelloEntity],
  migrations: [
    isProd ? 'dist/database/migrations/*.js' : 'src/database/migrations/*.ts',
  ],
});
