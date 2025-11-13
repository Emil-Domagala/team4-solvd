import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { RedisService } from '../src/common/utils/redis.service';

// Mock Redis Service that doesn't create any real connections
class MockRedisService {
  private mockClient = {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    quit: jest.fn().mockResolvedValue('OK'),
    disconnect: jest.fn().mockResolvedValue('OK'),
    sadd: jest.fn().mockResolvedValue(1),
    srem: jest.fn().mockResolvedValue(1),
    smembers: jest.fn().mockResolvedValue([]),
    exists: jest.fn().mockResolvedValue(0),
    flushall: jest.fn().mockResolvedValue('OK'),
    multi: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnThis(),
      sadd: jest.fn().mockReturnThis(),
      srem: jest.fn().mockReturnThis(),
      del: jest.fn().mockReturnThis(),
      expire: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([['OK'], ['OK']]),
    }),
    lrange: jest.fn().mockResolvedValue([]),
    rpush: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    on: jest.fn(),
    off: jest.fn(),
    status: 'ready',
  };

  onModuleInit() {
    // Do nothing - prevent real Redis connection
  }

  async onModuleDestroy() {
    // Do nothing - no real connections to close
  }

  getClient() {
    return this.mockClient;
  }
}

// Import all your modules
import { AuthModule } from '../src/features/auth/auth.module';
import { UserModule } from '../src/features/user/user.module';
import { CommonModule } from '../src/common/common.module';
import { UtilsModule } from '../src/common/utils/utils.module';
import { WordModule } from 'src/features/word/word.module';
import { GameModule } from 'src/features/game/game.module';

interface Containers {
  postgres?: StartedTestContainer;
  redis?: StartedTestContainer;
}

export let app: INestApplication;
export let dataSource: DataSource;
export let moduleRef: TestingModule;
export const containers: Containers = {};

export const createTestApp = async (): Promise<INestApplication> => {
  console.log('🐳 Starting test containers...');

  try {
    // Set test environment variables
    process.env.TEST_DB_USER = 'testuser';
    process.env.TEST_DB_PASSWORD = 'testpass';
    process.env.TEST_DB_NAME = 'testdb';
    process.env.NODE_ENV = 'test';
    process.env.AUTH_SESSION_TTL_SEC = '3600';
    process.env.AUTH_SESSION_COOKIE_NAME = 'testSession';
    process.env.CACHE_TTL = '60';

    // Start PostgreSQL container
    console.log('🐘 Starting PostgreSQL container...');
    containers.postgres = await new GenericContainer('postgres:15-alpine')
      .withEnvironment({
        POSTGRES_USER: 'testuser',
        POSTGRES_PASSWORD: 'testpass',
        POSTGRES_DB: 'testdb',
      })
      .withExposedPorts(5432)
      .withStartupTimeout(60000) // 60 seconds
      .start();

    const pgHost = containers.postgres.getHost();
    const pgPort = containers.postgres.getMappedPort(5432);
    console.log(`✅ PostgreSQL started at ${pgHost}:${pgPort}`);

    // Start Redis container
    console.log('🔴 Starting Redis container...');
    containers.redis = await new GenericContainer('redis:7-alpine')
      .withExposedPorts(6379)
      .withStartupTimeout(30000)
      .start();

    const redisHost = containers.redis.getHost();
    const redisPort = containers.redis.getMappedPort(6379);
    console.log(`✅ Redis started at ${redisHost}:${redisPort}`);

    // Set Redis environment variables for the real service
    process.env.REDIS_HOST = redisHost;
    process.env.REDIS_PORT = redisPort.toString();

    // Create test module
    console.log('🏗️ Creating test module...');
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: pgHost,
          port: pgPort,
          username: 'testuser',
          password: 'testpass',
          database: 'testdb',
          entities: [__dirname + '/../src/**/*.entity.{js,ts}'],
          synchronize: true,
          logging: ['error'], // Only show errors
          dropSchema: true,
          retryAttempts: 3,
          retryDelay: 3000,
        }),
        CommonModule,
        UtilsModule,
        AuthModule,
        UserModule,
        WordModule,
        GameModule,
      ],
    })
      .overrideProvider(RedisService)
      .useClass(MockRedisService)
      .compile();

    app = moduleRef.createNestApplication();

    // Initialize app with timeout
    console.log('🚀 Initializing application...');
    await Promise.race([
      app.init(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('App initialization timeout after 30s')),
          30000,
        ),
      ),
    ]);

    dataSource = moduleRef.get(DataSource);

    // Wait for database connection
    await dataSource.query('SELECT 1');

    console.log('✅ Test app created successfully!');
    return app;
  } catch (error) {
    console.error('❌ Failed to create test app:', error);
    await stopTestApp();
    throw error;
  }
};

export const stopTestApp = async (): Promise<void> => {
  console.log('🛑 Stopping test app...');

  try {
    if (app) {
      await app.close();
      console.log('✅ App closed');
    }

    if (moduleRef) {
      await moduleRef.close();
      console.log('✅ Module closed');
    }

    if (containers.postgres) {
      await containers.postgres.stop();
      console.log('✅ PostgreSQL container stopped');
    }

    if (containers.redis) {
      await containers.redis.stop();
      console.log('✅ Redis container stopped');
    }
  } catch (error) {
    console.error('⚠️ Error during cleanup:', error);
    // Don't throw, just log the error
  }
};

export const clearDatabase = async (): Promise<void> => {
  if (dataSource?.isInitialized) {
    try {
      const entities = dataSource.entityMetadatas;
      // Clear in reverse order to handle foreign key constraints
      for (let i = entities.length - 1; i >= 0; i--) {
        const entity = entities[i];
        await dataSource.query(
          `TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`,
        );
      }
      console.log('🧹 Database cleared');
    } catch (error) {
      console.warn('⚠️ Error clearing database:', error);
      // Fallback: drop and recreate schema
      await dataSource.synchronize(true);
    }
  }
};
