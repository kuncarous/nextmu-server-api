import { ObjectId, Binary } from 'mongodb';
import { MUUID } from 'uuid-mongodb';

export enum AccountRoles {
    Administrator = 0,
    UpdateManagement = 1,
    AccountManagement = 2,
    CreateItem = 3,
    AnnounceInGame = 4,
    TeleportUsers = 5,
    NewsEditor = 6,
}

export interface IMDBGameCurrentSession {
    id: MUUID;
    serverId?: MUUID;
    expireAt: Date;
}

export interface IMDBAccount {
    _id?: ObjectId;
    username: {
        value: string;
        normalized: string;
    };

    email: {
        value: string;
        normalized: string;
        verified: boolean;
        code: MUUID;
        lastSent: Date;
    };

    password: {
        salt: string;
        value: Binary;
    };

    profile: {
        firstName: string;
        lastName: string;
        gender: number;
        birthdate: string;
        country: number;
    };

    session: {
        concurrency: MUUID;
        game?: IMDBGameCurrentSession;
    };

    roles: AccountRoles[];
    createdAt: Date;
    updatedAt: Date;
}