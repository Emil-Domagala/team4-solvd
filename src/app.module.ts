import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './features/auth/auth.module';
import { UserModule } from './features/user/user.module';
import { WordModule } from './features/word/word.module';
import { CommonModule } from './common/common.module';
import { RoomModule } from './features/room/room.module';
import { TeamModule } from './features/team/team.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'admin'),
        password: configService.get<string>('DB_PASSWORD', 'password'),
        database: configService.get<string>('DB_NAME', 'mainDB'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    CommonModule,
    AuthModule,
    UserModule,
    WordModule,
    RoomModule,
    TeamModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
