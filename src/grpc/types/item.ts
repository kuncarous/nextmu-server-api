import { Binary, ObjectId } from 'mongodb';
import MUUID from 'uuid-mongodb';
import { z } from 'zod';

export const ZItemDeleteRequest = z.object({
    accountId: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .refine((v) => ObjectId.isValid(v))
        .transform((v) => new ObjectId(v)),
    characterId: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .refine((v) => ObjectId.isValid(v))
        .transform((v) => new ObjectId(v)),
    itemIds: z.array(
        z
            .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
            .transform((v) =>
                MUUID.from(
                    typeof v === 'string'
                        ? v
                        : new Binary(v, Binary.SUBTYPE_UUID),
                ),
            ),
    ),
    mountIds: z.array(
        z
            .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
            .transform((v) =>
                MUUID.from(
                    typeof v === 'string'
                        ? v
                        : new Binary(v, Binary.SUBTYPE_UUID),
                ),
            ),
    ),
    petIds: z.array(
        z
            .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
            .transform((v) =>
                MUUID.from(
                    typeof v === 'string'
                        ? v
                        : new Binary(v, Binary.SUBTYPE_UUID),
                ),
            ),
    ),
});
export type IItemDeleteRequest = z.infer<typeof ZItemDeleteRequest>;

const ZOption = z.object({
    type: z.number().int().min(0),
    rank: z.number().int().min(0),
});

const ZItem = z.object({
    id: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .transform((v) =>
            MUUID.from(
                typeof v === 'string' ? v : new Binary(v, Binary.SUBTYPE_UUID),
            ),
        ),
    ownerId: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .refine((v) => ObjectId.isValid(v))
        .transform((v) => new ObjectId(v)),
    inventoryType: z.number().int().min(0),
    inventoryIndex: z.number().int().min(0),
    itemType: z.number().int().min(0),
    itemIndex: z.number().int().min(0),
    blockFlags: z.number().int().min(0),
    level: z.number().int().min(1),
    experience: z.bigint().min(0n),
    quantity: z.number().int().min(0),
    physicalDamageMin: z.number().int().min(0),
    physicalDamageMax: z.number().int().min(0),
    magicalDamageMin: z.number().int().min(0),
    magicalDamageMax: z.number().int().min(0),
    physicalDefense: z.number().int().min(0),
    magicalDefense: z.number().int().min(0),
    blockChance: z.number().int().min(0),
    blockDamage: z.number().int().min(0),
    attackSpeed: z.number().int().min(0),
    moveSpeed: z.number().int().min(0),
    options: z.array(ZOption),
});

const ZMount = z.object({
    id: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .transform((v) =>
            MUUID.from(
                typeof v === 'string' ? v : new Binary(v, Binary.SUBTYPE_UUID),
            ),
        ),
    ownerId: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .refine((v) => ObjectId.isValid(v))
        .transform((v) => new ObjectId(v)),
    inventoryType: z.number().int().min(0),
    inventoryIndex: z.number().int().min(0),
    mountType: z.number().int().min(0),
    blockFlags: z.number().int().min(0),
    level: z.number().int().min(1),
    experience: z.bigint().min(0n),
    physicalDamage: z.number().int().min(0),
    magicalDamage: z.number().int().min(0),
    physicalDefense: z.number().int().min(0),
    magicalDefense: z.number().int().min(0),
    attackSpeed: z.number().int().min(0),
    moveSpeed: z.number().int().min(0),
    options: z.array(ZOption),
    skinId: z.instanceof(Buffer),
});

const ZPet = z.object({
    id: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .transform((v) =>
            MUUID.from(
                typeof v === 'string' ? v : new Binary(v, Binary.SUBTYPE_UUID),
            ),
        ),
    ownerId: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .refine((v) => ObjectId.isValid(v))
        .transform((v) => new ObjectId(v)),
    inventoryType: z.number().int().min(0),
    inventoryIndex: z.number().int().min(0),
    petType: z.number().int().min(0),
    blockFlags: z.number().int().min(0),
    level: z.number().int().min(1),
    experience: z.bigint().min(0n),
    physicalDamage: z.number().int().min(0),
    magicalDamage: z.number().int().min(0),
    physicalDefense: z.number().int().min(0),
    magicalDefense: z.number().int().min(0),
    attackSpeed: z.number().int().min(0),
    moveSpeed: z.number().int().min(0),
    options: z.array(ZOption),
    skinId: z.instanceof(Buffer),
});

export const ZItemSaveRequest = z.object({
    items: z.array(ZItem),
    mounts: z.array(ZMount),
    pets: z.array(ZPet),
});
export type IItemSaveRequest = z.infer<typeof ZItemSaveRequest>;
