import { Int32, Long, ObjectId } from 'mongodb';

export interface IMDBDefaultItem {
    type: Int32;
    index: Int32;

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
}

export interface IMDBDefaultCharacter {
    _id: ObjectId;

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
    };

    items: IMDBDefaultItem[];

    skills: {
        type: Int32;
    }[];
}