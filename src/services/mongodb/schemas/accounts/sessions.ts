import { ObjectId } from 'mongodb';
import { MUUID } from 'uuid-mongodb';

export interface IMDBWebSession {
    _id?: ObjectId;
    accountId: ObjectId;
    createdAt: Date;
    expireAt: Date;
}

export interface IMDBGameSession {
    _id?: ObjectId;
    sessionId: MUUID;
    accountId: ObjectId;
    createdAt: Date;
    expireAt: Date;
}