import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { OnlineUserHandler } from "../handlers/online-user.handler";
import { OfflineUserHandler } from "../handlers/offline-user.handler";

@Controller()
export class UserBrokerController { 
    constructor(
        private readonly onlineUserHandler: OnlineUserHandler,
        private readonly offlineUserHandler: OfflineUserHandler,
    ){ }
    @MessagePattern('*.user.on')
    handleOnlineUser(@Payload() payload: any) {
      console.log('Usuário online:', payload);
      return this.onlineUserHandler.execute({
        err: null,
        msg: payload,
      });
    }
  
    @MessagePattern('*.user.off')
    handleOfflineUser(@Payload() payload: any) {
      console.log('Usuário online:', payload);
      return this.offlineUserHandler.execute({
        err: null,
        msg: payload,
      });
    }
}