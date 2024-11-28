import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUserHandler } from './register-user.handler';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../shared/user';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('RegisterUserHandler', () => {
  let handler: RegisterUserHandler;
  let userModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserHandler,
        {
          provide: getModelToken(User.name),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<RegisterUserHandler>(RegisterUserHandler);
    userModel = module.get(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should throw error if name, username or password is missing', async () => {
    const command = { name: '', username: 'testuser', password: 'password' };

    await expect(handler.execute(command)).rejects.toThrow('Dados inválidos');
  });

  it('should throw error if user already exists', async () => {
    const command = {
      name: 'Test User',
      username: 'testuser',
      password: 'password',
    };

    // Mocking the existence of a user in the database
    jest
      .spyOn(userModel, 'findOne')
      .mockResolvedValue({ username: 'testuser' } as any);

    await expect(handler.execute(command)).rejects.toThrow('Usuário já existe');
  });

  it('should successfully create a new user', async () => {
    const command = {
      name: 'Test User',
      username: 'newuser',
      password: 'password',
    };

    // Mocking the findOne method to return null (no user found)
    jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

    // Mocking bcrypt.hashSync to return a hashed password
    jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashedpassword');

    // Mocking the create method to return a new user
    jest.spyOn(userModel, 'create').mockResolvedValue({
      username: 'newuser',
      name: 'Test User',
    });

    const result = await handler.execute(command);

    expect(result.statusCode).toBe(201);
    expect(result.message).toBe('Usuário criado com sucesso');
    expect(result.data.username).toBe('newuser');
  });

  it('should call bcrypt.hashSync with the correct parameters', async () => {
    const command = {
      name: 'Test User',
      username: 'newuser',
      password: 'password',
    };

    // Mocking the findOne method to return null (no user found)
    jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

    // Mocking the create method to return a new user
    jest.spyOn(userModel, 'create').mockResolvedValue({
      username: 'newuser',
      name: 'Test User',
    });

    // Spying on bcrypt.hashSync to check if it is called correctly
    const hashSpy = jest.spyOn(bcrypt, 'hashSync');

    await handler.execute(command);

    expect(hashSpy).toHaveBeenCalledWith('password', 8);
  });

  it('should log error if an exception is thrown during user registration', async () => {
    const command = {
      name: 'Test User',
      username: 'newuser',
      password: 'password',
    };

    // Mocking the findOne method to return null (no user found)
    jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

    // Mocking the create method to throw an error
    jest
      .spyOn(userModel, 'create')
      .mockRejectedValue(new Error('Database error'));

    await expect(handler.execute(command)).rejects.toThrow(
      'Erro ao registrar usuário',
    );
  });
});
