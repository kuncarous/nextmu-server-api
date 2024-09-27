import { AnyBulkWriteOperation, Int32, Long } from 'mongodb';
import { IItemDeleteRequest, IItemSaveRequest } from '~/grpc/types/item';
import { logger } from '~/logger';
import { getMongoClient } from '~/shared/database';
import { IMDBItem } from './schemas/game/items';
import { IMDBMount } from './schemas/game/mounts';
import { IMDBPet } from './schemas/game/pets';

export const deleteItems = async (request: IItemDeleteRequest) => {
    const client = await getMongoClient();
    if (!client) {
        throw new Error(`couldn't find mongodb client`);
    }

    try {
        const itemsColl = client.db('game').collection<IMDBItem>('items');
        const mountsColl = client.db('game').collection<IMDBMount>('mounts');
        const petsColl = client.db('game').collection<IMDBPet>('pets');
        const currentTime = new Date();

        const session = client.startSession();
        session.startTransaction();

        try {
            if (request.itemIds.length > 0) {
                await itemsColl.updateMany(
                    {
                        _id: { $in: request.itemIds },
                        deleted: { $exists: false },
                    },
                    {
                        $set: {
                            deleted: currentTime,
                            updatedAt: currentTime,
                        },
                    },
                    {
                        session,
                    },
                );
            }

            if (request.mountIds.length > 0) {
                await mountsColl.updateMany(
                    {
                        _id: { $in: request.mountIds },
                        deleted: { $exists: false },
                    },
                    {
                        $set: {
                            deleted: currentTime,
                            updatedAt: currentTime,
                        },
                    },
                    {
                        session,
                    },
                );
            }

            if (request.petIds.length > 0) {
                await petsColl.updateMany(
                    {
                        _id: { $in: request.petIds },
                        deleted: { $exists: false },
                    },
                    {
                        $set: {
                            deleted: currentTime,
                            updatedAt: currentTime,
                        },
                    },
                    {
                        session,
                    },
                );
            }

            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    } catch (error) {
        logger.error(`[ERROR] deleteItems failed : ${error}`);
        throw error;
    }
};

export const saveItems = async (request: IItemSaveRequest) => {
    const client = await getMongoClient();
    if (!client) {
        throw new Error(`couldn't find mongodb client`);
    }

    try {
        const itemsColl = client.db('game').collection<IMDBItem>('items');
        const mountsColl = client.db('game').collection<IMDBMount>('mounts');
        const petsColl = client.db('game').collection<IMDBPet>('pets');
        const currentTime = new Date();

        const session = client.startSession();
        session.startTransaction();

        try {
            if (request.items.length > 0) {
                await itemsColl.bulkWrite(
                    request.items.map<AnyBulkWriteOperation<IMDBItem>>(
                        (item) => {
                            return {
                                updateOne: {
                                    filter: {
                                        _id: item.id,
                                    },
                                    update: {
                                        $set: {
                                            type: new Int32(item.itemType),
                                            index: new Int32(item.itemIndex),
                                            ownerId: item.ownerId,
                                            inventory: {
                                                type: new Int32(
                                                    item.inventoryType,
                                                ),
                                                index: new Int32(
                                                    item.inventoryIndex,
                                                ),
                                            },

                                            flags: new Int32(item.blockFlags),

                                            level: new Int32(item.level),
                                            experience: new Long(
                                                item.experience,
                                            ),
                                            quantity: new Int32(item.quantity),

                                            physical: {
                                                damage: {
                                                    min: new Int32(
                                                        item.physicalDamageMin,
                                                    ),
                                                    max: new Int32(
                                                        item.physicalDamageMax,
                                                    ),
                                                },
                                                defense: new Int32(
                                                    item.physicalDefense,
                                                ),
                                            },

                                            magical: {
                                                damage: {
                                                    min: new Int32(
                                                        item.magicalDamageMin,
                                                    ),
                                                    max: new Int32(
                                                        item.magicalDamageMax,
                                                    ),
                                                },
                                                defense: new Int32(
                                                    item.magicalDefense,
                                                ),
                                            },

                                            block: {
                                                chance: new Int32(
                                                    item.blockChance,
                                                ),
                                                damage: new Int32(
                                                    item.blockDamage,
                                                ),
                                            },

                                            speed: {
                                                attack: new Int32(
                                                    item.attackSpeed,
                                                ),
                                                move: new Int32(item.moveSpeed),
                                            },

                                            options: item.options.map(
                                                (option) => ({
                                                    type: new Int32(
                                                        option.type,
                                                    ),
                                                    rank: new Int32(
                                                        option.rank,
                                                    ),
                                                }),
                                            ),

                                            updatedAt: currentTime,
                                        },
                                        $setOnInsert: {
                                            _id: item.id,
                                            createdAt: currentTime,
                                        },
                                    },
                                    upsert: true,
                                },
                            };
                        },
                    ),
                    {
                        session,
                    },
                );
            }

            if (request.mounts.length > 0) {
                await mountsColl.bulkWrite(
                    request.mounts.map<AnyBulkWriteOperation<IMDBMount>>(
                        (item) => {
                            return {
                                updateOne: {
                                    filter: {
                                        _id: item.id,
                                    },
                                    update: {
                                        $set: {
                                            type: new Int32(item.mountType),
                                            ownerId: item.ownerId,
                                            inventory: {
                                                type: new Int32(
                                                    item.inventoryType,
                                                ),
                                                index: new Int32(
                                                    item.inventoryIndex,
                                                ),
                                            },

                                            flags: new Int32(item.blockFlags),

                                            level: new Int32(item.level),
                                            experience: new Long(
                                                item.experience,
                                            ),

                                            physical: {
                                                damage: new Int32(
                                                    item.physicalDamage,
                                                ),
                                                defense: new Int32(
                                                    item.physicalDefense,
                                                ),
                                            },

                                            magical: {
                                                damage: new Int32(
                                                    item.magicalDamage,
                                                ),
                                                defense: new Int32(
                                                    item.magicalDefense,
                                                ),
                                            },

                                            speed: {
                                                attack: new Int32(
                                                    item.attackSpeed,
                                                ),
                                                move: new Int32(item.moveSpeed),
                                            },

                                            options: item.options.map(
                                                (option) => ({
                                                    type: new Int32(
                                                        option.type,
                                                    ),
                                                    rank: new Int32(
                                                        option.rank,
                                                    ),
                                                }),
                                            ),

                                            updatedAt: currentTime,
                                        },
                                        $setOnInsert: {
                                            _id: item.id,
                                            createdAt: currentTime,
                                        },
                                    },
                                    upsert: true,
                                },
                            };
                        },
                    ),
                    {
                        session,
                    },
                );
            }

            if (request.pets.length > 0) {
                await petsColl.bulkWrite(
                    request.pets.map<AnyBulkWriteOperation<IMDBPet>>((item) => {
                        return {
                            updateOne: {
                                filter: {
                                    _id: item.id,
                                },
                                update: {
                                    $set: {
                                        type: new Int32(item.petType),
                                        ownerId: item.ownerId,
                                        inventory: {
                                            type: new Int32(item.inventoryType),
                                            index: new Int32(
                                                item.inventoryIndex,
                                            ),
                                        },

                                        flags: new Int32(item.blockFlags),

                                        level: new Int32(item.level),
                                        experience: new Long(item.experience),

                                        physical: {
                                            damage: new Int32(
                                                item.physicalDamage,
                                            ),
                                            defense: new Int32(
                                                item.physicalDefense,
                                            ),
                                        },

                                        magical: {
                                            damage: new Int32(
                                                item.magicalDamage,
                                            ),
                                            defense: new Int32(
                                                item.magicalDefense,
                                            ),
                                        },

                                        speed: {
                                            attack: new Int32(item.attackSpeed),
                                            move: new Int32(item.moveSpeed),
                                        },

                                        options: item.options.map((option) => ({
                                            type: new Int32(option.type),
                                            rank: new Int32(option.rank),
                                        })),

                                        updatedAt: currentTime,
                                    },
                                    $setOnInsert: {
                                        _id: item.id,
                                        createdAt: currentTime,
                                    },
                                },
                                upsert: true,
                            },
                        };
                    }),
                    {
                        session,
                    },
                );
            }

            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    } catch (error) {
        logger.error(`[ERROR] saveItems failed : ${error}`);
        throw error;
    }
};
