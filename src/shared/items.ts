/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
export enum EItemRank {
    RankF,
    RankE,
    RankD,
    RankC,
    RankB,
    RankA,
    RankS,
    RankSS,
    RankSSS,
    RankEX,
    RankMax,
}

export const EInvalidItem = 65535;
export const EInvalidItemOption = 65535;

const ItemRankMaxUnsigned = 65535;
export const ItemRankToFloat = (rank: number) => {
    const cvalue = 1.0 / ItemRankMaxUnsigned;
    return rank * cvalue;
};

export const ItemRankToUInt16 = (rank: number) => {
    return Math.round(rank * ItemRankMaxUnsigned);
};

export const ItemRankToSimpleRank = (itemRank: number) => {
    if (itemRank <= 0.15) return EItemRank.RankF;
    if (itemRank <= 0.3) return EItemRank.RankE;
    if (itemRank <= 0.4) return EItemRank.RankD;
    if (itemRank <= 0.5) return EItemRank.RankC;
    if (itemRank <= 0.6) return EItemRank.RankB;
    if (itemRank <= 0.7) return EItemRank.RankA;
    if (itemRank <= 0.8) return EItemRank.RankS;
    if (itemRank <= 0.9) return EItemRank.RankSS;
    if (itemRank < 1.0) return EItemRank.RankSSS;
    return EItemRank.RankEX;
};

export enum EInventoryType {
    CharacterEquipment,

    CharacterInventoryBegin = 1,
    EquipmentInventory = CharacterInventoryBegin,
    PetsInventory,
    JewelsInventory,
    ConsumablesInventory,
    QuestsInventory,
    OthersInventory,
    CharacterInventoryEnd = CharacterInventoryBegin + 63,

    StorageInventoryBegin = 65,
    EquipmentStorage = StorageInventoryBegin,
    PetsStorage,
    JewelsStorage,
    ConsumablesStorage,
    QuestsStorage,
    OthersStorage,
    StorageInventoryEnd = StorageInventoryBegin + 63,

    AuctionInventoryBegin = StorageInventoryEnd,
    AuctionSellingInventory = AuctionInventoryBegin,
    AuctionReceiveInventory,
    AuctionInventoryEnd = AuctionInventoryBegin + 63,

    TemporaryInventoryBegin = 224,
    MyTradeInventory,
    TargetTradeInventory,
    TemporaryInventoryEnd,
}

export enum EMountInventoryType {
    CharacterMount,

    CharacterInventoryBegin = 1,
    MountsInventory = CharacterInventoryBegin,
    CharacterInventoryEnd = CharacterInventoryBegin + 63,

    StorageInventoryBegin = 65,
    MountsStorage = StorageInventoryBegin,
    StorageInventoryEnd = StorageInventoryBegin + 63,
}

export enum EPetInventoryType {
    CharacterPet,

    CharacterInventoryBegin = 1,
    PetsInventory = CharacterInventoryBegin,
    CharacterInventoryEnd = CharacterInventoryBegin + 63,

    StorageInventoryBegin = 65,
    PetsStorage = StorageInventoryBegin,
    StorageInventoryEnd = StorageInventoryBegin + 63,
}

export const MaxItemLevel = 200;
export const MaxBaseItemLevel = 100;
export const ItemLevelDivisor = 1.0 / 100.0;
export const ItemLevelAddition = 25.0 / 100.0;
export const BaseItemLevelFormula = 0.5;

export enum EItemType {
    EquipmentsBegin = 0,
    WeaponsBegin = 0,
    Swords = 0,
    Axes = 1,
    Maces = 2,
    Scepters = 3,
    Spears = 4,
    Bows = 5,
    Crossbows = 6,
    Staffs = 7,
    Sticks = 8,
    Books = 9,
    WeaponsEnd,

    ShieldsBegin = 14,
    Shields = 14,
    ShieldsEnd,

    Projectiles = 15, // Arrows

    DefensiveBegin = 16,
    ArmorSetsBegin = 16,
    Helms = 16,
    Armors = 17,
    Pants = 18,
    Gloves = 19,
    Boots = 20,
    ArmorSetsEnd,

    Wings = 21,
    DefensiveEnd,
    Rings = 22,
    Pendants = 23,
    EquipmentsEnd,

    Skills = 32,
    Consumables = 33,
    Boxes = 34,
    Jewels = 35,
    Pets = 36, // Mounts, Pets, etc... (Only consumables items to summon)
    Quests = 37,
    Events = 38, // Blood Castle, Devilsquare, Chaos Castle & others tickets

    MaxCategories = 40,
    MaxItemsPerCategory = 256,
}

export const MaxItemCategories = EItemType.MaxCategories;
export const MaxItemIndex = EItemType.MaxItemsPerCategory;
export const MaxItemInfo =
    EItemType.MaxCategories * EItemType.MaxItemsPerCategory;

export const ParseItemIndex = (Category: number, Index: number) => {
    return Category * MaxItemIndex + Index;
};

export const GetItemCategory = (Index: number) => {
    return Index / MaxItemIndex;
};
export const GetItemIndex = (Index: number) => {
    return Index % MaxItemIndex;
};

export const IsEquipmentCategory = (Category: number) => {
    return Category < EItemType.EquipmentsEnd;
};

export const IsWeaponCategory = (Category: number) => {
    return (
        Category >= EItemType.WeaponsBegin && Category < EItemType.WeaponsEnd
    );
};

export const IsPhysicalWeaponCategory = (Category: number) => {
    return Category >= EItemType.Swords && Category <= EItemType.Crossbows;
};

export const IsMagicalWeaponCategory = (Category: number) => {
    return Category >= EItemType.Staffs && Category <= EItemType.Sticks;
};

export const IsProjectileCategory = (Category: number) => {
    return Category == EItemType.Projectiles;
};

export const IsShieldCategory = (Category: number) => {
    return (
        Category >= EItemType.ShieldsBegin && Category < EItemType.ShieldsEnd
    );
};

export const IsArmorSetCategory = (Category: number) => {
    return (
        Category >= EItemType.ArmorSetsBegin &&
        Category < EItemType.ArmorSetsEnd
    );
};

export const IsHelmCategory = (Category: number) => {
    return Category == EItemType.Helms;
};

export const IsArmorCategory = (Category: number) => {
    return Category == EItemType.Armors;
};

export const IsPantsCategory = (Category: number) => {
    return Category == EItemType.Pants;
};

export const IsGlovesCategory = (Category: number) => {
    return Category == EItemType.Gloves;
};

export const IsBootsCategory = (Category: number) => {
    return Category == EItemType.Boots;
};

export const IsWingCategory = (Category: number) => {
    return Category == EItemType.Wings;
};

export const IsRingCategory = (Category: number) => {
    return Category == EItemType.Rings;
};

export const IsPendantCategory = (Category: number) => {
    return Category == EItemType.Pendants;
};

export const IsSkillCategory = (Category: number) => {
    return Category == EItemType.Skills;
};

export const IsConsumableCategory = (Category: number) => {
    return Category == EItemType.Consumables;
};

export const IsBoxesCategory = (Category: number) => {
    return Category == EItemType.Boxes;
};

export const IsQuestCategory = (Category: number) => {
    return Category == EItemType.Quests;
};

export const IsDefensiveCategory = (Category: number) => {
    return (
        Category >= EItemType.DefensiveBegin &&
        Category < EItemType.DefensiveEnd
    );
};

export const IsLeveableItem = (Category: number) => {
    return (
        IsWeaponCategory(Category) ||
        IsShieldCategory(Category) ||
        IsDefensiveCategory(Category)
    );
};

export const CanConsumeItem = (Category: number) => {
    return (
        IsSkillCategory(Category) ||
        IsConsumableCategory(Category) ||
        IsBoxesCategory(Category)
    );
};

export const IsQuantityItem = (Category: number) => {
    return Category >= EItemType.Skills;
};
