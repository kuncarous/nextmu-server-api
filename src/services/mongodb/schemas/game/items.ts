import { Int32, Long, ObjectId } from 'mongodb';
import { MUUID } from 'uuid-mongodb';

export interface IMDBItem {
    _id: MUUID;

    deleted?: Date;

    type: Int32;
    index: Int32;
    ownerId: ObjectId;
    inventory: {
        type: Int32;
        index: Int32;
    };

    flags: Int32;

    level: Int32;
    experience: Long;
    quantity: Int32;

    physical: {
        damage: {
            min: Int32;
            max: Int32;
        };
        defense: Int32;
    };

    magical: {
        damage: {
            min: Int32;
            max: Int32;
        };
        defense: Int32;
    };

    block: {
        chance: Int32;
        damage: Int32;
    };

    speed: {
        attack: Int32;
        move: Int32;
    };

    options: {
        type: Int32;
        rank: Int32;
    }[];

    createdAt?: Date;
    updatedAt?: Date;
}
