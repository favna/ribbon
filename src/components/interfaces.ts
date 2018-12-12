import { GuildChannel, Snowflake, VoiceChannel, VoiceConnection } from 'discord.js';
import { Command } from 'discord.js-commando';
import { Song } from './util';

interface IPokeGenderProp {
    M: number;
    F: number;
}

interface IPokeStatProp {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;

    [propName: string]: string | number | undefined;
}

interface IPokeAbilityProp {
    0: string;
    1?: string;
    H?: string;

    [propName: string]: string | number | undefined;
}

interface IFlavorTextEntity {
    version_id: string;
    flavor_text: string;
}

interface IPokeAlias {
    alias: string;
}

export interface IMusicCommand extends Command {
    queue: any;
    votes: any;
}

export interface IVote {
    count: number;
    users: string[];
    queue: any;
    guild: string;
    start: number;
    timeout?: any;
}

export interface ISongQueue {
    textChannel: GuildChannel;
    voiceChannel: VoiceChannel;
    connection: VoiceConnection;
    songs: Song[];
    volume: number;
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
    lasttopup: string;
}

export interface IPokeDex {
    num: number;
    species: string;
    types: string[];
    genderRatio?: IPokeGenderProp;
    baseStats: IPokeStatProp;
    abilities: IPokeAbilityProp;
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

export type UnionPokeAlias = IPokeAbility & IPokeAbilityAliases;
export type UnionPokeDex = IPokeDex & IPokeDexAliases;
export type UnionPokeItem = IPokeItem & IPokeItemAliases;
export type UnionPokeMove = IPokeMove & IPokeMoveAliases;