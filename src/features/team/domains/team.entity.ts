import * as crypto from 'node:crypto';
import {
  IsArray,
  IsDate,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { validateSync } from 'class-validator';

export class TeamEntity {
  @IsUUID() readonly id: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsUUID() readonly hostId: string;

  @IsArray() members: string[] = [];

  @IsDate() readonly createdAt: Date;
  @IsDate() updatedAt: Date;

  constructor(name: string, hostId: string) {
    this.id = crypto.randomUUID();
    this.name = name.trim();
    this.hostId = hostId;
    this.members = [hostId];
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.validate();
  }

  addMember(userId: string) {
    if (this.members.includes(userId))
      throw new Error(`User ${userId} already in team`);
    this.members.push(userId);
    this.touch();
  }

  removeMember(userId: string) {
    const before = this.members.length;
    this.members = this.members.filter((id) => id !== userId);
    if (this.members.length !== before) this.touch();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      hostId: this.hostId,
      members: this.members,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  static fromJSON(json: unknown): TeamEntity {
    if (typeof json !== 'object' || json === null) {
      throw new Error('Invalid JSON for TeamEntity');
    }

    const obj = json as Record<string, unknown>;

    if (typeof obj.name !== 'string') {
      throw new Error('Invalid or missing field: name');
    }

    if (typeof obj.hostId !== 'string') {
      throw new Error('Invalid or missing field: hostId');
    }

    const instance = new TeamEntity(obj.name, obj.hostId);

    if (typeof obj.id === 'string') {
      Object.defineProperty(instance, 'id', { value: obj.id });
    }

    if (Array.isArray(obj.members)) {
      instance.members = obj.members.filter(
        (m): m is string => typeof m === 'string',
      );
    }

    if (typeof obj.createdAt === 'string') {
      Object.defineProperty(instance, 'createdAt', {
        value: new Date(obj.createdAt),
      });
    }

    if (typeof obj.updatedAt === 'string') {
      instance.updatedAt = new Date(obj.updatedAt);
    }

    instance.validate();
    return instance;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  private validate() {
    const errors = validateSync(this, { whitelist: true });
    if (errors.length > 0) {
      const message = errors
        .map((e) => Object.values(e.constraints ?? {}).join(', '))
        .join('; ');
      throw new Error(`Invalid TeamEntity: ${message}`);
    }
  }
}
