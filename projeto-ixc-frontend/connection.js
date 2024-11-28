// natsConnection.js
import { wsconnect } from '@nats-io/nats-core';
import { timeout } from '@nats-io/nats-core/internal';

let natsClient = null;

export const connectToNATS = async () => {
  if (!natsClient) {
    try {
      const client = await wsconnect({ servers: ['ws://localhost:3222'] });
      console.log('Conectado ao NATS:', !client.isClosed());
      natsClient = client;

      client.closed().then(() => {
        console.warn('Conexão com NATS encerrada.');
        natsClient = null;
      });
    } catch (error) {
      console.error('Erro ao conectar ao NATS:', error);
    }
  }
  return natsClient;
};

export const getNatsClient = () => {
  return natsClient;
};
