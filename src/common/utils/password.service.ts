import { Injectable } from '@nestjs/common';
import { randomBytes, pbkdf2 as _pbkdf2 } from 'crypto';
import { promisify } from 'util';

const pbkdf2 = promisify(_pbkdf2);

@Injectable()
export class PasswordService {
  private readonly saltLength = 16;
  private readonly iterations = 100_000;
  private readonly keyLength = 64;
  private readonly digest = 'sha512';

  /**
   * Hashes a plain text password using Node.js crypto (PBKDF2).
   */
  toHash = async (password: string): Promise<string> => {
    const salt = randomBytes(this.saltLength).toString('hex');
    const derivedKey = await pbkdf2(
      password,
      salt,
      this.iterations,
      this.keyLength,
      this.digest,
    );
    return `${salt}:${derivedKey.toString('hex')}`;
  };

  /**
   * Compares a plain text password against a stored hash.
   */
  compare = async (password: string, storedHash: string): Promise<boolean> => {
    const [salt, key] = storedHash.split(':');
    const derivedKey = await pbkdf2(
      password,
      salt,
      this.iterations,
      this.keyLength,
      this.digest,
    );
    return key === derivedKey.toString('hex');
  };
}
