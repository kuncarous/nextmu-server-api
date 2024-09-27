import moment from 'moment';
import {
    ISessionReleaseRequest,
    ISessionRenewRequest,
    ISessionValidateRequest,
} from '~/grpc/types/session';
import { logger } from '~/logger';
import {
    _nextmu_session_v1_SessionRenewResponse_ResponseCode,
    SessionRenewResponse__Output,
} from '~/proto/nextmu/session/v1/SessionRenewResponse';
import {
    _nextmu_session_v1_SessionValidateResponse_ResponseCode,
    SessionValidateResponse__Output,
} from '~/proto/nextmu/session/v1/SessionValidateResponse';
import { getMongoClient } from '~/shared/database';
import { IMDBAccount } from './schemas/accounts/accounts';
import { IMDBGameSession } from './schemas/accounts/sessions';

const gameSessionDuration = Number(process.env.GAME_SESSION_DURATION ?? 15);

export const validateSession = async ({
    accountId,
    sessionId,
    serverId,
}: ISessionValidateRequest): Promise<SessionValidateResponse__Output> => {
    const client = await getMongoClient();
    if (!client) {
        throw new Error(`couldn't find mongodb client`);
    }

    try {
        const accountsColl = client
            .db('accounts')
            .collection<IMDBAccount>('accounts');
        const sessionsColl = client
            .db('accounts')
            .collection<IMDBGameSession>('gameSessions');

        const currentTime = moment();
        const expireAt = moment(currentTime).add(
            gameSessionDuration,
            'minutes',
        );

        const session = await sessionsColl.findOneAndDelete({
            accountId,
            sessionId,
        });

        if (session == null || moment(session.expireAt) <= currentTime) {
            return {
                responseCode:
                    _nextmu_session_v1_SessionValidateResponse_ResponseCode.INVALID_SESSION,
                _accountId: 'accountId',
                _sessionId: 'sessionId',
                _accountName: 'accountName',
                _expireAt: 'expireAt',
            };
        }

        const account = await accountsColl.findOneAndUpdate(
            {
                _id: accountId,
                $or: [
                    {
                        'session.game': { $exists: false },
                    },
                    {
                        'session.game.expireAt': {
                            $lte: currentTime.toDate(),
                        },
                    },
                ],
            },
            {
                $set: {
                    'session.game': {
                        id: sessionId,
                        serverId,
                        expireAt: expireAt.toDate(),
                    },
                },
            },
            {
                projection: {
                    'username.value': 1,
                },
            },
        );

        if (account == null) {
            return {
                responseCode:
                    _nextmu_session_v1_SessionValidateResponse_ResponseCode.ACCOUNT_IN_USE,
                _accountId: 'accountId',
                _sessionId: 'sessionId',
                _accountName: 'accountName',
                _expireAt: 'expireAt',
            };
        }

        return {
            responseCode:
                _nextmu_session_v1_SessionValidateResponse_ResponseCode.SUCCESS,
            accountId: Buffer.from(account._id.id),
            sessionId: Buffer.from(sessionId.buffer),
            accountName: account.username.value,
            expireAt: expireAt.valueOf().toString(),
            _accountId: 'accountId',
            _sessionId: 'sessionId',
            _accountName: 'accountName',
            _expireAt: 'expireAt',
        };
    } catch (error) {
        logger.error(`[ERROR] validateSession failed : ${error}`);
        throw error;
    }
};

export const releaseSession = async ({
    accountId,
    sessionId,
}: ISessionReleaseRequest) => {
    const client = await getMongoClient();
    if (!client) {
        throw new Error(`couldn't find mongodb client`);
    }

    try {
        const accountsColl = client
            .db('accounts')
            .collection<IMDBAccount>('accounts');

        await accountsColl.updateOne(
            {
                _id: accountId,
                'session.game.id': sessionId,
            },
            {
                $unset: {
                    'session.game': 1,
                },
            },
        );
    } catch (error) {
        logger.error(`[ERROR] releaseSession failed : ${error}`);
        throw error;
    }
};

export const renewSession = async ({
    accountId,
    sessionId,
}: ISessionRenewRequest): Promise<SessionRenewResponse__Output> => {
    const client = await getMongoClient();
    if (!client) {
        throw new Error(`couldn't find mongodb client`);
    }

    try {
        const accountsColl = client
            .db('accounts')
            .collection<IMDBAccount>('accounts');

        const currentTime = moment();
        const expireAt = moment(currentTime).add(
            gameSessionDuration,
            'minutes',
        );

        const result = await accountsColl.updateOne(
            {
                accountId,
                sessionId,
                $and: [
                    {
                        'session.game': { $exists: true },
                    },
                    {
                        'session.game.expireAt': { $gte: currentTime.toDate() },
                    },
                ],
            },
            {
                $set: {
                    'session.game.expireAt': expireAt.toDate(),
                },
            },
        );

        if (result.modifiedCount < 1) {
            return {
                responseCode:
                    _nextmu_session_v1_SessionRenewResponse_ResponseCode.FAILED,
                _expireAt: 'expireAt',
            };
        }

        return {
            responseCode:
                _nextmu_session_v1_SessionRenewResponse_ResponseCode.SUCCESS,
            expireAt: expireAt.valueOf().toString(),
            _expireAt: 'expireAt',
        };
    } catch (error) {
        logger.error(`[ERROR] renewSession failed : ${error}`);
        throw error;
    }
};
