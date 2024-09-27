import { Int32, Long, ObjectId } from 'mongodb';
import MUUID from 'uuid-mongodb';
import {
    ICharacterCreateRequest,
    ICharacterDeleteRequest,
    ICharacterGetRequest,
    ICharacterSaveRequest,
} from '~/grpc/types/character';
import { logger } from '~/logger';
import {
    _nextmu_character_v1_CharacterCreateResponse_ResponseCode,
    CharacterCreateResponse__Output as CharacterCreateResponse,
} from '~/proto/nextmu/character/v1/CharacterCreateResponse';
import { CharacterGetResponse__Output } from '~/proto/nextmu/character/v1/CharacterGetResponse';
import { CharacterSmallInfo__Output as CharacterSmallInfo } from '~/proto/nextmu/types/character/v1/CharacterSmallInfo';
import { ItemData__Output as ItemData } from '~/proto/nextmu/types/character/v1/ItemData';
import { MountData__Output as MountData } from '~/proto/nextmu/types/character/v1/MountData';
import { PetData__Output as PetData } from '~/proto/nextmu/types/character/v1/PetData';
import { SkinInfo__Output as SkinInfo } from '~/proto/nextmu/types/character/v1/SkinInfo';
import { ItemSlotType } from '~/proto/nextmu/types/item/v1/ItemSlotType';
import {
    MDBSmallCharacter,
    MDBSmallItem,
    MDBSmallMount,
    MDBSmallPet,
} from '~/services/mongodb/parsers/charset';
import { getMongoClient } from '~/shared/database';
import {
    EInventoryType,
    EMountInventoryType,
    EPetInventoryType,
} from '~/shared/items';
import { IMDBCharacter } from './schemas/game/characters';
import { IMDBCurrencies } from './schemas/game/currencies';
import { IMDBDefaultCharacter } from './schemas/game/defaultcharacters';
import { IMDBItem } from './schemas/game/items';
import { IMDBMount } from './schemas/game/mounts';
import { IMDBPet } from './schemas/game/pets';
import { IMDBSkin } from './schemas/game/skins';

export const listCharacters = async (accountId: ObjectId) => {
    const client = await getMongoClient();
    if (!client) {
        throw new Error(`couldn't find mongodb client`);
    }

    try {
        const charactersColl = client
            .db('game')
            .collection<IMDBCharacter>('characters');
        const itemsColl = client.db('game').collection<IMDBItem>('items');
        const mountsColl = client.db('game').collection<IMDBMount>('mounts');
        const petsColl = client.db('game').collection<IMDBPet>('pets');
        const skinsColl = client.db('game').collection<IMDBSkin>('skins');

        const characters = await charactersColl
            .find(
                {
                    accountId,
                    deleted: { $exists: false },
                },
                {
                    projection: MDBSmallCharacter.Projection,
                },
            )
            .toArray();

        const characterList: CharacterSmallInfo[] = [];
        const characterIds: ObjectId[] = [];
        const charactersMap = new Map<string, CharacterSmallInfo>();

        for (const character of characters) {
            const characterSmall = MDBSmallCharacter.Parse(character);

            characterList.push(characterSmall);
            characterIds.push(character._id);
            charactersMap.set(character._id.toHexString(), characterSmall);
        }

        const items = itemsColl.find(
            {
                $and: [
                    {
                        ownerId: { $in: characterIds },
                    },
                    {
                        'inventory.type': {
                            $eq: new Int32(EInventoryType.CharacterEquipment),
                        },
                    },
                    {
                        deleted: { $exists: false },
                    },
                ],
            },
            {
                projection: MDBSmallItem.Projection,
            },
        );

        for await (const item of items) {
            const character = charactersMap.get(item.ownerId.toHexString());
            if (character == null) continue;
            MDBSmallCharacter.ParseItem(item, character);
        }

        const mounts = mountsColl.find(
            {
                $and: [
                    {
                        ownerId: { $in: characterIds },
                    },
                    {
                        'inventory.type': {
                            $eq: new Int32(EMountInventoryType.CharacterMount),
                        },
                    },
                    {
                        deleted: { $exists: false },
                    },
                ],
            },
            {
                projection: MDBSmallMount.Projection,
            },
        );

        for await (const mount of mounts) {
            const character = charactersMap.get(mount.ownerId.toHexString());
            if (character == null) continue;
            MDBSmallCharacter.ParseMount(mount, character);
        }

        const pets = petsColl.find(
            {
                $and: [
                    {
                        ownerId: { $in: characterIds },
                    },
                    {
                        'inventory.type': {
                            $eq: new Int32(EPetInventoryType.CharacterPet),
                        },
                    },
                    {
                        deleted: { $exists: false },
                    },
                ],
            },
            {
                projection: MDBSmallPet.Projection,
            },
        );

        for await (const pet of pets) {
            const character = charactersMap.get(pet.ownerId.toHexString());
            if (character == null) continue;
            MDBSmallCharacter.ParsePet(pet, character);
        }

        const dbskins = skinsColl.find({
            accountId,
        });

        const skins: SkinInfo[] = [];
        for await (const skin of dbskins) {
            skins.push({
                id: Buffer.from(skin._id.id),
                type: skin.type.valueOf(),
                index: skin.type.valueOf(),
            });
        }

        return {
            characters: characterList,
            skins,
        };
    } catch (error) {
        logger.error(`[ERROR] listCharacters failed : ${error}`);
        throw error;
    }
};

export const createCharacter = async (
    request: ICharacterCreateRequest,
): Promise<CharacterCreateResponse> => {
    const client = await getMongoClient();
    if (!client) {
        throw new Error(`couldn't find mongodb client`);
    }

    try {
        const defaultCharactersColl = client
            .db('game')
            .collection<IMDBDefaultCharacter>('defaultCharacters');
        const charactersColl = client
            .db('game')
            .collection<IMDBCharacter>('characters');
        const itemsColl = client.db('game').collection<IMDBItem>('items');

        const currentTime = new Date();
        const defaultCharacter = await defaultCharactersColl.findOne({
            'class.type': new Int32(request.class),
        });

        if (defaultCharacter == null) {
            return {
                responseCode:
                    _nextmu_character_v1_CharacterCreateResponse_ResponseCode.INVALID_CLASS,
                _character: 'character',
            };
        }

        const session = client.startSession();
        session.startTransaction();
        try {
            const character: IMDBCharacter = {
                _id: new ObjectId(),
                accountId: request.accountId,
                name: {
                    value: request.name,
                    normalized: request.name.toLowerCase(),
                },
                class: defaultCharacter.class,
                level: defaultCharacter.level,
                experience: defaultCharacter.experience,
                stats: defaultCharacter.stats,
                map: {
                    ...defaultCharacter.map,
                    direction: 0,
                },
                skills: defaultCharacter.skills,
                skins: [],
                authority: new Int32(0),
                createdAt: currentTime,
                updatedAt: currentTime,
            };

            const result = await charactersColl.updateOne(
                {
                    'name.normalized': character.name.normalized,
                    deleted: { $exists: false },
                },
                {
                    $setOnInsert: {
                        ...character,
                    },
                },
                {
                    session,
                    upsert: true,
                },
            );

            if (result.upsertedCount < 1) {
                return {
                    responseCode:
                        _nextmu_character_v1_CharacterCreateResponse_ResponseCode.NAME_EXISTS,
                    _character: 'character',
                };
            }

            const characterSmall = MDBSmallCharacter.Parse(character);

            if (defaultCharacter.items.length > 0) {
                const items = defaultCharacter.items.map<IMDBItem>((item) => ({
                    _id: MUUID.v4(),
                    ownerId: character._id,
                    ...item,
                    createdAt: currentTime,
                    updatedAt: currentTime,
                }));

                await itemsColl.insertMany(items, {
                    session,
                });

                for (const item of items) {
                    MDBSmallCharacter.ParseItem(item, characterSmall);
                }
            }

            await session.commitTransaction();

            return {
                responseCode:
                    _nextmu_character_v1_CharacterCreateResponse_ResponseCode.SUCCESS,
                character: characterSmall,
                _character: 'character',
            };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    } catch (error) {
        logger.error(`[ERROR] createCharacter failed : ${error}`);
        throw error;
    }
};

export const deleteCharacter = async (request: ICharacterDeleteRequest) => {
    const client = await getMongoClient();
    if (!client) {
        throw new Error(`couldn't find mongodb client`);
    }

    try {
        const charactersColl = client
            .db('game')
            .collection<IMDBCharacter>('characters');
        const itemsColl = client.db('game').collection<IMDBItem>('items');
        const mountsColl = client.db('game').collection<IMDBMount>('mounts');
        const petsColl = client.db('game').collection<IMDBPet>('pets');
        const currentTime = new Date();

        const session = client.startSession();
        session.startTransaction();

        try {
            const characterResult = await charactersColl.updateOne(
                {
                    _id: request.characterId,
                    accountId: request.accountId,
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

            if (characterResult.modifiedCount < 1) {
                return;
            }

            await itemsColl.updateMany(
                {
                    ownerId: request.characterId,
                    deleted: { $exists: false },
                    'inventory.type': {
                        $lt: new Int32(EInventoryType.CharacterInventoryEnd),
                    },
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

            await mountsColl.updateMany(
                {
                    ownerId: request.characterId,
                    deleted: { $exists: false },
                    'inventory.type': {
                        $lt: new Int32(
                            EMountInventoryType.CharacterInventoryEnd,
                        ),
                    },
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

            await petsColl.updateMany(
                {
                    ownerId: request.characterId,
                    deleted: { $exists: false },
                    'inventory.type': {
                        $lt: new Int32(EPetInventoryType.CharacterInventoryEnd),
                    },
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
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    } catch (error) {
        logger.error(`[ERROR] deleteCharacter failed : ${error}`);
        throw error;
    }
};

export const fetchCharacter = async (
    request: ICharacterGetRequest,
): Promise<CharacterGetResponse__Output> => {
    const client = await getMongoClient();
    if (!client) {
        throw new Error(`couldn't find mongodb client`);
    }

    try {
        const currenciesColl = client
            .db('game')
            .collection<IMDBCurrencies>('currencies');
        const charactersColl = client
            .db('game')
            .collection<IMDBCharacter>('characters');
        const itemsColl = client.db('game').collection<IMDBItem>('items');
        const mountsColl = client.db('game').collection<IMDBMount>('mounts');
        const petsColl = client.db('game').collection<IMDBPet>('pets');
        const currentTime = new Date();

        const currencies = await currenciesColl.findOneAndUpdate(
            {
                _id: request.accountId,
            },
            {
                $setOnInsert: {
                    gold: new Long(0),
                    events: {
                        general: new Long(0),
                    },
                    createdAt: currentTime,
                    updatedAt: currentTime,
                },
            },
            {
                upsert: true,
                returnDocument: 'after',
            },
        );
        if (currencies == null) {
            throw new Error(`missing currencies`);
        }

        const character = await charactersColl.findOne({
            _id: request.characterId,
            deleted: { $exists: false },
        });
        if (character == null) {
            throw new Error(`invalid character`);
        }

        const response: CharacterGetResponse__Output = {
            characterId: Buffer.from(character._id.id),
            gold: currencies.gold.toString(),
            eventCoins: currencies.events.general.toString(),
            characterName: character.name.value,
            class: character.class.type.valueOf(),
            subClass: character.class.subtype.valueOf(),
            map: character.map.index.valueOf(),
            positionX: character.map.x.valueOf(),
            positionY: character.map.y.valueOf(),
            direction: character.map.direction.valueOf(),
            authorityCode: character.authority.valueOf(),
            availablePoints: character.stats.points.valueOf(),
            strength: character.stats.strength.valueOf(),
            dexterity: character.stats.dexterity.valueOf(),
            vitality: character.stats.vitality.valueOf(),
            energy: character.stats.energy.valueOf(),
            life: character.stats.life.valueOf(),
            mana: character.stats.mana.valueOf(),
            stamina: character.stats.stamina.valueOf(),
            level: character.level.valueOf(),
            experience: character.experience.toString(),
            magics: character.skills.map((s) => s.type.valueOf()),
            equipment: [],
            mount: null,
            pet: null,
            inventory: {
                equipment: [],
                consumables: [],
                quests: [],
                pets: [],
                mounts: [],
                jewels: [],
                passivePets: [],
                others: [],
            },
            storage: {
                equipment: [],
                consumables: [],
                quests: [],
                pets: [],
                mounts: [],
                jewels: [],
                passivePets: [],
                others: [],
            },
            skins: character.skins.map((skin) => ({
                slot: skin.slot.valueOf(),
                skinId: Buffer.from(skin.skinId.id),
            })),
        };

        const items = itemsColl.find({
            deleted: { $exists: false },
            $or: [
                {
                    ownerId: request.characterId,
                    'inventory.type': {
                        $lt: new Int32(EInventoryType.CharacterInventoryEnd),
                    },
                },
                {
                    ownerId: request.accountId,
                    'inventory.type': {
                        $gte: new Int32(EInventoryType.StorageInventoryBegin),
                        $lt: new Int32(EInventoryType.StorageInventoryEnd),
                    },
                },
            ],
        });

        const { inventory, storage } = response;
        const equipmentCheck = Array(ItemSlotType.MAX_EQUIPMENT).fill(false);
        for await (const dbitem of items) {
            const inventoryType = dbitem.inventory.type.valueOf();
            const inventoryIndex = dbitem.inventory.index.valueOf();

            const item: ItemData = {
                id: Buffer.from(dbitem._id.buffer),
                ownerId: Buffer.from(dbitem.ownerId.id),
                inventoryType,
                inventoryIndex,
                itemType: dbitem.type.valueOf(),
                itemIndex: dbitem.index.valueOf(),
                blockFlags: dbitem.flags.valueOf(),
                level: dbitem.level.valueOf(),
                experience: dbitem.experience.toString(),
                quantity: dbitem.quantity.valueOf(),

                physicalDamageMin: dbitem.physical.damage.min.valueOf(),
                physicalDamageMax: dbitem.physical.damage.max.valueOf(),
                physicalDefense: dbitem.physical.defense.valueOf(),

                magicalDamageMin: dbitem.magical.damage.min.valueOf(),
                magicalDamageMax: dbitem.magical.damage.max.valueOf(),
                magicalDefense: dbitem.magical.defense.valueOf(),

                blockChance: dbitem.block.chance.valueOf(),
                blockDamage: dbitem.block.damage.valueOf(),

                attackSpeed: dbitem.speed.attack.valueOf(),
                moveSpeed: dbitem.speed.move.valueOf(),

                options: dbitem.options.map((option) => ({
                    type: option.type.valueOf(),
                    rank: option.rank.valueOf(),
                })),
            };

            switch (inventoryType) {
                case EInventoryType.CharacterEquipment:
                    {
                        if (
                            inventoryIndex < 0 ||
                            inventoryIndex >= ItemSlotType.MAX_EQUIPMENT
                        )
                            break;
                        if (equipmentCheck[inventoryIndex] == true) break;

                        response.equipment.push(item);
                        equipmentCheck[inventoryIndex] = true;
                    }
                    break;

                case EInventoryType.EquipmentInventory:
                    inventory!.equipment.push(item);
                    break;
                case EInventoryType.PetsInventory:
                    inventory!.pets.push(item);
                    break;
                case EInventoryType.JewelsInventory:
                    inventory!.jewels.push(item);
                    break;
                case EInventoryType.ConsumablesInventory:
                    inventory!.consumables.push(item);
                    break;
                case EInventoryType.QuestsInventory:
                    inventory!.quests.push(item);
                    break;
                case EInventoryType.OthersInventory:
                    inventory!.others.push(item);
                    break;

                case EInventoryType.EquipmentStorage:
                    storage!.equipment.push(item);
                    break;
                case EInventoryType.PetsStorage:
                    storage!.pets.push(item);
                    break;
                case EInventoryType.JewelsStorage:
                    storage!.jewels.push(item);
                    break;
                case EInventoryType.ConsumablesStorage:
                    storage!.consumables.push(item);
                    break;
                case EInventoryType.QuestsStorage:
                    storage!.quests.push(item);
                    break;
                case EInventoryType.OthersStorage:
                    storage!.others.push(item);
                    break;
            }
        }

        const mounts = mountsColl.find({
            deleted: { $exists: false },
            $or: [
                {
                    ownerId: request.characterId,
                    'inventory.type': {
                        $lt: new Int32(
                            EMountInventoryType.CharacterInventoryEnd,
                        ),
                    },
                },
                {
                    ownerId: request.accountId,
                    'inventory.type': {
                        $gte: new Int32(
                            EMountInventoryType.StorageInventoryBegin,
                        ),
                        $lt: new Int32(EMountInventoryType.StorageInventoryEnd),
                    },
                },
            ],
        });

        for await (const dbmount of mounts) {
            const inventoryType = dbmount.inventory.type.valueOf();
            const inventoryIndex = dbmount.inventory.index.valueOf();

            const item: MountData = {
                id: Buffer.from(dbmount._id.buffer),
                ownerId: Buffer.from(dbmount.ownerId.id),
                skinId: Buffer.from(dbmount.skin?.id ?? []),
                inventoryType,
                inventoryIndex,
                mountType: dbmount.type.valueOf(),
                blockFlags: dbmount.flags.valueOf(),
                level: dbmount.level.valueOf(),
                experience: dbmount.experience.toString(),

                physicalDamage: dbmount.physical.damage.valueOf(),
                physicalDefense: dbmount.physical.defense.valueOf(),

                magicalDamage: dbmount.magical.damage.valueOf(),
                magicalDefense: dbmount.magical.defense.valueOf(),

                attackSpeed: dbmount.speed.attack.valueOf(),
                moveSpeed: dbmount.speed.move.valueOf(),

                options: dbmount.options.map((option) => ({
                    type: option.type.valueOf(),
                    rank: option.rank.valueOf(),
                })),
            };

            switch (inventoryType) {
                case EMountInventoryType.CharacterMount:
                    response.mount ??= item;
                    break;

                case EMountInventoryType.MountsInventory:
                    inventory!.mounts.push(item);
                    break;

                case EMountInventoryType.MountsStorage:
                    storage!.mounts.push(item);
                    break;
            }
        }

        const pets = petsColl.find({
            deleted: { $exists: false },
            $or: [
                {
                    ownerId: request.characterId,
                    'inventory.type': {
                        $lt: new Int32(EPetInventoryType.CharacterInventoryEnd),
                    },
                },
                {
                    ownerId: request.accountId,
                    'inventory.type': {
                        $gte: new Int32(
                            EPetInventoryType.StorageInventoryBegin,
                        ),
                        $lt: new Int32(EPetInventoryType.StorageInventoryEnd),
                    },
                },
            ],
        });

        for await (const dbpet of pets) {
            const inventoryType = dbpet.inventory.type.valueOf();
            const inventoryIndex = dbpet.inventory.index.valueOf();

            const item: PetData = {
                id: Buffer.from(dbpet._id.buffer),
                ownerId: Buffer.from(dbpet.ownerId.id),
                skinId: Buffer.from(dbpet.skin?.id ?? []),
                inventoryType,
                inventoryIndex,
                petType: dbpet.type.valueOf(),
                blockFlags: dbpet.flags.valueOf(),
                level: dbpet.level.valueOf(),
                experience: dbpet.experience.toString(),

                physicalDamage: dbpet.physical.damage.valueOf(),
                physicalDefense: dbpet.physical.defense.valueOf(),

                magicalDamage: dbpet.magical.damage.valueOf(),
                magicalDefense: dbpet.magical.defense.valueOf(),

                attackSpeed: dbpet.speed.attack.valueOf(),
                moveSpeed: dbpet.speed.move.valueOf(),

                options: dbpet.options.map((option) => ({
                    type: option.type.valueOf(),
                    rank: option.rank.valueOf(),
                })),
            };

            switch (inventoryType) {
                case EPetInventoryType.CharacterPet:
                    response.pet ??= item;
                    break;

                case EPetInventoryType.PetsInventory:
                    inventory!.passivePets.push(item);
                    break;

                case EPetInventoryType.PetsStorage:
                    storage!.passivePets.push(item);
                    break;
            }
        }

        return response;
    } catch (error) {
        logger.error(`[ERROR] fetchCharacter failed : ${error}`);
        throw error;
    }
};

export const saveCharacter = async (request: ICharacterSaveRequest) => {
    const client = await getMongoClient();
    if (!client) {
        throw new Error(`couldn't find mongodb client`);
    }

    try {
        const currenciesColl = client
            .db('game')
            .collection<IMDBCurrencies>('currencies');
        const charactersColl = client
            .db('game')
            .collection<IMDBCharacter>('characters');
        const currentTime = new Date();

        const session = client.startSession();
        session.startTransaction();

        try {
            await currenciesColl.updateOne(
                {
                    _id: request.accountId,
                },
                {
                    $set: {
                        gold: new Long(request.gold),
                        events: {
                            general: new Long(request.eventCoins),
                        },
                        updatedAt: currentTime,
                    },
                    $setOnInsert: {
                        _id: request.accountId,
                    },
                },
                {
                    session,
                    upsert: true,
                },
            );

            await charactersColl.updateOne(
                {
                    _id: request.characterId,
                },
                {
                    $set: {
                        class: {
                            type: new Int32(request.class),
                            subtype: new Int32(request.subClass),
                        },
                        level: new Int32(request.level),
                        experience: new Long(request.experience),
                        stats: {
                            points: new Int32(request.availablePoints),

                            strength: new Int32(request.strength),
                            dexterity: new Int32(request.dexterity),
                            vitality: new Int32(request.vitality),
                            energy: new Int32(request.energy),

                            life: request.life,
                            mana: request.mana,
                            stamina: request.stamina,
                        },
                        map: {
                            index: new Int32(request.map),
                            x: request.positionX,
                            y: request.positionY,
                            direction: request.direction,
                        },
                        skills: request.magics.map((skill) => ({
                            type: new Int32(skill),
                        })),
                        updatedAt: currentTime,
                    },
                },
                {
                    session,
                },
            );

            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    } catch (error) {
        logger.error(`[ERROR] saveCharacter failed : ${error}`);
        throw error;
    }
};
