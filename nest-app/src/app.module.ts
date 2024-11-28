import { Module } from '@nestjs/common';
import { UserModule } from './users/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModule } from './message/message.module';
import { BrokerModule } from './broker/broker.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://samuelmatsuo:s27052003@samuelmatsuo.hhi33.mongodb.net/?retryWrites=true&w=majority&appName=samuelmatsuo'), 
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => ({
        broker: {
          queue: process.env.BROKER_QUEUE
        },
      })],
    }),
    UserModule, MessageModule, BrokerModule
  ],
  controllers: []
})
export class AppModule {}