import { Int32, Long, ObjectId } from 'mongodb';

export interface IMDBCharacter {
    _id: ObjectId;
    accountId: ObjectId;
    deleted?: Date;

    name: {
        value: string;
        normalized: string;
    };
    class: {
        type: Int32;
        subtype: Int32;
    };

    level: Int32;
    experience: Long;

    stats: {
        points: Int32;
        strength: Int32;
        dexterity: Int32;
        vitality: Int32;
        energy: Int32;

        life: number;
        mana: number;
        stamina: number;
    };

    map: {
        index: Int32;
        x: number;
        y: number;
        direction: number;
    };

    skills: {
        type: Int32;
    }[];

    skins: {
        slot: Int32;
        skinId: ObjectId;
    }[];

    authority: Int32;

    createdAt?: Date;
    updatedAt?: Date;
}