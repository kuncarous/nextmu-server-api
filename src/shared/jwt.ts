/*import { Base64 } from 'js-base64';
import jwt from 'jsonwebtoken';
import { sessionExpireTime } from '~/shared/consts';
import {
    requestPrivateKey,
    requestPublicKey,
    sessionPrivateKey,
    sessionPublicKey,
} from '~/shared/rsa_keys';

export interface IGameSessionTokenInfo {
    accountId: string;
    sessionId: string;
    expireAt: string;
}

export interface IAuthTokenInfo {
    accountId: string;
    sessionKey: string;
    username: string;
}

export interface IEmailVerifyTokenInfo {
    accountId: string;
    verifyCode: string;
}

export interface IRecoverPasswordTokenInfo {
    accountId: string;
    username: string;
    recoverCode: string;
}

function jsonParserTypes(k: string, v: any) {
    if (
        v !== null &&
        typeof v === 'object' &&
        'type' in v &&
        v.type === 'Buffer' &&
        'data' in v &&
        Array.isArray(v.data)
    ) {
        return Buffer.from(v.data);
    }
    return v;
}

const jwtSignOptions: jwt.SignOptions = {
    algorithm: 'RS512',
    expiresIn: sessionExpireTime,
};
const jwtVerifyOptions: jwt.VerifyOptions = { algorithms: ['RS512'] };

export const getGameSessionTokenInfo = async (
    token: string,
): Promise<IGameSessionTokenInfo | null> => {
    if (!sessionPublicKey) {
        throw new Error('invalid public key');
    }

    try {
        const payload: any = jwt.verify(
            token,
            sessionPublicKey,
            jwtVerifyOptions,
        );
        if (!payload || typeof payload !== 'object') {
            throw new Error('invalid token');
        }

        return payload;
    } catch (error) {
        return null;
    }
};

export const getSessionTokenInfo = async (
    token: string,
): Promise<IAuthTokenInfo | null> => {
    if (!sessionPublicKey) {
        throw new Error('invalid public key');
    }

    try {
        const payload: any = jwt.verify(
            token,
            sessionPublicKey,
            jwtVerifyOptions,
        );
        if (!payload || typeof payload !== 'object') {
            throw new Error('invalid token');
        }

        return payload;
    } catch (error) {
        return null;
    }
};

export const signGameSessionToken = async (data: IGameSessionTokenInfo) => {
    if (!sessionPrivateKey) {
        throw new Error('invalid private key');
    }

    return jwt.sign(data, sessionPrivateKey, jwtSignOptions);
};

export const signSessionToken = async (data: IAuthTokenInfo) => {
    if (!sessionPrivateKey) {
        throw new Error('invalid private key');
    }

    return jwt.sign(data, sessionPrivateKey, jwtSignOptions);
};

export const getRequestTokenInfo = async (token: string) => {
    if (!requestPublicKey) {
        throw new Error('invalid public key');
    }

    const payload: any = jwt.verify(token, requestPublicKey, jwtVerifyOptions);
    if (!payload || typeof payload !== 'object') {
        throw new Error('invalid token');
    }

    return payload;
};

export const signRequestToken = async (
    data: IEmailVerifyTokenInfo | IRecoverPasswordTokenInfo,
) => {
    if (!requestPrivateKey) {
        throw new Error('invalid private key');
    }

    return jwt.sign(data, requestPrivateKey, jwtSignOptions);
};

export const signRequestTokenBase64 = async (
    data: IEmailVerifyTokenInfo | IRecoverPasswordTokenInfo,
) => {
    return Base64.encode(await signRequestToken(data));
};
*/
