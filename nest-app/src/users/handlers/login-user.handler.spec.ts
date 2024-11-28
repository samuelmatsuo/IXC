import { Test, TestingModule } from '@nestjs/testing';
import { LoginUserHandler } from './login-user.handler';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../shared/user';

describe('LoginUserHandler', () => {
  let handler: LoginUserHandler;
  let userModel: Model<User>;
  let res: any;
  let bcryptCompareMock: jest.Mock;

  beforeEach(async () => {
    // Mock do bcrypt.compare
    bcryptCompareMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserHandler,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn().mockReturnThis(), // Mock findOne para retornar o próprio objeto
          },
        },
        Logger,
      ],
    }).compile();

    handler = module.get<LoginUserHandler>(LoginUserHandler);
    userModel = module.get<Model<User>>(getModelToken(User.name));

    // Mock da resposta (res) para simular as respostas HTTP
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Substituindo a função compare do bcrypt
    jest.spyOn(bcrypt, 'compare').mockImplementation(bcryptCompareMock);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should return error if user not found', async () => {
    const command = { username: 'testuser', password: 'password', res };
    jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

    await handler.execute(command);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      message: 'Usuário não encontrado',
    });
  });

  it('should return error if password is invalid', async () => {
    const command = { username: 'testuser', password: 'wrongpassword', res };
    const mockUser = { username: 'testuser', password: 'hashedpassword' };
    jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser as any);
    bcryptCompareMock.mockResolvedValue(false); // Simulando senha inválida

    await handler.execute(command);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      message: 'Senha inválida',
    });
  });

  it('should return success if user is authenticated', async () => {
    const command = { username: 'testuser', password: 'password', res };
    const mockUser = {
      _id: '1',
      username: 'testuser',
      password: 'hashedpassword',
    };
    jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser as any);
    bcryptCompareMock.mockResolvedValue(true); // Simulando senha válida

    await handler.execute(command);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 201,
      message: 'Login realizado com sucesso',
      id_user: mockUser._id,
    });
  });

  it('should call bcrypt.compare with correct parameters', async () => {
    const command = { username: 'testuser', password: 'password', res };
    const mockUser = {
      _id: '1',
      username: 'testuser',
      password: 'hashedpassword',
    };
    jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser as any);
    bcryptCompareMock.mockResolvedValue(true);

    await handler.execute(command);

    expect(bcrypt.compare).toHaveBeenCalledWith(
      command.password,
      mockUser.password,
    );
    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
  });

  it('should log error if an exception is thrown', async () => {
    const command = { username: 'testuser', password: 'password', res };
    const errorSpy = jest.spyOn(Logger, 'error');

    // Mock para simular erro no banco
    jest
      .spyOn(userModel, 'findOne')
      .mockRejectedValue(new Error('Database error'));

    await handler.execute(command);

    expect(errorSpy).toHaveBeenCalledWith(new Error('Database error'));
  });
});
