import { logger } from '~/shared/logger';
import { client } from '.';
import { redisExpireTime } from '~/shared/consts';
import { AccountRoles } from '@services/mongodb/schemas/accounts/accounts';

export const formatRolesKey = (accountId: string) => {
    return `account.roles.${accountId}`;
}

export const setRoles = async (accountId: string, roles: string[]) => {
    const rolesKey = formatRolesKey(accountId);
    try {
        await client.set(rolesKey, JSON.stringify(roles));
        return true;
    } catch (error) {
        logger.error(`[Redis] Set roles : ${error}`);
        return false;
    }
}

export const getRoles = async (accountId: string): Promise<AccountRoles[] | null> => {
    const rolesKey = formatRolesKey(accountId);
    try {
        const accountRoles = await client.get(rolesKey);
        return accountRoles != null ? JSON.parse(accountRoles) : null;
    } catch (error) {
        logger.error(`[Redis] Get roles : ${error}`);
        return null;
    }
}