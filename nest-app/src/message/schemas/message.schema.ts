
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";


@Schema()
export class Message {
    @Prop({ required: true })
    message: string;

    @Prop({ required: true/*, ref: 'User'*/ })
    sender: string;

    @Prop({ required: true })
    senderName: string;

    @Prop({ required: true, /*ref: 'User' */})
    recipient: string/*Types.ObjectId*/

    @Prop({ default: Date.now })
    createDat: Date
}

export const MessageSchema = SchemaFactory.createForClass(Message);
