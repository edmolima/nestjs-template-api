# Architecture

This project follows the **Hexagonal Architecture** (also called Ports & Adapters) pattern to keep business logic decoupled from infrastructure concerns.

## Core Principles

### Separation of Concerns

- **Domain**: Pure business logic and models (no framework dependencies)
- **Application**: Use cases that orchestrate domain logic
- **Infrastructure**: Controllers, repositories, and framework adapters

### Benefits

- 🧪 **Testable**: Business logic is framework-agnostic
- 🔄 **Maintainable**: Clear boundaries between layers
- 🔌 **Pluggable**: Easy to swap implementations (e.g., different databases)
- 📚 **Scalable**: Add features without affecting existing code

## Project Structure

```
src/
├── config/                    # Global configuration (deprecated, use database module)
├── database/                  # Database infrastructure
│   ├── database.module.ts    # TypeORM setup with ConfigService
│   ├── data-source.ts        # TypeORM DataSource for CLI tools
│   ├── migrations/           # Database migrations
│   │   └── 1698690000000-CreateHellos.ts
│   └── seeders/              # Database seeders
│       └── seed.ts
├── hello/                     # Feature module (hexagonal example)
│   ├── domain/
│   │   └── hello.model.ts    # Domain interface
│   ├── application/
│   │   └── say-hello.usecase.ts  # Business logic (use-case)
│   ├── infra/
│   │   ├── hello.entity.ts   # Database entity (TypeORM)
│   │   └── hello.controller.ts   # HTTP adapter (Nest controller)
│   └── hello.module.ts       # Feature module wiring
├── app.module.ts             # Root module
└── main.ts                   # Application entry point
```

## Module: Hello (Hexagonal Example)

### Domain Layer (`domain/hello.model.ts`)

Defines the core business model:

```typescript
export interface Hello {
  message: string;
}
```

### Application Layer (`application/say-hello.usecase.ts`)

Contains the business logic (use-case):

- Receives input (optional name)
- Executes business rules
- Returns result via repository (persists to DB)
- Framework-agnostic (testable in isolation)

### Infrastructure Layer (`infra/`)

**Entity** (`hello.entity.ts`):

- TypeORM entity mapped to database table
- Represents the persistence layer

**Controller** (`hello.controller.ts`):

- HTTP adapter that handles requests
- Calls the use-case and returns JSON responses
- Translates HTTP to domain logic

### Module Wiring (`hello.module.ts`)

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([HelloEntity])],
  controllers: [HelloController],
  providers: [SayHelloUseCase],
})
export class HelloModule {}
```

## Data Flow

```
HTTP Request
    ↓
HelloController (infra adapter)
    ↓
SayHelloUseCase (application layer)
    ↓
HelloEntity Repository (infrastructure)
    ↓
PostgreSQL Database
    ↓
Response JSON
```

## Global Configuration

### ConfigModule (Root)

- Loaded globally in `app.module.ts`
- Reads from `.env` file
- Available to all modules via `ConfigService`

### DatabaseModule

- Configures TypeORM using `ConfigService`
- Manages migrations and seeders
- Exports `TypeOrmModule` for feature modules

## How to Add a New Feature

1. **Create feature folder** under `src/`:

   ```bash
   mkdir -p src/myfeature/{domain,application,infra}
   ```

2. **Define domain model** (`domain/my.model.ts`):

   ```typescript
   export interface MyDomain {
     id: number;
     name: string;
   }
   ```

3. **Create use-case** (`application/my.usecase.ts`):

   ```typescript
   @Injectable()
   export class MyUseCase {
     constructor(@InjectRepository(MyEntity) private repo: Repository<MyEntity>) {}
     async execute(input: any) { /* business logic */ }
   }
   ```

4. **Create entity** (`infra/my.entity.ts`):

   ```typescript
   @Entity()
   export class MyEntity { /* TypeORM columns */ }
   ```

5. **Create controller** (`infra/my.controller.ts`):

   ```typescript
   @Controller('myfeature')
   export class MyController {
     constructor(private usecase: MyUseCase) {}
     @Get()
     async handle() { return this.usecase.execute(); }
   }
   ```

6. **Wire module** (`my.module.ts`):

   ```typescript
   @Module({
     imports: [TypeOrmModule.forFeature([MyEntity])],
     controllers: [MyController],
     providers: [MyUseCase],
   })
   export class MyModule {}
   ```

7. **Import in AppModule**:

   ```typescript
   @Module({
     imports: [AppConfigModule, DatabaseModule, HelloModule, MyModule],
   })
   export class AppModule {}
   ```

## Testing Strategy

- **Domain Logic**: Unit test use-cases (no DB)
- **Integration**: Test use-case + repository with test database
- **E2E**: Test full HTTP flow with seeded database

See [DEVELOPMENT.md](./DEVELOPMENT.md) for testing examples.
