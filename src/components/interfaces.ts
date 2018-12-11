import { GuildChannel, Snowflake, VoiceChannel, VoiceConnection } from 'discord.js';
import { Command } from 'discord.js-commando';
import { Song } from './util';

interface IPokeGenderRatio {
    M: number;
    F: number;
}

interface IPokeStats {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;

    [propName: string]: string | number | undefined;
}

interface IPokeAbilities {
    0: string;
    1?: string;
    H?: string;

    [propName: string]: string | number | undefined;
}

interface IFlavorTextEntities {
    version_id: string;
    flavor_text: string;
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

export interface IQueue {
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

export interface IGenre {
    name: string;
}

export interface ICasinoRowType {
    userID: string;
    balance: number;
    lasttopup: string;
}

export interface IPoke {
    num: number;
    name: string;
    species: string;
    baseForme?: string;
    baseSpecies?: string;
    forme?: string;
    formeLetter?: string;
    types: string[];
    gender?: string;
    genderRatio?: IPokeGenderRatio;
    baseStats: IPokeStats;
    abilities: IPokeAbilities;
    heightm: number;
    weightkg: number;
    color: string;
    prevo?: string;
    evos?: string[];
    evoLevel?: number;
    eggGroups?: string[];
    otherFormes?: string[];
}

export interface IPokeAliases {
    alias: string;
    tier?: string;
    item?: string;
    ability?: string;
    name?: string;
    move?: string;
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
    [propName: string]: IFlavorTextEntities[];
}

export interface IFormatsJson {
    [propName: string]: string;
}