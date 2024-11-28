import { Test, TestingModule } from '@nestjs/testing';
import { GetUsersHandler } from './get-users.handler';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../users/schemas/user.schema';

describe('GetUsersHandler', () => {
  let handler: GetUsersHandler;
  let userModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUsersHandler,
        {
          provide: getModelToken(User.name),
          useValue: {
            find: jest.fn().mockReturnThis(), // Mock para find
            exec: jest.fn(), // Mock para exec
          },
        },
      ],
    }).compile();

    handler = module.get<GetUsersHandler>(GetUsersHandler);
    userModel = module.get(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should fetch all users', async () => {
    const mockUsers = [
      { id: '1', name: 'User 1' },
      { id: '2', name: 'User 2' },
    ];

    userModel.exec.mockResolvedValue(mockUsers); // Mock de retorno do exec

    const result = await handler.execute();

    expect(result).toEqual(mockUsers);
    expect(userModel.find).toHaveBeenCalledTimes(1); // Garante uma única chamada ao find
    expect(userModel.exec).toHaveBeenCalledTimes(1); // Garante uma única chamada ao exec
  });

  it('should return an empty array if no users are found', async () => {
    userModel.exec.mockResolvedValue([]); // Mock de retorno vazio

    const result = await handler.execute();

    expect(result).toEqual([]);
    expect(userModel.find).toHaveBeenCalledTimes(1); // Garante uma única chamada ao find
    expect(userModel.exec).toHaveBeenCalledTimes(1); // Garante uma única chamada ao exec
  });
});
