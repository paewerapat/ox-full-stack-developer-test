import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type Cell = 'X' | 'O' | null;
export type GameStatus = 'playing' | 'win' | 'lose' | 'draw';
export type GameDocument = Game & Document;

@Schema({ timestamps: true })
export class Game {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [MongooseSchema.Types.Mixed], default: () => Array(9).fill(null) })
  board: Cell[];

  @Prop({ enum: ['playing', 'win', 'lose', 'draw'], default: 'playing' })
  status: GameStatus;

  @Prop({ enum: ['medium', 'boss'], default: 'medium' })
  difficulty: 'medium' | 'boss';
}

export const GameSchema = SchemaFactory.createForClass(Game);
