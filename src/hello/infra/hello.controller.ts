import { Controller, Get, Query } from '@nestjs/common';
import { SayHelloUseCase } from '../application/say-hello.usecase';

@Controller('hello')
export class HelloController {
  constructor(private readonly sayHello: SayHelloUseCase) {}

  @Get()
  async say(@Query('name') name?: string) {
    return this.sayHello.execute(name);
  }
}
