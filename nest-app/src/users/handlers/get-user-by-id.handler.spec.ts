import { Test, TestingModule } from '@nestjs/testing';
import {
  GetUserByIdHandler,
  GetUserByIdCommand,
} from './get-user-by-id.handler';
import { Model } from 'mongoose';
import { User } from '../shared/user';
import { getModelToken } from '@nestjs/mongoose';

describe('GetUserByIdHandler', () => {
  let handler: GetUserByIdHandler;
  let userModel: Model<User>;

  const mockUserModel = {
    findById: jest.fn().mockReturnValue({
      exec: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByIdHandler,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    handler = module.get<GetUserByIdHandler>(GetUserByIdHandler);
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should fetch a user by ID', async () => {
    const command: GetUserByIdCommand = { id: '123' };
    const mockUser = { id: '123', name: 'John Doe', email: 'john@example.com' };

    (mockUserModel.findById().exec as jest.Mock).mockResolvedValue(mockUser);

    const result = await handler.execute(command);

    expect(userModel.findById).toHaveBeenCalledWith('123');
    expect(result).toEqual(mockUser);
  });

  it('should return null if no user is found', async () => {
    const command: GetUserByIdCommand = { id: '123' };

    (mockUserModel.findById().exec as jest.Mock).mockResolvedValue(null);

    const result = await handler.execute(command);

    expect(userModel.findById).toHaveBeenCalledWith('123');
    expect(result).toBeNull();
  });
});
