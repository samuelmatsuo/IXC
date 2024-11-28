import { CustomTransportStrategy, Server } from "@nestjs/microservices";
import { Msg } from "nats";
import { NO_MESSAGE_HANDLER } from "@nestjs/microservices/constants";
import { BrokerMicroserviceConfig } from "./broker-types";
import { BrokerClientService } from "./broker-client.service";
import { BrokerRouter } from "./broker-router";
import { BrokerContext } from "./broker-context";

export class BrokerServer extends Server implements CustomTransportStrategy {
  private readonly brokerRouter: BrokerRouter;

  constructor(
    private readonly brokerClient: BrokerClientService,
    private readonly config: BrokerMicroserviceConfig,
  ) {
    super();
    this.brokerRouter = new BrokerRouter();
  }

  async listen(callback: (err?: unknown) => void) {
    try {
      this.registerSubscriptions();
      this.addRoutes(callback);
    } catch (err) {
      callback(err);
    }
  }

  close() {
    this.brokerClient.disconnect(true);
  }

  public addRoutes(callback: (err?: unknown) => void) {
    const registeredPatterns = [...this.messageHandlers.keys()];
    registeredPatterns.forEach((pattern) => {
      this.brokerRouter.addRoute(
        pattern,
        this.getMessageHandler(pattern).bind(this),
      );
    });

    callback();
  }

  public getMessageHandler(pattern: string) {
    return async (topic: string, payload: any, message: Msg) =>
      this.handleMessage(pattern, topic, payload, message);
  }

  public async handleMessage(
    pattern: string,
    topic: string,
    payload: any,
    message: Msg,
  ): Promise<any> {
    const context = new BrokerContext([topic, message, this.brokerClient]);
    const publish = this.getPublisher(message);
    const handler = this.getHandlerByPattern(pattern);

    if (!handler) {
      const status = "error";
      const noHandlerPacket = {
        status,
        err: NO_MESSAGE_HANDLER,
      };
      return publish(noHandlerPacket);
    }

    const response$ = this.transformToObservable(handler(payload, context));
    response$ && this.send(response$, publish);
  }

  public getPublisher(message: Msg) {
    return (response: any) => {
      if (message.reply) {
        if (response.err) {
          return this.brokerClient.reply(message.subject, message.reply, {
            error: response.err,
          });
        }
        return this.brokerClient.reply(
          message.subject,
          message.reply,
          response.response,
        );
      }
    };
  }

  subscriptionHandler(rawTopic: string, rawPayload: any, message: Msg) {
    let topic = rawTopic;
    if (rawPayload.action) {
      topic = rawTopic + "." + rawPayload.action;
      const handler = this.brokerRouter.getHandler(topic);
      const payload = rawPayload.data ? rawPayload.data : rawPayload;

      if (handler) {
        delete rawPayload.action;
        handler(topic, payload, message);
        return;
      }
    }

    const handler = this.brokerRouter.getHandler(topic);

    if (handler) {
      handler(topic, rawPayload, message);
    }
  }

  registerSubscriptions() {
    const queue = this.config.queue;
    const boundSubscriptionHandler = this.subscriptionHandler.bind(this);
    this.config.subscriptions.forEach((topic) => {
      this.brokerClient.subscribe(topic, boundSubscriptionHandler, {
        queue,
      });
    });
  }
}
