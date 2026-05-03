import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  googleId: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  displayName: string;

  @Prop({ default: '' })
  picture: string;

  @Prop({ default: 0 })
  score: number;

  @Prop({ default: 0 })
  consecutiveWins: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
