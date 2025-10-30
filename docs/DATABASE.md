# Database

Learn how to manage database migrations, seeders, and data operations.

## Migrations

Migrations allow you to version control your database schema and apply changes across environments.

### Running Migrations

```bash
pnpm typeorm:migrate
```

This command:
- Reads from `src/database/migrations/`
- Applies new migration files to the database
- Records completed migrations in the `migrations` table

### Reverting Migrations

```bash
pnpm typeorm:revert
```

Reverts the last executed migration.

### Creating a New Migration

1. Create a new file in `src/database/migrations/`:

```typescript
// src/database/migrations/1698690000001-AddUserTable.ts
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddUserTable1698690000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true },
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
```

2. Run the migration:

```bash
pnpm typeorm:migrate
```

## Seeders

Seeders populate your database with initial or test data.

### Running the Seeder

```bash
pnpm db:seed
```

The default seeder inserts sample hello records into the `hellos` table.

### Creating a Custom Seeder

Edit `src/database/seeders/seed.ts`:

```typescript
import AppDataSource from '../data-source';
import { HelloEntity } from '../../hello/infra/hello.entity';

async function seed() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(HelloEntity);

  // Insert your data
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
```

Run it:

```bash
pnpm db:seed
```

## Database Configuration

Database settings are loaded from `.env`:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres
```

Configuration is managed in `src/database/database.module.ts` using NestJS `ConfigService`.

## Local PostgreSQL

### Docker Compose (Recommended)

```bash
docker compose up -d
```

Starts PostgreSQL with:
- Port: `5432`
- Username: `postgres`
- Password: `postgres`
- Database: `postgres`
- Volume: Named volume `postgres_data` for persistence

### Docker CLI

```bash
docker run --name nest-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  -d postgres:15
```

### Stopping PostgreSQL

```bash
# With docker compose
docker compose down

# With docker CLI
docker stop nest-postgres
docker rm nest-postgres
```

## TypeORM Entities

Entities are TypeScript classes decorated with `@Entity()` that map to database tables.

Example: `src/hello/infra/hello.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'hellos' })
export class HelloEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: true })
  name?: string;

  @Column()
  message: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
```

### Column Types

- `@PrimaryGeneratedColumn()` - Auto-incrementing primary key
- `@Column()` - Standard column
- `@Column({ nullable: true })` - Optional column
- `@CreateDateColumn()` - Auto-set created timestamp
- `@UpdateDateColumn()` - Auto-set updated timestamp

## Repositories

Access data via TypeORM repositories:

```typescript
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MyService {
  constructor(
    @InjectRepository(HelloEntity)
    private repo: Repository<HelloEntity>,
  ) {}

  async findAll() {
    return this.repo.find();
  }

  async findById(id: number) {
    return this.repo.findOneBy({ id });
  }

  async create(data: Partial<HelloEntity>) {
    const record = this.repo.create(data);
    return this.repo.save(record);
  }
}
```

## Troubleshooting

### Migration Error: "Multiple exports of DataSource"

Ensure `src/database/data-source.ts` has only one default export:

```typescript
export default new DataSource({ /* config */ });
```

### Connection Refused

- Verify PostgreSQL is running: `docker ps`
- Check `.env` has correct credentials
- Ensure port `5432` is not in use

### Migration Not Running

- Run from project root: `pnpm typeorm:migrate`
- Check migration files are in `src/database/migrations/`
- Verify filenames match `*-*.ts` pattern

## Best Practices

1. **Always migrate in development**: Run `pnpm typeorm:migrate` after pulling changes
2. **Version control migrations**: Commit `.ts` migration files, not generated `.js`
3. **Name migrations clearly**: Use descriptive names like `AddUserEmailColumn`
4. **Test reversibility**: Run `pnpm typeorm:revert` then `pnpm typeorm:migrate` to test
5. **Keep seeders safe**: Don't seed production data; use for development/testing only
