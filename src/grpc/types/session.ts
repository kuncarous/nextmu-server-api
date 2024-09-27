import { Binary, ObjectId } from 'mongodb';
import MUUID from 'uuid-mongodb';
import { z } from 'zod';

export const ZSessionValidateRequest = z.object({
    accountId: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .refine((v) => ObjectId.isValid(v))
        .transform((v) => new ObjectId(v)),
    sessionId: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .transform((v) =>
            MUUID.from(
                typeof v === 'string' ? v : new Binary(v, Binary.SUBTYPE_UUID),
            ),
        ),
    serverId: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .transform((v) =>
            MUUID.from(
                typeof v === 'string' ? v : new Binary(v, Binary.SUBTYPE_UUID),
            ),
        ),
});
export type ISessionValidateRequest = z.infer<typeof ZSessionValidateRequest>;

export const ZSessionReleaseRequest = z.object({
    accountId: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .refine((v) => ObjectId.isValid(v))
        .transform((v) => new ObjectId(v)),
    sessionId: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .transform((v) =>
            MUUID.from(
                typeof v === 'string' ? v : new Binary(v, Binary.SUBTYPE_UUID),
            ),
        ),
});
export type ISessionReleaseRequest = z.infer<typeof ZSessionReleaseRequest>;

export const ZSessionRenewRequest = z.object({
    accountId: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .refine((v) => ObjectId.isValid(v))
        .transform((v) => new ObjectId(v)),
    sessionId: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .transform((v) =>
            MUUID.from(
                typeof v === 'string' ? v : new Binary(v, Binary.SUBTYPE_UUID),
            ),
        ),
});
export type ISessionRenewRequest = z.infer<typeof ZSessionRenewRequest>;
