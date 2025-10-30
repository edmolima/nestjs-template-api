import { Test, TestingModule } from '@nestjs/testing';
import { SayHelloUseCase } from '../application/say-hello.usecase';
import { HelloController } from './hello.controller';

describe('HelloController', () => {
  let controller: HelloController;

  const mockSayHelloUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HelloController],
      providers: [
        {
          provide: SayHelloUseCase,
          useValue: mockSayHelloUseCase,
        },
      ],
    }).compile();

    controller = module.get<HelloController>(HelloController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('say', () => {
    it('should call SayHelloUseCase.execute with the provided name', async () => {
      const name = 'Alice';
      const expectedResult = {
        id: 1,
        name,
        message: `Hello ${name}!`,
      };

      mockSayHelloUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.say(name);

      expect(mockSayHelloUseCase.execute).toHaveBeenCalledWith(name);
      expect(result).toEqual(expectedResult);
    });

    it('should call SayHelloUseCase.execute without name when not provided', async () => {
      const expectedResult = {
        id: 2,
        name: undefined,
        message: 'Hello World!',
      };

      mockSayHelloUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.say(undefined);

      expect(mockSayHelloUseCase.execute).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(expectedResult);
    });

    it('should return the use-case result', async () => {
      const name = 'Bob';
      const expectedResult = {
        id: 3,
        name,
        message: `Hello ${name}!`,
      };

      mockSayHelloUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.say(name);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('message');
    });
  });
});
