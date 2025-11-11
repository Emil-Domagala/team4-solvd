import {
  createTestApp,
  stopTestApp,
  clearDatabase,
  app,
  dataSource,
} from 'src/../test/app-test';
import { WordUserController } from 'src/features/word/user/wordUser.controller';
import { WordEntity } from 'src/features/word/word.entity';
import { EntityNotFoundError } from 'src/common/errors/entityNotFound.error';

describe('WordUserController', () => {
  let controller: WordUserController;

  beforeAll(async () => {
    await createTestApp();
    controller = app.get(WordUserController);
  }, 120000);

  afterAll(async () => {
    await stopTestApp();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  it('should get a random word', async () => {
    const repo = dataSource.getRepository(WordEntity);
    await repo.save(repo.create({ value: 'Galaxy' }));

    const result = await controller.getRandomWord();
    expect(result).toBeDefined();
    expect(result.value).toBe('Galaxy');
  });

  it('should throw if no words exist', async () => {
    await expect(controller.getRandomWord()).rejects.toThrow(EntityNotFoundError);
  });

  it('should get a random word excluding specific ids', async () => {
    const repo = dataSource.getRepository(WordEntity);
    const word1 = await repo.save(repo.create({ value: 'Earth' }));
    const word2 = await repo.save(repo.create({ value: 'Mars' }));
    const word3 = await repo.save(repo.create({ value: 'Venus' }));

    const result = await controller.getRandomWordExcluding([word1.id, word2.id]);

    expect(result).toBeDefined();
    expect(result.value).toBe('Venus');
  });

  it('should throw if all words are excluded', async () => {
    const repo = dataSource.getRepository(WordEntity);
    const word = await repo.save(repo.create({ value: 'Pluto' }));

    await expect(
      controller.getRandomWordExcluding([word.id]),
    ).rejects.toThrow(EntityNotFoundError);
  });

  it('should get similarity between two words', () => {
    const similarity = controller.getSimilarity('car', 'cars');
    expect(similarity).toBeGreaterThan(0.5);
  });
});
