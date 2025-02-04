import { Module } from '@nestjs/common';
import { UserModule } from './users/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModule } from './message/message.module';
import { BrokerModule } from './broker/broker.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://samuelmatsuo:s27052003@samuelmatsuo.hhi33.mongodb.net/?retryWrites=true&w=majority&appName=samuelmatsuo',
    ),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => ({
          broker: {
            queue: process.env.BROKER_QUEUE,
          },
          app: {
            host: process.env.APP_HOST || '3.142.149.2', // Adicione o IP da AWS
            port: process.env.PORT || 3000,
          },
        }),
      ],
    }),
    UserModule,
    MessageModule,
    BrokerModule,
  ],
  controllers: [],
})
export class AppModule {}
