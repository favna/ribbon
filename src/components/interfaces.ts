import { GuildChannel, VoiceChannel } from 'discord.js';
import { Command } from 'discord.js-commando';
import { Song } from './util';

export interface IMusicCommand extends Command {
    queue: any;
    votes: any;
}

export interface IVote {
    count: number;
    users: Array<string>;
    queue: any;
    guild: string;
    start: number;
    timeout?: any;
}

export interface IQueue {
    textChannel: GuildChannel;
    voiceChannel: VoiceChannel;
    connection: any;
    songs: Array<Song>;
    volume: number;
}

export interface IPokeData {
    abilities?: string;
    evos?: string;
    flavors?: string;
    genders?: string;
    sprite: string;
    tier?: string;
    entries?: Array<any>;
}

export interface IGenre {
    name: string;
}
