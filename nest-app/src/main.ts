import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BrokerServer } from './broker/broker-server';
import { BrokerClientService } from './broker/broker-client.service';

async function main() {
  const app = await NestFactory.create(AppModule);

  await bootstrap();
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useLogger(logger);
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get<ConfigService<true>>(ConfigService);

  app.enableCors({
    origin: ['http://3.142.149.2:3001', 'http://localhost:3001'], // Adicione o IP da AWS e localhost (se precisar testar localmente)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const porta = configService.get<number>('app.port', { infer: true });
  const host = configService.get<string>('app.host', { infer: true });

  const queue = configService.get<string>('broker.queue', { infer: true });

  const brokerClient = app.get(BrokerClientService);

  app.connectMicroservice<MicroserviceOptions>(
    {
      strategy: new BrokerServer(brokerClient, {
        queue: queue,
        subscriptions: ['*.>'],
      }),
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  await app.listen(porta, host);
  console.log(`Aplicação rodando em http://${host}:${porta}`);
}

main();
