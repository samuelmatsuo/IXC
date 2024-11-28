import { Document } from "mongoose";


export class Message extends Document {
    message: string;
    sender: string;
    senderName: string;
    recipient: string
    createDat : Date

}