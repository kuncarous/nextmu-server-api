import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const ZCharacterListRequest = z.object({
    accountId: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .refine((v) => ObjectId.isValid(v))
        .transform((v) => new ObjectId(v)),
});
export type ICharacterListRequest = z.infer<typeof ZCharacterListRequest>;

export const ZCharacterCreateRequest = z.object({
    accountId: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .refine((v) => ObjectId.isValid(v))
        .transform((v) => new ObjectId(v)),
    class: z.number().int(),
    name: z.string().min(1),
});
export type ICharacterCreateRequest = z.infer<typeof ZCharacterCreateRequest>;

export const ZCharacterDeleteRequest = z.object({
    accountId: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .refine((v) => ObjectId.isValid(v))
        .transform((v) => new ObjectId(v)),
    characterId: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .refine((v) => ObjectId.isValid(v))
        .transform((v) => new ObjectId(v)),
});
export type ICharacterDeleteRequest = z.infer<typeof ZCharacterDeleteRequest>;

export const ZCharacterGetRequest = z.object({
    accountId: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .refine((v) => ObjectId.isValid(v))
        .transform((v) => new ObjectId(v)),
    characterId: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .refine((v) => ObjectId.isValid(v))
        .transform((v) => new ObjectId(v)),
});
export type ICharacterGetRequest = z.infer<typeof ZCharacterGetRequest>;

export const ZCharacterSaveRequest = z.object({
    accountId: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .refine((v) => ObjectId.isValid(v))
        .transform((v) => new ObjectId(v)),
    characterId: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .refine((v) => ObjectId.isValid(v))
        .transform((v) => new ObjectId(v)),
    gold: z.bigint(),
    eventCoins: z.bigint(),
    class: z.number().int(),
    subClass: z.number().int(),
    map: z.number().int(),
    positionX: z.number(),
    positionY: z.number(),
    direction: z.number(),
    availablePoints: z.number().int(),
    strength: z.number().int(),
    dexterity: z.number().int(),
    vitality: z.number().int(),
    energy: z.number().int(),
    life: z.number(),
    mana: z.number(),
    stamina: z.number(),
    level: z.number().int(),
    experience: z.bigint(),
    magics: z.array(z.number().int()),
});
export type ICharacterSaveRequest = z.infer<typeof ZCharacterSaveRequest>;
