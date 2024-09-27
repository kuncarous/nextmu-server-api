import { logger } from '~/shared/logger';
import { client } from '.';
import { redisExpireTime } from '~/shared/consts';
import { IRedisSessionInfo } from '~/shared/types/auth';

export const formatSessionKey = (accountId: string, session: string) => {
    return `account.session.${accountId}.${session.toLowerCase()}`;
}

export const addSession = async (accountId: string, session: string, sessionInfo: IRedisSessionInfo) => {
    const sessionKey = formatSessionKey(accountId, session);
    try {
        await client.setex(sessionKey, redisExpireTime, JSON.stringify(sessionInfo));
        return true;
    } catch (error) {
        logger.error(`[Redis] Add session : ${error}`);
        return false;
    }
}

export const removeSession = async (accountId: string, session: string) => {
    const sessionKey = formatSessionKey(accountId, session);
    try {
        const deleted = await client.del(sessionKey);
        return deleted > 0;
    } catch (error) {
        logger.error(`[Redis] Remove session : ${error}`);
        return null;
    }
}

export const removeSessions = async (accountId: string, session: string) => {
    const sessionKey = formatSessionKey(accountId, session);
    try {
        const promise = new Promise<void>((resolve, reject) => {
            const deleteKeys: string[] = [];
            const stream = client.scanStream({
                match: `account.session.${accountId}.*`,
                count: 5,
            });
            stream.on("data", (keys: string[]) => {
                for (let n = 0; n < keys.length; ++n) {
                    const key = keys[n];
                    if (key === sessionKey) continue;
                    deleteKeys.push(key);
                }
            })
            stream.on("end", () => {
                if (deleteKeys.length > 0) {
                    client.del(deleteKeys);
                }
                resolve();
            });
            stream.on("error", (error) => {
                reject(error);
            });
        });
        await promise;
        return true;
    } catch (error) {
        logger.error(`[Redis] Remove sessions : ${error}`);
        return false;
    }
}

export const getSession = async (accountId: string, session: string): Promise<IRedisSessionInfo | null> => {
    const sessionKey = formatSessionKey(accountId, session);
    try {
        const info = await client.get(sessionKey);
        return !info ? null : JSON.parse(info);
    } catch (error) {
        logger.error(`[Redis] Get session : ${error}`);
        return null;
    }
}

export const verifySession = async (accountId: string, session: string) => {
    const sessionKey = formatSessionKey(accountId, session);
    try {
        const exists = await client.exists(sessionKey);
        return exists > 0;
    } catch (error) {
        logger.error(`[Redis] Verify session : ${error}`);
        return false;
    }
}