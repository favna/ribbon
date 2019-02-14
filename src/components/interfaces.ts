import { Command } from 'awesome-commando';
import { Snowflake, TextChannel, VoiceChannel, VoiceConnection } from 'awesome-djs';
import { Song } from './util';

type PokeGenderType = {
    M: number;
    F: number;
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

    [propName: string]: string | number | undefined;
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

interface IFlavorTextEntity {
    version_id: string;
    flavor_text: string;
}

interface IPokeAlias {
    alias: string;
}

interface IYoutubeVideoContentDetails {
    videoId: string;
    videoPublishedAt: string;
}

interface IYoutubeVideoSnippet {
    channelId: string;
    channelTitle: string;
    description: string;
    playlistId?: string;
    position?: number;
    publishedAt: string;
    resourceId: IYoutubeVideoResource;
    thumbnails: IYoutubeVideoThumbnails;
    title: string;
}

interface IYoutubeVideoThumbnails {
    default: string;
    high?: string;
    medium?: string;
    standard?: string;
}

interface IYoutubeVideoResource {
    kind: string;
    videoId: string;
}

interface IDiscordGameExecutable {
    name: string;
    os: string;
}

interface IFrontLineGirlConstantStats {
    mov: number;
    crit_rate: number;
    crit_dmg: number;
    pen: number;

    [propName: string]: number;
}

interface IFrontlineGirlStats {
    hp: number;
    ammo: number;
    ration: number;
    dmg: number;
    eva: number;
    acc: number;
    rof: number;
    armor: number;

    [propName: string]: number;
}

interface IFrontLineGirlProductionRequirements {
    manpower: number;
    ammo: number;
    rations: number;
    parts: number;

    [propName: string]: number;
}

interface IFrontLineGirlAbility {
    name: string;
    icon: string;
    text: string;
    initial: string;
    cooldown: string[];
    damage_value: string[];
    hit_value: string[];
    round_quantity: string[];
    time_value: string[];

    [propName: string]: string | string[];
}

export interface IMusicCommand extends Command {
    queue: any;
    votes: any;
}

export interface IMusicQueue {
    textChannel: TextChannel;
    voiceChannel: VoiceChannel;
    connection: VoiceConnection;
    songs: Song[];
    volume: number;
    playing: boolean;
    isTriggeredByStop?: boolean;
}

export interface IMusicVote {
    count: number;
    users: Snowflake[];
    queue: IMusicQueue;
    guild: Snowflake;
    start: number;
    timeout: any;
}

export interface IYoutubeVideo {
    id: string;
    title: string;
    kind: string;
    etag?: string;
    durationSeconds: number;
    contentDetails?: IYoutubeVideoContentDetails;
    snippet?: IYoutubeVideoSnippet;
}

export interface IPokeData {
    abilities?: string;
    evos?: string;
    flavors?: string;
    genders?: string;
    sprite: string;
    tier?: string;
    entries?: any[];
}

export interface IMovieGenre {
    name: string;
}

export interface ICasinoRow {
    userID: string;
    balance: number;
    lastdaily: string;
    lastweekly: string;
    vault: number;
}

export interface IPokeDex {
    num: number;
    species: string;
    types: string[];
    genderRatio?: PokeGenderType;
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
    gender?: string;
    prevo?: string;
    evos?: string[];
    evoLevel?: number | string;
    eggGroups?: string[];
    otherFormes?: string[];
}

export interface IPokeAbility {
    shortDesc: string;
    id: string;
    name: string;
    num: number;
    desc?: string;
}

export interface IPokeItem {
    id: string;
    name: string;
    desc: string;
    gen: number;
    num: number;
    shortDesc?: string;
}

export interface IPokeMove {
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
}

export interface IPokeAbilityAliases extends IPokeAlias {
    ability: string;
}

export interface IPokeTierAliases extends IPokeAlias {
    tier: string;
}

export interface IPokeDexAliases extends IPokeAlias {
    name: string;
}

export interface IPokeItemAliases extends IPokeAlias {
    item: string;
}

export interface IPokeMoveAliases extends IPokeAlias {
    move: string;
}

export interface ITCGProps {
    name: string;
    types: string;
    subtype: string;
    supertype?: string;
    hp: string;
}

export interface IPokeTypeData {
    doubleEffectiveTypes: string[];
    doubleResistedTypes: string[];
    effectiveTypes: string[];
    effectlessTypes: string[];
    multi: PokeTypesType;
    normalTypes: string[];
    resistedTypes: string[];
}

export interface IDefineWord {
    language: string;
    text: string;
}

export interface ISteamGenre {
    description: string;
    id: string;
}

export interface IUrbanDefinition {
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
}

export interface IOverwatchHeroMapped {
    hero: string;
    time: number;
}

export interface ICopyPastaListObject {
    id: number;
    name: string;
    content: string;
}

export interface ITimerListRow {
    id: number;
    interval: number;
    channel: Snowflake;
    content: string;
    lastsend: string;
    members: string;
}

export interface IFortniteStatsRow {
    key: string;
    value: string;
}

export interface ICountdownListRow {
    id: number;
    channel: string;
    content: string;
    datetime: string;
    lastsend: string;
    tag: string;
}

export interface IFlavorJson {
    [propName: string]: IFlavorTextEntity[];
}

export interface IFormatsJson {
    [propName: string]: string;
}

export interface IIGDBProp {
    id: number;
    name?: string;
}

export interface IIGDBInvolvedCompany extends IIGDBProp {
    id: number;
    company: IIGDBProp;
    developer: boolean;
}

export interface IIGDBAgeRating extends IIGDBProp {
    category: number;
    rating: number;
}

export interface IDiscordGameSku {
    distributor: string;
    sku: string;
}

export interface IDiscordGame {
    description: string;
    developers: string[];
    distributor_applications: IDiscordGameSku[];
    executables: IDiscordGameExecutable[];
    icon: string;
    id: string;
    name: string;
    publishers: string[];
    splash: string;
    summary: string;
    third_party_skus: IDiscordGameSku[];
}

export interface IDiscordGameParsed {
    id: string;
    icon: string;
    name?: string;
    store_link?: string;
    developers?: string[];
    publishers?: string[];
    summary?: string;
    price?: string;
    thumbnail?: string;
}

export interface IDiscordStoreGameData {
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
}

export interface IFrontlineGirl {
    url: string;
    num: number;
    name: string;
    type: string;
    rating: number;
    constStats: IFrontLineGirlConstantStats;
    baseStats: IFrontlineGirlStats;
    maxStats: IFrontlineGirlStats;
    ability: IFrontLineGirlAbility;
    tile_bonus: string;
    bonus_desc: string;
    img: string;
    production: {
        stage?: string;
        reward?: string;
        timer?: string;
        placebo: boolean;
        normal: IFrontLineGirlProductionRequirements;
        heavy: IFrontLineGirlProductionRequirements;
    };
}

export type UnionPokeAlias = IPokeAbility & IPokeAbilityAliases;
export type UnionPokeDex = IPokeDex & IPokeDexAliases;
export type UnionPokeItem = IPokeItem & IPokeItemAliases;
export type UnionPokeMove = IPokeMove & IPokeMoveAliases;
export type EmbedFieldSimple = { name: string, value: string };