import {
  createTestApp,
  stopTestApp,
  clearDatabase,
  app,
  dataSource,
} from './app-test';
import { UserEntity } from '../src/features/user/user.entity';
import { AuthService } from '../src/features/auth/auth.service';

describe('Integration Tests', () => {
  beforeAll(async () => {
    await createTestApp();
  }, 120000); // 2 minutes timeout for container startup

  afterAll(async () => {
    await stopTestApp();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  it('should connect to database and create a user', async () => {
    // Verify database connection
    const result = await dataSource.query('SELECT 1 as value');
    expect(result[0].value).toBe(1);

    // Create a user via TypeORM
    const userRepository = dataSource.getRepository(User);
    const user = new User();
    user.email = 'test@example.com';
    user.password = 'hashedPassword123';

    const savedUser = await userRepository.save(user);
    expect(savedUser.id).toBeDefined();
    expect(savedUser.email).toBe('test@example.com');

    // Verify user was saved
    const foundUser = await userRepository.findOne({
      where: { email: 'test@example.com' },
    });
    expect(foundUser).toBeDefined();
    expect(foundUser?.id).toBe(savedUser.id);
  });

  it('should have services available', async () => {
    const authService = app.get(AuthService);
    expect(authService).toBeDefined();
  });

  it('should clear database between tests', async () => {
    const userRepository = dataSource.getRepository(User);

    // Database should be empty after clearDatabase
    const count = await userRepository.count();
    expect(count).toBe(0);
  });
});
