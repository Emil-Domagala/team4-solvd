import { ConfigError } from '../errors/config.error';

/**
 * Centralized utility for accessing environment variables safely.
 * Throws ConfigError if a variable is missing or invalid.
 */
export class Env {
  /**
   * Get a required environment variable as a string.
   * @throws {ConfigError} if the variable is missing
   */
  static getString(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new ConfigError(`Missing environment variable: ${key}`);
    }
    return value;
  }

  /**
   * Get a required environment variable as a number.
   * @throws {ConfigError} if the variable is missing or not a valid number
   */
  static getNumber(key: string): number {
    const value = process.env[key];
    if (!value) {
      throw new ConfigError(`Missing environment variable: ${key}`);
    }

    const num = Number(value);
    if (isNaN(num)) {
      throw new ConfigError(`Invalid number for environment variable: ${key}`);
    }

    return num;
  }

  /**
   * Get an optional environment variable as a boolean.
   * Accepts "true" or "false" (case-insensitive).
   * Returns defaultValue if not present.
   */
  static getBoolean(key: string, defaultValue = false): boolean {
    const value = process.env[key];
    if (value === undefined) return defaultValue;

    if (['true', 'false'].includes(value.toLowerCase())) {
      return value.toLowerCase() === 'true';
    }

    throw new ConfigError(`Invalid boolean for environment variable: ${key}`);
  }

  /**
   * Get an optional environment variable as a string.
   * Returns defaultValue if not present.
   */
  static getOptionalString(
    key: string,
    defaultValue?: string,
  ): string | undefined {
    const value = process.env[key];
    return value ?? defaultValue;
  }

  static getOptionalNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (value === undefined) return defaultValue;

    const num = Number(value);
    if (isNaN(num)) {
      throw new ConfigError(`Invalid number for environment variable: ${key}`);
    }

    return num;
  }
}
