import { Injectable, Logger } from '@nestjs/common';
import { ICommandHandler } from '../../../common/interfaces/command-handler.interface';
import { UpdateUserDto } from 'src/users/dtos/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../shared/user';
import * as bcrypt from 'bcryptjs';

export class UpdateUserCommand {
  id: string;
  user: UpdateUserDto;
}

@Injectable()
export class UpdateUserHandler {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async execute(updateUserCommand: UpdateUserCommand): Promise<User> {
    const { id, user } = updateUserCommand;
    return this.updateUser(id, user);
  }

  private async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    // Criptografar a senha se fornecida
    if (updateUserDto.password) {
      updateUserDto.password = bcrypt.hashSync(updateUserDto.password, 15); // Salting de 15
    }

    // Construir o objeto de atualização
    const userToUpdate = {
      name: updateUserDto.name,
      username: updateUserDto.username,
      password: updateUserDto.password, // A senha agora estará criptografada
    };

    // Atualizar o usuário no banco de dados
    return this.userModel.findByIdAndUpdate(id, userToUpdate, { new: true });
  }
}
