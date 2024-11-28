import { Inject, Injectable, Logger } from '@nestjs/common';
import { NatsConnection, Msg, Codec, JSONCodec, PublishOptions, SubscriptionOptions, Sub } from 'nats';

export type MqttHandler = (topic: string, payload: any, message: Msg) => void;

@Injectable()
export class BrokerClientService {
  private readonly logger = new Logger(BrokerClientService.name);
  private readonly jc: Codec<unknown>;

  constructor(
    @Inject('NATS_CONNECTION') private readonly connection: NatsConnection,
  ) {
    this.jc = JSONCodec();
    this.logger.log(
      { host: connection.getServer() },
      `Connected to NATS at ${connection.getServer()}`,
    );
  }

  public async disconnect(graceful: boolean = true): Promise<void> {
    try {
      if (graceful) {
        await this.connection.drain();
      }

      await this.connection.close();

      this.connection.closed().then((error) => {
        this.logger.error(error, 'Connection closed');
      });
    } catch (err) {
      this.logger.error(err, 'Error disconnecting from NATS');
    }
  }

  public subscribe(
    topic: string,
    handler: MqttHandler,
    opts?: SubscriptionOptions,
  ): Sub<Msg> {
    this.logger.debug(`Subscribing to topic ${topic}`);
    const subscription = this.connection.subscribe(topic, opts);

    (async () => {
      for await (const message of subscription) {
        try {
          const payload = this.jc.decode(message.data);
          this.logger.debug({ payload }, `Received message on topic ${message.subject}`);
          handler(message.subject, payload, message);
        } catch (error) {
          this.logger.error(error, `Error processing message from ${message.subject}`);
        }
      }
    })();

    return subscription;
  }

  public publish(
    topic: string,
    payload: any,
    opts?: Partial<PublishOptions>,
  ): void {
    this.logger.debug({ topic, payload }, `Publishing to topic ${topic}`);
    this.connection.publish(topic, this.jc.encode(payload), opts);
  }

  public async request(topic: string, payload: any): Promise<any> {
    this.logger.debug({ topic, payload }, `Sending request to ${topic}`);

    try {
      const reply = await this.connection.request(topic, this.jc.encode(payload), {
        timeout: 10000,
      });

      const data = this.jc.decode(reply.data);
      this.logger.debug({ topic, payload: data }, `Received reply from ${topic}`);

      return data;
    } catch (error) {
      this.logger.error(error, `Error with request to ${topic}`);
    }
  }

  public reply(
    requestTopic: string,
    topic: string,
    payload: any,
    opts?: Partial<PublishOptions>,
  ): void {
    this.logger.debug({ requestTopic, topic, payload }, `Replying to ${requestTopic}`);
    this.connection.publish(topic, this.jc.encode(payload), opts);
  }
}
