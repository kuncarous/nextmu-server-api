import { ObjectId } from "mongodb";
import { MUUID } from "uuid-mongodb";

export interface IMDBGameServerGroup {
    _id?: ObjectId;
    index: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMDBGameServerInfo {
    _id?: MUUID;
    index: number;
    group: number;
    host: string;
    port: number;
    users: number;
    maxUsers: number;
    pvp: boolean;
    createdAt: Date;
    updatedAt: Date;
}