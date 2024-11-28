import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { Document } from 'mongoose';

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  @Exclude()
  password: string;

  @Prop({ default: false }) // Adicione um valor padrão para evitar problemas com valores undefined
  isOnline: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
