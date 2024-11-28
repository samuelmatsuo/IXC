import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ICommandHandler } from "common/interfaces/command-handler.interface";
import { Model } from "mongoose";
import { JSONCodec, NatsError } from "nats";
import { User } from "../schemas/user.schema";
import { BrokerClientService } from "../../broker/broker-client.service";

export interface OnlineUserCommand {
    err: NatsError | null;
    msg: any
}

@Injectable()
export class OnlineUserHandler implements ICommandHandler<OnlineUserCommand, any> {
    private readonly logger = new Logger(OnlineUserHandler.name);

    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        private readonly brokerService: BrokerClientService,

    ) { }

    async execute({ err, msg }: OnlineUserCommand): Promise<any> {

        try {
            if (!msg) {
                this.logger.error('payload vazio');
                return
            }

            await this.findUserUpdateStatus(msg);
            await this.notifyUserStatus(msg, true);

        } catch (error) {
            this.logger.error(`Erro ao processar: ${error}`);
        }

    }

    private async findUserUpdateStatus(msg: any) {
        try {
            const id = msg;

            const user = await this.userModel.findById(id);

            if (!user) {
                this.logger.error(`Usuário não encontrado: ${id}`);
                return;
            }
            user.isOnline = true;

            await user.save();

            this.logger.log(`${id}: online.`);
        } catch (error) {
            this.logger.error(`Erro ao atualizar status do usuário: ${error}`);
        }
    }

    private notifyUserStatus = (userId, isOnline) => {
        const statusUpdate = {
            _id: userId,
            isOnline
        };
        this.logger.log('ONLINE!!!!')
        this.brokerService.publish('user.status.update', JSON.stringify(statusUpdate))
    };
}