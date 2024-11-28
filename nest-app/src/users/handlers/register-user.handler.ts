import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../shared/user';

@Injectable()
export class RegisterUserHandler {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async execute(command: { name: string; username: string; password: string }) {
    const { name, username, password } = command;

    if (!name || !username || !password) {
      throw new HttpException('Dados inválidos', HttpStatus.BAD_REQUEST);
    }

    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) {
      throw new HttpException('Usuário já existe', HttpStatus.CONFLICT);
    }

    try {
      const hashedPassword = bcrypt.hashSync(password, 8);
      const newUser = await this.userModel.create({
        name,
        username,
        password: hashedPassword,
      });

      return {
        statusCode: 201,
        message: 'Usuário criado com sucesso',
        data: { username: newUser.username },
      };
    } catch (error) {
      throw new HttpException(
        'Erro ao registrar usuário',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
