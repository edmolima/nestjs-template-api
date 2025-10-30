# Development

Get started with local development and learn best practices.

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **pnpm** 8+ (install: `npm install -g pnpm`)
- **Docker** & **Docker Compose** (for PostgreSQL)
- **Git**

## Quick Start

### 1. Clone and Install

```bash
git clone <repo-url>
cd nestjs-template-api
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` if needed (defaults work for local dev).

### 3. Start PostgreSQL

```bash
docker compose up -d
```

### 4. Run Migrations

```bash
pnpm typeorm:migrate
```

### 5. Seed Database (Optional)

```bash
pnpm db:seed
```

### 6. Start Development Server

```bash
pnpm start:dev
```

Server runs on `http://localhost:3000`

### 7. Test the API

```bash
curl http://localhost:3000/hello
# {"id":1,"name":null,"message":"Hello World!","createdAt":"2024-10-30T10:00:00.000Z"}

curl 'http://localhost:3000/hello?name=Alice'
# {"id":2,"name":"Alice","message":"Hello Alice!","createdAt":"2024-10-30T10:00:01.000Z"}
```

## Available Scripts

```bash
# Development
pnpm start:dev        # Watch mode with hot reload
pnpm start:debug      # Debug mode with --inspect

# Production
pnpm build            # Compile TypeScript to dist/
pnpm start:prod       # Run compiled app

# Testing
pnpm test             # Run unit tests
pnpm test:watch       # Watch mode
pnpm test:cov         # Coverage report
pnpm test:e2e         # End-to-end tests

# Database
pnpm typeorm:migrate  # Run pending migrations
pnpm typeorm:revert   # Revert last migration
pnpm db:seed          # Run seeders

# Code Quality
pnpm lint             # Fix ESLint issues
pnpm format           # Format with Prettier
```

## Project Structure

```
src/
├── config/                  # Global config (ConfigModule)
├── database/                # Database layer
│   ├── database.module.ts
│   ├── data-source.ts
│   ├── migrations/
│   └── seeders/
├── hello/                   # Feature module (hexagonal)
│   ├── domain/
│   ├── application/
│   ├── infra/
│   └── hello.module.ts
├── app.module.ts
└── main.ts

docs/
├── README.md              # This file
├── ARCHITECTURE.md        # Hexagonal pattern guide
├── DATABASE.md            # Database operations
└── DEVELOPMENT.md         # You are here

test/
└── app.e2e-spec.ts        # E2E tests
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed module structure.

## Adding a New Feature

### Example: Create a Todo Feature

#### 1. Create Domain

```typescript
// src/todo/domain/todo.model.ts
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}
```

#### 2. Create Entity

```typescript
// src/todo/infra/todo.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'todos' })
export class TodoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ default: false })
  completed: boolean;
}
```

#### 3. Create Use-Case

```typescript
// src/todo/application/create-todo.usecase.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoEntity } from '../infra/todo.entity';

@Injectable()
export class CreateTodoUseCase {
  constructor(
    @InjectRepository(TodoEntity)
    private readonly repo: Repository<TodoEntity>,
  ) {}

  async execute(title: string): Promise<TodoEntity> {
    const todo = this.repo.create({ title });
    return this.repo.save(todo);
  }
}
```

#### 4. Create Controller

```typescript
// src/todo/infra/todo.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { CreateTodoUseCase } from '../application/create-todo.usecase';
import { TodoEntity } from './todo.entity';

@Controller('todos')
export class TodoController {
  constructor(private readonly createTodo: CreateTodoUseCase) {}

  @Post()
  async create(@Body('title') title: string): Promise<TodoEntity> {
    return this.createTodo.execute(title);
  }
}
```

#### 5. Create Module

```typescript
// src/todo/todo.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoEntity } from './infra/todo.entity';
import { TodoController } from './infra/todo.controller';
import { CreateTodoUseCase } from './application/create-todo.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([TodoEntity])],
  controllers: [TodoController],
  providers: [CreateTodoUseCase],
})
export class TodoModule {}
```

#### 6. Wire in App Module

```typescript
// src/app.module.ts
import { TodoModule } from './todo/todo.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    HelloModule,
    TodoModule, // Add here
  ],
})
export class AppModule {}
```

#### 7. Create Migration

```bash
# Create migration file
touch src/database/migrations/1698690000001-CreateTodos.ts
```

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTodos1698690000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'todos',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true },
          { name: 'title', type: 'varchar' },
          { name: 'completed', type: 'boolean', default: false },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('todos');
  }
}
```

#### 8. Run Migration

```bash
pnpm typeorm:migrate
```

Done! Now `POST /todos` and other endpoints work.

## Testing

### Unit Test Example

```typescript
// src/hello/application/say-hello.usecase.spec.ts
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SayHelloUseCase } from './say-hello.usecase';
import { HelloEntity } from '../infra/hello.entity';

describe('SayHelloUseCase', () => {
  let usecase: SayHelloUseCase;
  let repo: any;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        SayHelloUseCase,
        { provide: getRepositoryToken(HelloEntity), useValue: repo },
      ],
    }).compile();

    usecase = module.get(SayHelloUseCase);
  });

  it('should create a hello record', async () => {
    repo.create.mockReturnValue({ message: 'Hello Alice!' });
    repo.save.mockResolvedValue({ id: 1, message: 'Hello Alice!' });

    const result = await usecase.execute('Alice');

    expect(result.message).toBe('Hello Alice!');
    expect(repo.create).toHaveBeenCalledWith({ name: 'Alice', message: 'Hello Alice!' });
  });
});
```

### E2E Test Example

```typescript
// test/app.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Hello (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /hello returns a message', () => {
    return request(app.getHttpServer())
      .get('/hello')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('Hello');
      });
  });

  it('GET /hello?name=Bob persists to database', () => {
    return request(app.getHttpServer())
      .get('/hello?name=Bob')
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe('Bob');
      });
  });
});
```

Run tests:

```bash
pnpm test           # Unit
pnpm test:e2e       # E2E
pnpm test:cov       # Coverage
```

## Debugging

### VS Code Debugger

1. Add breakpoint in code
2. Run debug mode: `pnpm start:debug`
3. Attach debugger (VS Code will prompt)
4. Step through code

### Console Logging

```typescript
import { Logger } from '@nestjs/common';

const logger = new Logger('MyClass');
logger.log('Message');
logger.error('Error');
logger.warn('Warning');
```

## Troubleshooting

### Port 3000 Already in Use

```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm start:dev
```

### Database Connection Failed

- Check `.env` variables match PostgreSQL settings
- Verify PostgreSQL is running: `docker ps`
- Restart container: `docker compose restart`

### TypeScript Errors in Editor

- Restart TS server: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
- Reinstall deps: `rm -rf node_modules && pnpm install`

### Hot Reload Not Working

- Check file is in `src/` directory
- Try restarting: `pnpm start:dev`

## Resources

- [NestJS Docs](https://docs.nestjs.com)
- [TypeORM Docs](https://typeorm.io)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Follow [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Write tests for new features
4. Run `pnpm lint` and `pnpm format`
5. Commit and push
6. Create pull request

See [ARCHITECTURE.md](./ARCHITECTURE.md) for more details on code organization.
