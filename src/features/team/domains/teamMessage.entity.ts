import {
  IsEnum,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  IsDate,
  validateSync,
} from 'class-validator';

export enum TeamMessageType {
  SYSTEM = 'system',
  USER = 'user',
}

export class TeamMessageEntity {
  @IsUUID()
  readonly id!: string;

  @IsUUID()
  readonly teamId!: string;

  @IsUUID()
  readonly authorId!: string | null;

  @IsEnum(TeamMessageType)
  readonly type!: TeamMessageType;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  readonly text!: string;

  @IsDate()
  readonly createdAt!: Date;

  @IsDate()
  readonly updatedAt!: Date;

  constructor(params: {
    id: string;
    teamId: string;
    authorId: string | null;
    type: TeamMessageType;
    text: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.teamId = params.teamId;
    this.authorId = params.authorId;
    this.type = params.type;
    this.text = params.text.trim();
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? new Date();

    this.validate();
  }

  toJSON() {
    return {
      id: this.id,
      teamId: this.teamId,
      authorId: this.authorId,
      type: this.type,
      text: this.text,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  static fromJSON(json: Record<string, any>): TeamMessageEntity {
    const safeDate = (value: unknown): Date | undefined => {
      if (typeof value === 'string' || typeof value === 'number') {
        return new Date(value);
      }
      return undefined;
    };

    return new TeamMessageEntity({
      id: String(json.id),
      teamId: String(json.teamId),
      authorId: json.authorId ? String(json.authorId) : null,
      type: json.type as TeamMessageType,
      text: String(json.text),
      createdAt: safeDate(json.createdAt),
      updatedAt: safeDate(json.updatedAt),
    });
  }

  private validate() {
    const errors = validateSync(this, { whitelist: true });
    if (errors.length) {
      const message = errors
        .map((e) => Object.values(e.constraints ?? {}).join(', '))
        .join('; ');
      throw new Error(`Invalid TeamMessageEntity: ${message}`);
    }
  }
}
