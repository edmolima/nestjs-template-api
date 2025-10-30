import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HelloEntity } from '../infra/hello.entity';

@Injectable()
export class SayHelloUseCase {
  constructor(
    @InjectRepository(HelloEntity)
    private readonly repo: Repository<HelloEntity>,
  ) {}

  /**
   * Execute the use-case. Persists a hello record and returns the message.
   */
  async execute(
    name?: string,
  ): Promise<{ id: number; name?: string; message: string }> {
    const message = `Hello ${name ?? 'World'}!`;
    const rec = this.repo.create({ name, message });
    const saved = await this.repo.save(rec);
    return { id: saved.id, name: saved.name, message: saved.message };
  }
}
