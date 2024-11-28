import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ICommandHandler } from "common/interfaces/command-handler.interface";
import { Model } from "mongoose";
import { NatsError } from "nats";
import { User } from "../schemas/user.schema";
import { BrokerClientService } from "src/broker/broker-client.service";

export interface OfflineUserCommand {
    err: NatsError | null;
    msg?: any
}

@Injectable()
export class OfflineUserHandler implements ICommandHandler<OfflineUserCommand, any> {
    private readonly logger = new Logger(OfflineUserHandler.name);

    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        private readonly brokerService: BrokerClientService,
    ) { }

    async execute({ err, msg }: OfflineUserCommand): Promise<any> {

        try {
            if (!msg) {
                this.logger.error('payload vazio');
                return
            }

            await this.findUserUpdateStatus(msg);
            await this.notifyUserStatus(msg, false)

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
            user.isOnline = false;

            await user.save();

            this.logger.log(`${id} offline.`);
        } catch (error) {
            this.logger.error(`Erro ao atualizar status do usuário: ${error}`);
        }
    }

    private notifyUserStatus = (userId, isOnline) => {
        const statusUpdate = {
            _id: userId,
            isOnline
        };
        this.logger.log('OFFLINE!!!!')
        
        this.brokerService.publish('user.status.update', JSON.stringify(statusUpdate))
    };

}