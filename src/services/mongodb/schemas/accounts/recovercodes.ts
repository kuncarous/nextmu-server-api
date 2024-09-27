import { ObjectId } from 'mongodb';

export interface IMDBRecoverAccount {
    _id?: ObjectId;
    accountId: ObjectId;
    createdAt: Date;
    expireAt: Date;
}