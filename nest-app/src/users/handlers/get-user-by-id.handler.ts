import { Injectable, Logger } from '@nestjs/common';
import { ICommandHandler } from '../../../common/interfaces/command-handler.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../shared/user';

export interface GetUserByIdCommand {
  id: string;
}

@Injectable()
export class GetUserByIdHandler implements ICommandHandler<GetUserByIdCommand, any> {
  private readonly logger = new Logger(GetUserByIdHandler.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async execute(command: GetUserByIdCommand) {
    this.logger.log(`Fetching user by ID: ${command.id}`);
    
    return await this.userModel.findById(command.id).exec();
  }
}
