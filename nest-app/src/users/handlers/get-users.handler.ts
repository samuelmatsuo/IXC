import { Injectable, Logger } from '@nestjs/common';
import { ICommandHandler } from 'common/interfaces/command-handler.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

@Injectable()
export class GetUsersHandler implements ICommandHandler<void, any> {
  private readonly logger = new Logger(GetUsersHandler.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async execute() {
    return await this.userModel.find().exec();
  }
}
