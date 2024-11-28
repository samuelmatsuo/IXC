import { Injectable, Logger } from '@nestjs/common';
import { ICommandHandler } from 'common/interfaces/command-handler.interface';
import { NatsError, Msg, JSONCodec } from 'nats';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from 'src/message/shared/message';
import { BrokerClientService } from '../../broker/broker-client.service';

export interface MessageFindCommand {
  err: NatsError | null;
  msg: any
}

@Injectable()
export class MessageFindHandler implements ICommandHandler<MessageFindCommand, void> {
  private readonly logger = new Logger(MessageFindHandler.name);

  constructor(
    @InjectModel('Message') private readonly messageModel: Model<Message>,
  ) { }

  async execute({ err, msg }: MessageFindCommand): Promise<any> {
    try {      
      if (!msg) {
        this.logger.error('Mensagem é nula');
        return;
      }
      return await this.findMessagesBetweenUsers(msg);

    } catch (error) {
      this.logger.error(`Erro ao processar a consulta de mensagens: ${error}`);
    }
  }

  private async findMessagesBetweenUsers(msg: any) {
    try {

      if (!msg) {
        this.logger.error('Mensagem sem dados recebidos.');
        throw new Error('Mensagem sem dados');
      }

      const messageContent = msg as any;
      const { senderId, recipientId } = messageContent;

      if (!senderId || !recipientId) {
        this.logger.error('IDs de remetente ou destinatário ausentes.');
        throw new Error('IDs de remetente ou destinatário ausentes');
      }

      const messages = await this.messageModel
        .find({
          $or: [
            { sender: senderId, recipient: recipientId },
            { sender: recipientId, recipient: senderId },
          ],
        })
        .populate('sender', 'username')
        .populate('recipient', 'username')
        .exec();

      return messages;

    } catch (error) {
      this.logger.error(`Erro ao buscar mensagens no banco de dados: ${error}`);
      throw error;
    }
  }
}
