import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserHandler } from './update-user.handler';
import { User } from '../shared/user';
import * as bcrypt from 'bcryptjs';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

describe('UpdateUserHandler', () => {
  let handler: UpdateUserHandler;
  let mockUserModel: Model<User>;

  const mockUser = {
    _id: 'mock-id',
    name: 'Test User',
    username: 'testuser',
    password: 'password123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserHandler,
        {
          provide: getModelToken('User'),
          useValue: {
            findByIdAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<UpdateUserHandler>(UpdateUserHandler);
    mockUserModel = module.get<Model<User>>(getModelToken('User'));
  });

  it('should hash the password when updating', async () => {
    const updateUserDto = {
      name: 'Updated Name',
      username: 'updatedUser',
      password: 'newPassword',
    };
    const updateUserCommand = {
      id: mockUser._id,
      user: updateUserDto,
    };

    // Mock do bcrypt.hashSync
    bcrypt.hashSync = jest.fn().mockReturnValue('hashedPassword');

    // Mock do findByIdAndUpdate
    mockUserModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
      ...mockUser,
      ...updateUserDto,
      password: 'hashedPassword',
    });

    // Executando o handler
    const result = await handler.execute(updateUserCommand);

    // Verificando o resultado
    expect(result.password).toBe('hashedPassword'); // Senha deve ser a criptografada
    expect(bcrypt.hashSync).toHaveBeenCalledWith('newPassword', 15); // Verificando se o hash foi feito com a senha e o salt 15
    expect(bcrypt.hashSync).toHaveBeenCalledTimes(1); // Deve ter sido chamado uma vez
  });
});
