import { logger } from '~/shared/logger';
import { client } from '.';

export const formatConcurrencyKey = (accountId: string) => {
    return `account.concurrency.${accountId}`;
}

export const setConcurrency = async (accountId: string, concurrency: string) => {
    const concurrencyKey = formatConcurrencyKey(accountId);
    try {
        await client.set(concurrencyKey, concurrency);
        return true;
    } catch (error) {
        logger.error(`[Redis] Add concurrency key : ${error}`);
        return false;
    }
}

export const getConcurrency = async (accountId: string) => {
    const concurrencyKey = formatConcurrencyKey(accountId);
    try {
        const concurrency = await client.get(concurrencyKey);
        return concurrency;
    } catch (error) {
        logger.error(`[Redis] Get concurrency key : ${error}`);
        return null;
    }
}