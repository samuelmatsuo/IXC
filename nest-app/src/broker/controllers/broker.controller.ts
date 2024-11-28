import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NewMessageHandler } from '../../message/handlers/new-message.handler';
import { MessageFindHandler } from '../../message/handlers/message-find.handler';

@Controller()
export class BrokerController {
  constructor(
    private readonly newMessageHandler: NewMessageHandler,
    private readonly messageFindHandler: MessageFindHandler,
  ) {}

  @MessagePattern('*.msg.new')
  handleNewMessage(@Payload() payload: any) {
    
    console.log('Nova mensagem recebida:', payload);
    return this.newMessageHandler.execute({
      err: null,
      msg: payload,
    });
  }

  @MessagePattern('*.find')
  handleFindMessage(@Payload() payload: any) {
    console.log('Mensagens recebidas:', payload);
    return this.messageFindHandler.execute({
      err: null,
      msg: payload,
    });
  }

}
