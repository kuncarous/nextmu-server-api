import { IsBootsCategory, IsDefensiveCategory, IsGlovesCategory, IsShieldCategory, IsWeaponCategory, IsWingCategory, ItemRankToFloat, ItemRankToSimpleRank } from "~/shared/items";
import { IMDBCharacter } from "../schemas/game/characters";
import { IMDBItem } from "../schemas/game/items";
import { IMDBMount } from "../schemas/game/mounts";
import { IMDBPet } from "../schemas/game/pets";
import { CharacterSmallInfo__Output as CharacterSmallInfo } from "~/proto/nextmu/types/character/v1/CharacterSmallInfo";
import { CharacterViewInfo__Output as CharacterViewInfo } from "~/proto/nextmu/types/character/v1/CharacterViewInfo";
import { SkinLinkInfo__Output as SkinLinkInfo } from "~/proto/nextmu/types/character/v1/SkinLinkInfo";
import { ItemSlotType } from "~/proto/nextmu/types/item/v1/ItemSlotType";

export class MDBSmallItem
{
	static readonly Projection = {
        'type': 1,
        'index': 1,
        'ownerId': 1,
        'inventory.index': 1,
        'level': 1,
        'physical': 1,
        'magical': 1,
        'block': 1,
        'speed': 1,
        'options': 1,
    };
};

export class MDBSmallMount
{
	static readonly Projection = {
        'type': 1,
        'ownerId': 1,
        'level': 1,
        'skin': 1,
    };
};

export class MDBSmallPet
{
	static readonly Projection = {
        'type': 1,
        'ownerId': 1,
        'level': 1,
        'skin': 1,
    };
};

export class MDBSmallCharacter
{
	static readonly Projection = {
        '_id': 1,
        'name': 1,
        'class': 1,
        'level': 1,
        'skins': 1,
        'authority': 1,
    };

    static Parse(character: IMDBCharacter): CharacterSmallInfo {
        return {
            characterId: Buffer.from(character._id.id),
            name: character.name.value,
            class: character.class.type.valueOf(),
            subClass: character.class.subtype.valueOf(),
            level: character.level.valueOf(),
            charset: [],
            skins: character.skins.map<SkinLinkInfo>(skin => ({
                slot: skin.slot.valueOf(),
                skinId: Buffer.from(skin.skinId.id),
            })),
            mount: null,
            pet: null,
            authorityCode: character.authority.valueOf(),
        };
    }

    static ParseItem(item: IMDBItem, character: CharacterSmallInfo) {
        const inventoryIndex = item.inventory.index.valueOf();
        if (
            inventoryIndex < 0 ||
            inventoryIndex >= ItemSlotType.MAX_EQUIPMENT
        )
            return;

        const itemType = item.type.valueOf();

        let itemOptionCount = 0;
		let itemRank = 0;
		if (IsWeaponCategory(itemType))
		{
			// Physical Damage Min
			itemOptionCount++;
			itemRank += ItemRankToFloat(item.physical.damage.min.valueOf());

			// Physical Damage Max
			itemOptionCount++;
			itemRank += ItemRankToFloat(item.physical.damage.max.valueOf());

			// Magical Damage Min
			itemOptionCount++;
			itemRank += ItemRankToFloat(item.magical.damage.min.valueOf());

			// Magical Damage Max
			itemOptionCount++;
			itemRank += ItemRankToFloat(item.magical.damage.max.valueOf());

			// Attack Speed
			itemOptionCount++;
			itemRank += ItemRankToFloat(item.speed.attack.valueOf());
		}
		else if (
            IsShieldCategory(itemType) ||
			IsDefensiveCategory(itemType)
        )
		{
			// Physical Defense
			itemOptionCount++;
			itemRank += ItemRankToFloat(item.physical.defense.valueOf());

			// Magical Defense
			itemOptionCount++;
			itemRank += ItemRankToFloat(item.magical.defense.valueOf());

			if (IsShieldCategory(itemType))
			{
				// Block Chance
				itemOptionCount++;
				itemRank += ItemRankToFloat(item.block.chance.valueOf());

				// Block Damage
				itemOptionCount++;
				itemRank += ItemRankToFloat(item.block.damage.valueOf());
			}
			else if (IsGlovesCategory(itemType))
			{
				// Attack Speed
				itemOptionCount++;
				itemRank += ItemRankToFloat(item.speed.attack.valueOf());

				// Move Speed
				itemOptionCount++;
				itemRank += ItemRankToFloat(item.speed.move.valueOf());
			}
			else if (IsBootsCategory(itemType))
			{
				// Move Speed
				itemOptionCount++;
				itemRank += ItemRankToFloat(item.speed.move.valueOf());
			}
			else if (IsWingCategory(itemType))
			{
				// Move Speed
				itemOptionCount++;
				itemRank += ItemRankToFloat(item.speed.move.valueOf());
			}
		}

		for (const option of item.options)
		{
            // Option Rank
            itemOptionCount++;
            itemRank += ItemRankToFloat(option.rank.valueOf());
		}

		if (itemOptionCount > 0)
			itemRank /= itemOptionCount;

        character.charset.push(
            {
                slot: inventoryIndex,
                type: itemType,
                index: item.index.valueOf(),
                level: item.level.valueOf(),
                rank: ItemRankToSimpleRank(itemRank),
            } as CharacterViewInfo
        );
    }

    static ParseMount(mount: IMDBMount, characterSmall: CharacterSmallInfo) {
        characterSmall.mount = {
            type: mount.type.valueOf(),
            level: mount.level.valueOf(),
            skin: (
                mount.skin != null
                ? Buffer.from(mount.skin.id)
                : undefined
            ),
            _skin: 'skin',
        };
    }

    static ParsePet(pet: IMDBPet, characterSmall: CharacterSmallInfo) {
        characterSmall.pet = {
            type: pet.type.valueOf(),
            level: pet.level.valueOf(),
            skin: (
                pet.skin != null
                ? Buffer.from(pet.skin.id)
                : undefined
            ),
            _skin: 'skin',
        };
    }
};