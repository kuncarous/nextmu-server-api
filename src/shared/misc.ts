import { logger } from '~/logger';

export const paramMissingError =
    'One or more of the required parameters was missing.';

export const pErr = (err: Error) => {
    if (err) {
        logger.error(err);
    }
};

export const getRandomInt = () => {
    return Math.floor(Math.random() * 1_000_000_000_000);
};

export const includesAll = (source: unknown[], toInclude: unknown[]) => {
    for (const include of toInclude) {
        if (!source.includes(include)) return false;
    }
    return true;
};

export const fixedProgress = (progress: number) =>
    Math.floor(progress * 100) * 0.01;
