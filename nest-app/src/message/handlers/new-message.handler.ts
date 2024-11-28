import { Injectable, Logger } from '@nestjs/common';
import { ICommandHandler } from 'common/interfaces/command-handler.interface';
import { NatsError, Msg, JSONCodec, StringCodec } from 'nats';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from 'src/message/shared/message';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { BrokerClientService } from '../../broker/broker-client.service';

export interface NewMessageCommand {
  err: NatsError | null;
  msg: any;
}

@Injectable()
export class NewMessageHandler implements ICommandHandler<NewMessageCommand, void> {
  private readonly logger = new Logger(NewMessageHandler.name);
  private readonly jsonCodec = JSONCodec();

  constructor(
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    private readonly brokerService: BrokerClientService,
  ) { }

  async execute({ err, msg }: NewMessageCommand): Promise<void> {

    if (err) {
      this.logger.error(`Erro ao processar nova mensagem: ${err.message}`);
      throw err;
    }

    const messageContent = msg as any;
    const { message, recipientId, senderId, senderName } = messageContent;

    this.createMessage(msg);

    this.brokerService.publish(recipientId + '.msg.notify', { message, senderId, senderName });

  } catch(error) {
    this.logger.error(`Erro ao processar mensagem: ${error.message}`);
    throw error;
  };

  private async createMessage(msg: any) {
    try {

      const messageContent = msg;

      const { message, senderId, recipientId, senderName } = messageContent;

      if (!recipientId) {
        this.logger.error('Recipient is required')
      }

      if (!this.messageModel) {
        this.logger.error('Message model is not initialized');
      }

      const newMessage = await this.messageModel.create({
        message,
        sender: senderId,
        senderName,
        recipient: recipientId,
      });

      return await newMessage.save();

    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

}
