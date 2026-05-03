import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

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
    return this.userModel.find().sort({ score: -1 }).lean();
  }
}
