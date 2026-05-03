import { Controller, Get } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Controller('scores')
export class ScoresController {
  constructor(private usersService: UsersService) {}

  @Get('leaderboard')
  async getLeaderboard() {
    const users = await this.usersService.findAll();
    return users.map((u, index) => ({
      rank: index + 1,
      displayName: u.displayName,
      picture: u.picture,
      score: u.score,
      consecutiveWins: u.consecutiveWins,
    }));
  }
}
