import moment from "moment";

export interface ICheckSessionInfo {
    expire: string;
}

export interface IRedisSessionInfo {
    expire: string;
}

export enum GameSessionResult {
    Success = 0,
    InvalidAccount = 1,
    AccountInUse = 2, // Deprecated

    UnexpectedError = 100,
}

export interface IGameSessionInfo {
    accountId: string;
    sessionId: string;
    expireAt: moment.Moment;
}

export interface ISessionInfo {
    token?: string;
    accountId: string;
    session: string;
    expire: string;
    concurrency: string;
    emailVerified: boolean;
}

export interface ISessionBasicInfo {
    sessionId: string;
    date: Date;
}