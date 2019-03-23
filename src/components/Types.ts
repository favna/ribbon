import { Command } from 'awesome-commando';
import { Snowflake, TextChannel, VoiceChannel, VoiceConnection } from 'awesome-djs';
import { videoFormat } from 'ytdl-core';
import { Song } from '.';

type FlavorTextType = {
    version_id: string;
    flavor_text: string;
};

type PokeAliasType = {
    alias: string;
};

type YoutubeVideoContentDetailsType = {
    videoId: string;
    videoPublishedAt: string;
};

export type YoutubeVideoSnippetType = {
    channelId: string;
    channelTitle: string;
    description: string;
    playlistId?: string;
    position?: number;
    publishedAt: string;
    resourceId: YoutubeVideoResourceType;
    thumbnails: YoutubeVideoThumbnailType;
    title: string;
};

type YoutubeVideoThumbnailType = {
    default: string;
    high?: string;
    medium?: string;
    standard?: string;
};

type YoutubeVideoResourceType = {
    kind: string;
    videoId: string;
};

type DiscordGameExecutableType = {
    name: string;
    os: string;
};

type FrontlineGirlConstantsType = {
    mov: number;
    crit_rate: number;
    crit_dmg: number;
    pen: number;

    [propName: string]: number;
};

type FrontlineGirlStatsType = {
    hp: number;
    ammo: number;
    ration: number;
    dmg: number;
    eva: number;
    acc: number;
    rof: number;
    armor: number;

    [propName: string]: number;
};

export type FrontlineGirlProductionRequirementsType = {
    manpower: number;
    ammo: number;
    rations: number;
    parts: number;

    [propName: string]: number;
};

type FrontlineGirlAbilityType = {
    name: string;
    icon: string;
    text: string;
    initial?: string;
    cooldown?: string[];
    damage_value?: string[];
    hit_value?: string[];
    round_quantity?: string[];
    time_value?: string[];

    [propName: string]: string | string[] | undefined;
};

type PokeStatType = {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;

    [propName: string]: string | number | undefined;
};

type PokeAbilityType = {
    0: string;
    1?: string;
    H?: string;
    S?: string;

    [propName: string]: string | undefined;
};

type PokeTypesType = {
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

type PokeGenderRatioType = {
    M: number;
    F: number;
};

export type CydiaAPIPackageType = {
    display: string;
    name: string;
    section: string;
    summary: string;
    version: string;
};

export type SimpleEmbedFieldType = { name: string, value: string };
export type DiscordGameDevType = { id: string, name: string };

export interface IMusicCommand extends Command {
    queue: any;
    votes: any;
}

export type MusicQueueType = {
    textChannel: TextChannel;
    voiceChannel: VoiceChannel;
    connection: VoiceConnection | null;
    songs: Song[];
    volume: number;
    playing: boolean;
    isTriggeredByStop?: boolean;
};

export type MusicVoteType = {
    count: number;
    users: Snowflake[];
    queue: MusicQueueType;
    guild: Snowflake;
    start: number;
    timeout: any;
};

export type YoutubeVideoType = {
    id: string;
    title: string;
    kind: string;
    etag?: string;
    durationSeconds: number;
    contentDetails?: YoutubeVideoContentDetailsType;
    snippet?: YoutubeVideoSnippetType;
};

export type PokeDataType = {
    abilities?: string;
    evos?: string;
    flavors?: string;
    genders?: string;
    sprite: string;
    tier?: string;
    entries: any[];
};

export type MovieGenreType = {
    name: string;
};

export type CasinoRowType = {
    userID: string;
    balance: number;
    lastdaily: string;
    lastweekly: string;
    vault: number;
};

export type PokedexType = {
    num: number;
    species: string;
    types: string[];
    genderRatio?: PokeGenderRatioType;
    gender?: string;
    baseStats: PokeStatType;
    abilities: PokeAbilityType;
    heightm: number;
    weightkg: number;
    color: string;
    name?: string;
    baseForme?: string;
    baseSpecies?: string;
    forme?: string;
    formeLetter?: string;
    prevo?: string;
    evos?: string[];
    evoLevel?: number | string;
    eggGroups?: string[];
    otherFormes?: string[];
};

export type PokeAbilityDetailsType = {
    desc?: string;
    shortDesc: string;
    id: string;
    name: string;
    num: number;
};

export type PokeItemDetailsType = {
    id: string;
    name: string;
    desc: string;
    gen: number;
    num: number;
    shortDesc?: string;
};

export type PokeMoveDetailsType = {
    id: string;
    num: number;
    name: string;
    shortDesc: string;
    type: string;
    basePower: string | number;
    pp: number;
    category: string;
    accuracy: boolean | string | number;
    priority: number;
    target: string;
    contestType: string;
    isZ?: string;
    desc?: string;
};

export interface IPokeAbilityAliases extends PokeAliasType {
    ability: string;
}

export interface IPokeTierAliases extends PokeAliasType {
    tier: string;
}

export interface IPokeDexAliases extends PokeAliasType {
    name: string;
}

export interface IPokeItemAliases extends PokeAliasType {
    item: string;
}

export interface IPokeMoveAliases extends PokeAliasType {
    move: string;
}

export type TCGPropsType = {
    name: string;
    types: string;
    subtype: string;
    supertype?: string;
    hp: string;
};

export type PokeTypeDataType = {
    doubleEffectiveTypes: string[];
    doubleResistedTypes: string[];
    effectiveTypes: string[];
    effectlessTypes: string[];
    multi: PokeTypesType;
    normalTypes: string[];
    resistedTypes: string[];
};

export type WordDefinitionType = {
    language: string;
    text: string;
};

export type SteamGenreType = {
    description: string;
    id: string;
};

export type UrbanDefinitionType = {
    author: string;
    current_vote: string;
    defid: number;
    definition: string;
    example: string;
    permalink: string;
    sound_urls: string[];
    thumbs_down: number;
    thumbs_up: number;
    word: string;
    written_on: string;
};

export type OverwatchHeroType = {
    hero: string;
    time: number;
};

export type CopypastaType = {
    id: number;
    name: string;
    content: string;
};

export type TimerType = {
    id: number;
    interval: number;
    channel: Snowflake;
    content: string;
    lastsend: string;
    members: string;
};

export type FortniteStatsType = {
    key: string;
    value: string;
};

export type CountdownType = {
    id: number;
    channel: string;
    content: string;
    datetime: string;
    lastsend: string;
    tag: string;
};

export type FlavorJSONType = {
    [propName: string]: FlavorTextType[];
};

export type FormatsJSONType = {
    [propName: string]: string;
};

export type IGDBType = {
    id: number;
    name?: string;
};

export interface IIGDBInvolvedCompany extends IGDBType {
    id: number;
    company: IGDBType;
    developer: boolean;
}

export interface IIGDBAgeRating extends IGDBType {
    category: number;
    rating: number;
}

export type DiscordGameSKUType = {
    distributor: string;
    sku: string;
};

export type DiscordGameType = {
    description: string;
    developers: string[];
    distributor_applications: DiscordGameSKUType[];
    executables: DiscordGameExecutableType[];
    icon: string;
    id: string;
    name: string;
    publishers: string[];
    splash: string;
    summary: string;
    third_party_skus: DiscordGameSKUType[];
};

export type DiscordGameParsedType = {
    id: string;
    icon: string;
    name?: string;
    store_link?: string;
    developers?: DiscordGameDevType[];
    publishers?: DiscordGameDevType[];
    summary?: string;
    price?: string;
    thumbnail?: string;
};

export type DiscordStoreGameType = {
    code?: string;
    id?: string;
    summary?: string;
    sku?: {
        name: string;
        price: {
            currency: string;
            amount: number;
        }
    };
    thumbnail?: {
        id: string;
    };
};

export type FrontlineGirlType = {
    url: string;
    num: number;
    name: string;
    type: string;
    rating: number;
    constStats: FrontlineGirlConstantsType;
    baseStats: FrontlineGirlStatsType;
    maxStats: FrontlineGirlStatsType;
    ability: FrontlineGirlAbilityType;
    ability2?: FrontlineGirlAbilityType;
    tile_bonus: string;
    bonus_desc: string;
    production: {
        timer?: string;
        normal?: FrontlineGirlProductionRequirementsType;
        heavy?: FrontlineGirlProductionRequirementsType;
        reward?: string;
        stage?: string;
    };
    img?: string;
};

export type eShopType = {
    categories: { category: string[] },
    slug: string;
    buyitnow: boolean;
    release_date: string;
    digitaldownload: string;
    free_to_start: string;
    title: string;
    system: string;
    id: string;
    ca_price: string;
    number_of_players: string;
    nsuid: string;
    eshop_price: string;
    front_box_art: string;
    game_code: string;
    buyonline: string;
};

export interface IPrismVideoFormat extends videoFormat {
    audio_sample_rate?: number;
}