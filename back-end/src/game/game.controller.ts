import { Body, Controller, Post, Param, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { GameService, Difficulty } from './game.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDocument } from '../users/schemas/user.schema';

@Controller('game')
@UseGuards(JwtAuthGuard)
export class GameController {
  constructor(private gameService: GameService) {}

  @Post()
  createGame(
    @Req() req: Request,
    @Body() body: { difficulty?: Difficulty },
  ) {
    const user = req.user as UserDocument;
    return this.gameService.createGame(
      (user._id as object).toString(),
      body.difficulty ?? 'medium',
    );
  }

  @Post(':id/move')
  makeMove(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() body: { position: number },
  ) {
    const user = req.user as UserDocument;
    return this.gameService.makeMove(id, (user._id as object).toString(), body.position);
  }
}
