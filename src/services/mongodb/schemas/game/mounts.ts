import { Int32, Long, ObjectId } from 'mongodb';
import { MUUID } from 'uuid-mongodb';

export interface IMDBMount {
    _id: MUUID;

    deleted?: Date;

    type: Int32;
    ownerId: ObjectId;
    inventory: {
        type: Int32;
        index: Int32;
    };

    flags: Int32;

    level: Int32;
    experience: Long;

    physical: {
        damage: Int32;
        defense: Int32;
    };

    magical: {
        damage: Int32;
        defense: Int32;
    };

    speed: {
        attack: Int32;
        move: Int32;
    };

    options: {
        type: Int32;
        rank: Int32;
    }[];

    skin?: ObjectId;

    createdAt?: Date;
    updatedAt?: Date;
}