import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from '@nestjs/cache-manager';
import { DataSource } from 'typeorm';
import { Env } from 'src/common/utils/env.util';

interface Containers {
  postgres?: StartedTestContainer;
  redis?: StartedTestContainer;
}

export let app: INestApplication;
export let dataSource: DataSource;
export const containers: Containers = {};

export const createTestApp = async () => {
  containers.postgres = await new GenericContainer('postgres:latest')
    .withExposedPorts(Env.getNumber('TEST_DB_PORT'))
    .withEnvironment({
      POSTGRES_USER: Env.getString('TEST_DB_USER'),
      POSTGRES_PASSWORD: Env.getString('TEST_DB_PASSWORD'),
      POSTGRES_DB: Env.getString('TEST_DB_NAME'),
    })
    .start();

  const pgHost = containers.postgres.getHost();
  const pgPort = containers.postgres.getMappedPort(
    Env.getNumber('TEST_DB_PORT'),
  );

  containers.redis = await new GenericContainer('redis:latest')
    .withExposedPorts(Env.getNumber('REDIS_PORT'))
    .start();

  const redisHost = containers.redis.getHost();
  const redisPort = containers.redis.getMappedPort(Env.getNumber('REDIS_PORT'));

  // ---- Initialize Nest App ----
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: pgHost,
        port: pgPort,
        username: Env.getString('TEST_DB_USER'),
        password: Env.getString('TEST_DB_PASSWORD'),
        database: Env.getString('TEST_DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      CacheModule.register({
        store: redisStore,
        host: redisHost,
        port: redisPort,
      }),
    ],
  }).compile();

  app = moduleRef.createNestApplication();
  await app.init();

  dataSource = moduleRef.get(DataSource);
};

export const stopTestApp = async () => {
  if (app) await app.close();
  if (containers.postgres) await containers.postgres.stop();
  if (containers.redis) await containers.redis.stop();
};
