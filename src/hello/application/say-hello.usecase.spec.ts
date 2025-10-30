import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HelloEntity } from '../infra/hello.entity';
import { SayHelloUseCase } from './say-hello.usecase';

describe('SayHelloUseCase', () => {
  let usecase: SayHelloUseCase;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SayHelloUseCase,
        {
          provide: getRepositoryToken(HelloEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    usecase = module.get<SayHelloUseCase>(SayHelloUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create and save a hello record with provided name', async () => {
      const name = 'Alice';
      const helloEntity = {
        id: 1,
        name,
        message: `Hello ${name}!`,
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue({
        name,
        message: `Hello ${name}!`,
      });
      mockRepository.save.mockResolvedValue(helloEntity);

      const result = await usecase.execute(name);

      expect(mockRepository.create).toHaveBeenCalledWith({
        name,
        message: `Hello ${name}!`,
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: 1,
        name,
        message: `Hello ${name}!`,
      });
    });

    it('should create and save a hello record with default name when not provided', async () => {
      const helloEntity = {
        id: 2,
        name: undefined,
        message: 'Hello World!',
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue({
        name: undefined,
        message: 'Hello World!',
      });
      mockRepository.save.mockResolvedValue(helloEntity);

      const result = await usecase.execute();

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: undefined,
        message: 'Hello World!',
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: 2,
        name: undefined,
        message: 'Hello World!',
      });
    });

    it('should return the saved record with id, name, and message', async () => {
      const name = 'Bob';
      const helloEntity = {
        id: 3,
        name,
        message: `Hello ${name}!`,
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue({
        name,
        message: `Hello ${name}!`,
      });
      mockRepository.save.mockResolvedValue(helloEntity);

      const result = await usecase.execute(name);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name', name);
      expect(result).toHaveProperty('message', `Hello ${name}!`);
    });
  });
});
