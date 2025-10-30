import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SayHelloUseCase } from './application/say-hello.usecase';
import { HelloController } from './infra/hello.controller';
import { HelloEntity } from './infra/hello.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HelloEntity])],
  controllers: [HelloController],
  providers: [SayHelloUseCase],
  exports: [SayHelloUseCase],
})
export class HelloModule {}
