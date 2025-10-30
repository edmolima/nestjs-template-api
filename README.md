# NestJS Hexagonal Template API

> A modern, production-ready NestJS template with **Hexagonal Architecture**, TypeORM, PostgreSQL, and comprehensive documentation.

[![Node Version](https://img.shields.io/badge/node-20%2B-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.9-blue)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## Overview

This is a **clean, opinionated NestJS starter template** that follows **Hexagonal Architecture** principles. Build scalable APIs with clear separation of concerns, testable business logic, and zero framework dependencies in your domain layer.

### Why This Template?

- 🏗️ **Hexagonal Architecture** – Domain logic separated from infrastructure
- 🧪 **Testable** – Pure business logic, framework-agnostic use-cases
- 📚 **Documented** – Architecture guide, database guide, development guide
- 🗄️ **Database Ready** – TypeORM + PostgreSQL with migrations & seeders
- ⚙️ **Global Config** – ConfigModule for environment management
- 🚀 **Production Ready** – Error handling, logging, Docker support

---

## Quick Start

### Prerequisites

- **Node.js** 20+ (LTS) | [Install](https://nodejs.org)
- **pnpm** 8+ | `npm install -g pnpm`
- **Docker & Docker Compose** | [Install](https://docker.com)

### 1. Clone & Install

```bash
git clone https://github.com/edmolima/nestjs-template-api
cd nestjs-template-api
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Default `.env` works for local development with Docker PostgreSQL.

### 3. Start PostgreSQL

```bash
docker compose up -d
```

### 4. Run Migrations

```bash
pnpm typeorm:migrate
```

### 5. Start Server

```bash
pnpm start:dev
```

Server runs at **<http://localhost:3000>**

### 6. Test It

```bash
curl http://localhost:3000/hello
# {"id":1,"name":null,"message":"Hello World!","createdAt":"..."}

curl 'http://localhost:3000/hello?name=Alice'
# {"id":2,"name":"Alice","message":"Hello Alice!","createdAt":"..."}
```

---

## Documentation

Learn more about this template:

| Guide | Description |
| --- | --- |
| [**Architecture**](./docs/ARCHITECTURE.md) | Hexagonal pattern, module structure, how to add features |
| [**Database**](./docs/DATABASE.md) | Migrations, seeders, TypeORM, PostgreSQL setup |
| [**Development**](./docs/DEVELOPMENT.md) | Setup, scripts, testing examples, troubleshooting |

---

## Project Structure

```
src/
├── config/               # Global configuration (ConfigModule)
├── database/             # Database infrastructure
│   ├── database.module.ts
│   ├── data-source.ts
│   ├── migrations/       # Schema migrations
│   └── seeders/          # Database seeders
├── hello/                # Feature module (hexagonal example)
│   ├── domain/           # Business models
│   ├── application/      # Use-cases (business logic)
│   ├── infra/            # Controllers, entities (adapters)
│   └── hello.module.ts
├── app.module.ts         # Root module
└── main.ts               # App entry

docs/
├── ARCHITECTURE.md       # Hexagonal guide
├── DATABASE.md           # Database operations
└── DEVELOPMENT.md        # Setup & workflows
```

---

## Available Commands

```bash
# 🚀 Development
pnpm start:dev          # Watch mode with hot reload
pnpm start:debug        # Debug mode (--inspect)

# 🏗️ Build & Run
pnpm build              # Compile TypeScript
pnpm start:prod         # Run production build

# 🧪 Testing
pnpm test               # Run unit tests
pnpm test:watch         # Watch mode
pnpm test:e2e           # End-to-end tests
pnpm test:cov           # Coverage report

# 🗄️ Database
pnpm typeorm:migrate    # Run pending migrations
pnpm typeorm:revert     # Revert last migration
pnpm db:seed            # Run seeders

# 🎨 Code Quality
pnpm lint               # Fix ESLint issues
pnpm format             # Format with Prettier
```

---

## Features

### 🏗️ Hexagonal Architecture

Clear separation between **domain logic** (business rules), **application** (use-cases), and **infrastructure** (controllers, databases):

```typescript
// Pure business logic (testable, framework-agnostic)
@Injectable()
export class SayHelloUseCase {
  constructor(@InjectRepository(HelloEntity) private repo: Repository<HelloEntity>) {}

  async execute(name?: string) {
    const message = `Hello ${name ?? 'World'}!`;
    return this.repo.save(this.repo.create({ name, message }));
  }
}
```

### ⚙️ Global Configuration

Environment variables managed centrally via ConfigService:

```typescript
// Available everywhere
constructor(private config: ConfigService) {
  const dbHost = this.config.get('POSTGRES_HOST');
}
```

### 🗄️ Database Management

- **Migrations**: Version control for schema changes
- **Seeders**: Initialize development/test data
- **TypeORM**: Production-grade ORM with full query support

### 📦 Ready for Production

- Error handling & logging
- Docker support (compose included)
- Environment-based configuration
- TypeScript strict mode
- ESLint + Prettier

---

## Example: Creating a Todo Feature

Complete implementation following hexagonal pattern – see [DEVELOPMENT.md](./docs/DEVELOPMENT.md) for full walkthrough.

---

## Database Setup

### Local Development (Docker)

```bash
docker compose up -d
```

Starts PostgreSQL with:

- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: `postgres`
- Database: `postgres`

### Migrations

```bash
# Create schema
pnpm typeorm:migrate

# Revert last change
pnpm typeorm:revert

# Seed data
pnpm db:seed
```

See [DATABASE.md](./docs/DATABASE.md) for detailed instructions.

---

## Testing

### Unit Tests

```bash
pnpm test
```

Test use-cases in isolation (no database required).

### E2E Tests

```bash
pnpm test:e2e
```

Test full HTTP flow with real database.

### Coverage

```bash
pnpm test:cov
```

See [DEVELOPMENT.md](./docs/DEVELOPMENT.md) for examples.

---

## Environment Variables

```env
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres

# Application
PORT=3000
NODE_ENV=development

# Synchronize schema (dev only)
SYNCHRONIZE=true
```

Copy `.env.example` to `.env` to get started.

---

## Architecture Highlights

### Layered Design

```
HTTP Request
    ↓
Controller (infra adapter)
    ↓
Use-Case (application/business)
    ↓
Repository (infra/persistence)
    ↓
Database
```

**Benefits:**

- ✅ Business logic has **zero framework dependencies**
- ✅ Easy to **test use-cases** without mocking HTTP
- ✅ Easy to **swap implementations** (e.g., different DB)
- ✅ **Clear responsibilities** in each layer

Learn more in [ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## Production Checklist

- [ ] Set `SYNCHRONIZE=false` in `.env`
- [ ] Use TypeORM migrations (not auto-sync)
- [ ] Configure proper error handling
- [ ] Set up logging (winston/pino)
- [ ] Add input validation (class-validator)
- [ ] Add rate limiting
- [ ] Enable CORS if needed
- [ ] Set up monitoring
- [ ] Use secrets manager (not `.env`)
- [ ] Add API documentation (Swagger)

---

## Troubleshooting

### Port 3000 in Use

```bash
lsof -ti:3000 | xargs kill -9
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
docker ps

# Verify .env variables
cat .env

# Restart container
docker compose restart
```

### TypeScript Errors in Editor

```bash
# Restart TS server (VS Code)
Cmd+Shift+P → "TypeScript: Restart TS Server"

# Or reinstall
rm -rf node_modules && pnpm install
```

See [DEVELOPMENT.md](./docs/DEVELOPMENT.md) for more.

---

## Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing`
3. Follow [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
4. Add tests
5. Run `pnpm lint && pnpm format`
6. Commit: `git commit -am 'Add amazing feature'`
7. Push and open PR

---

## License

MIT © 2024

---

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

---

## Support

- 📖 Read [DEVELOPMENT.md](./docs/DEVELOPMENT.md)
- 🏗️ Review [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- 🗄️ Check [DATABASE.md](./docs/DATABASE.md)
- 🐛 Open an issue

**Happy coding! 🚀**

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
