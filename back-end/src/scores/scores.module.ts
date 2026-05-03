import { Module } from '@nestjs/common';
import { ScoresController } from './scores.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [ScoresController],
})
export class ScoresModule {}
