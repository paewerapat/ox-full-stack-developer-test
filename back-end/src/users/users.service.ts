import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

export interface ScoreUpdate {
  scoreChange: number;
  bonusWin: boolean;
  newScore: number;
  consecutiveWins: number;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOrCreate(profile: {
    googleId: string;
    email: string;
    displayName: string;
    picture: string;
  }): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ googleId: profile.googleId });
    if (existing) return existing;
    return this.userModel.create(profile);
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().sort({ score: -1 });
  }

  async updateScore(userId: string, result: 'win' | 'lose' | 'draw'): Promise<ScoreUpdate> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error('User not found');

    let scoreChange = 0;
    let bonusWin = false;

    if (result === 'win') {
      scoreChange = 1;
      user.score += 1;
      user.consecutiveWins += 1;
      if (user.consecutiveWins === 3) {
        scoreChange += 1;
        bonusWin = true;
        user.score += 1;
        user.consecutiveWins = 0;
      }
    } else if (result === 'lose') {
      scoreChange = -1;
      user.score -= 1;
      user.consecutiveWins = 0;
    } else {
      user.consecutiveWins = 0;
    }

    await user.save();
    return { scoreChange, bonusWin, newScore: user.score, consecutiveWins: user.consecutiveWins };
  }
}
