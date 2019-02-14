export type PokeStatType = {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;

    [propName: string]: string | number | undefined;
};

export type PokeAbilityType = {
    0: string;
    1?: string;
    H?: string;

    [propName: string]: string | number | undefined;
};

export type PokeTypesType = {
    bug: number;
    dark: number;
    dragon: number;
    electric: number;
    fairy: number;
    fighting: number;
    fire: number;
    flying: number;
    ghost: number;
    grass: number;
    ground: number;
    ice: number;
    normal: number;
    poison: number;
    psychic: number;
    rock: number;
    steel: number;
    water: number;

    [propName: string]: number;
};

export type PokeGenderType = { M: number; F: number; };
export type EmbedFieldSimple = { name: string, value: string };
export type DiscordGameDevPub = { id: string, name: string };