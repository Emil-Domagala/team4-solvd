import request from 'supertest';
import { UserRepository } from 'src/features/user/user.repo';
import { RoleService } from 'src/features/user/role/role.service';
import { RoleEnum } from 'src/features/user/role/role.enum';
import { RedisService } from 'src/common/utils/redis.service';
import {
  createTestApp,
  stopTestApp,
  app,
  dataSource,
  moduleRef,
} from '../../../../test/app-test';

describe('POST /auth/register IT', () => {
  let userRepository: UserRepository;
  let roleService: RoleService;

  beforeAll(async () => {
    await createTestApp();
    userRepository = moduleRef.get<UserRepository>(UserRepository);
    roleService = moduleRef.get<RoleService>(RoleService);

    // Ensure USER role exists
    try {
      const exists = await roleService.findByName(RoleEnum.USER);
      if (!exists) {
        await roleService.ensureDefaults();
      }
    } catch (error) {
      console.error('Error setting up roles:', error);
    }
  }, 60000);

  afterAll(async () => {
    try {
      if (app) {
        // Get all services that might have connections
        const services = [
          app.get(RedisService, { strict: false }),
          // Add any other services that might have connections
        ].filter(Boolean);

        // Close any existing connections
        for (const service of services) {
          try {
            if (service?.onModuleDestroy) {
              await service.onModuleDestroy();
            }
          } catch (error) {
            // Ignore errors during cleanup
          }
        }

        // Close app
        await app.close();
        console.log('🔌 App closed');
      }

      // Clean shutdown of testcontainers
      await stopTestApp();
    } catch (error) {
      console.log('⚠️ Cleanup error (can be ignored):', error.message);
    }
  }, 30000);
  beforeEach(async () => {
    // Clear database by recreating schema
    if (dataSource?.isInitialized) {
      try {
        // Recreate the entire schema to ensure clean state
        await dataSource.synchronize(true);
        console.log('🧹 Database recreated with synchronize');
      } catch (error) {
        console.error('Database cleanup failed:', error);
      }
    }

    // Recreate default roles
    try {
      await roleService.ensureDefaults();
    } catch (error) {
      console.error('Error recreating roles:', error);
    }
  });

  it('should register a new user and set session cookie', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'testUser',
    };

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(dto);

    console.log('Response status:', res.status);
    if (res.status !== 201) {
      console.log('Error response:', res.body);
    }

    expect(res.status).toBe(201);

    // Response body shape
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe(dto.email);
    expect(res.body.name).toBe(dto.name);

    // Cookie must be set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(
      Array.isArray(cookies) &&
        cookies.some((c: string) => c.includes('HttpOnly')),
    ).toBe(true);

    // Check DB actually contains the created user
    const storedUser = await userRepository.findByEmail(dto.email);
    expect(storedUser).toBeDefined();
    expect(storedUser?.role).toBeDefined();
    expect(storedUser?.score).toBeDefined();
  }, 30000); // 30 second timeout for this test

  it('should fail if email is already taken', async () => {
    const dto = {
      email: 'duplicate@example.com',
      password: 'password123',
      name: 'user1',
    };

    // First registration should succeed
    const firstRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(dto);

    expect(firstRes.status).toBe(201);

    // Second registration with same email should fail
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...dto, name: 'user2' }); // Different name, same email

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Email is already taken');
  }, 30000); // 30 second timeout for this test
});
