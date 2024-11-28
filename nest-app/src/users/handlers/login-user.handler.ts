import { Injectable, Logger } from '@nestjs/common';
import { ICommandHandler } from '../../../common/interfaces/command-handler.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { User } from '../shared/user';

export interface LoginUserCommand {
  username: string;
  password: string;
  res: Response;
}

@Injectable()
export class LoginUserHandler {
  private readonly logger = new Logger(LoginUserHandler.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async execute(command: LoginUserCommand): Promise<any> {
    const { username, password, res } = command;

    try {
      const user = await this.userModel.findOne({ username }).exec();

      if (!user) {
        return res.status(400).json({
          status: 400,
          message: 'Usuário não encontrado',
        });
      }

      if (user.isOnline) {
        return res.status(400).json({
          status: 400,
          message: 'Usuário já está online',
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(400).json({
          status: 400,
          message: 'Senha inválida',
        });
      }

      // Retorna sucesso no login
      return res.status(201).json({
        status: 201,
        message: 'Login realizado com sucesso',
        id_user: user._id,
      });
    } catch (error) {
      this.logger.error('Erro durante o login do usuário', error);
      return res.status(500).json({
        status: 500,
        message: 'Erro no servidor. Tente novamente mais tarde.',
      });
    }
  }
}
