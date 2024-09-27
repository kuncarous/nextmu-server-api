import { Long, ObjectId } from 'mongodb';

export interface IMDBCurrencies {
    _id: ObjectId;
    gold: Long;
    events: {
        general: Long;
    };

    createdAt?: Date;
    updatedAt?: Date;
}
