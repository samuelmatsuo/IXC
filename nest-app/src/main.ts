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
  )
  app.useLogger(logger);
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get<ConfigService<true>>(ConfigService);

  app.enableCors({
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const porta = 3000;

  const queue = configService.get<string>('broker.queue', { infer: true })

  const brokerClient = app.get(BrokerClientService);

  app.connectMicroservice<MicroserviceOptions>(
    {
      strategy: new BrokerServer(brokerClient, {
        queue: queue,
        subscriptions: ["*.>"],
      }),
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  await app.listen(porta);

  console.log(`Aplicação rodando na porta ${porta}`);
}

main();
