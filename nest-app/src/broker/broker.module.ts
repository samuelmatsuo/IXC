import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { Message } from 'src/message/shared/message';
import { MessageSchema } from 'src/message/schemas/message.schema';
import { BrokerController } from './controllers/broker.controller';
import { NewMessageHandler } from '../message/handlers/new-message.handler';
import { MessageFindHandler } from '../message/handlers/message-find.handler';
import { BrokerClientService } from './broker-client.service';
import { connect } from 'nats';
import { OnlineUserHandler } from 'src/users/handlers/online-user.handler';
import { OfflineUserHandler } from 'src/users/handlers/offline-user.handler';
import { UserModule } from 'src/users/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])
  ],
  providers: [
    NewMessageHandler,
    MessageFindHandler,
    BrokerClientService,
    {
      provide: 'NATS_CONNECTION',
      useFactory: async () => {
        const connection = await connect({
          servers: ['nats://localhost:4222'],
          timeout: 1000,
        });
        console.log('NATS connection established');
        return connection;
      },
    },
  ],
  controllers: [BrokerController],
  exports: [BrokerClientService]
})
export class BrokerModule {}
