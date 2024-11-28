import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { GetUserByIdHandler } from 'src/users/handlers/get-user-by-id.handler';
import { GetUsersHandler } from 'src/users/handlers/get-users.handler';
import { LoginUserHandler } from 'src/users/handlers/login-user.handler';
import { RegisterUserHandler } from 'src/users/handlers/register-user.handler';
import { UpdateUserHandler } from 'src/users/handlers/update-user.handler';
import { UsersController } from './controllers/users.controller';
import { OnlineUserHandler } from './handlers/online-user.handler';
import { OfflineUserHandler } from './handlers/offline-user.handler';
import { BrokerClientService } from 'src/broker/broker-client.service';
import { BrokerModule } from 'src/broker/broker.module';
import { UserBrokerController } from './controllers/user_broker.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        BrokerModule
    ],
    exports: [],
    controllers: [UsersController, UserBrokerController],
    providers: [
        GetUserByIdHandler,
        GetUsersHandler,
        LoginUserHandler,
        RegisterUserHandler,
        UpdateUserHandler,
        OnlineUserHandler,
        OfflineUserHandler
    ],
})
export class UserModule { }
