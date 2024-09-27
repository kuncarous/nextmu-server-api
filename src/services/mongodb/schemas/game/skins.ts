import { Int32, ObjectId } from 'mongodb';

export interface IMDBSkin {
    _id: ObjectId;
    accountId: ObjectId;
    type: Int32;
    index: Int32;
}