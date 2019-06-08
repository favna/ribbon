import { Command, CommandoClient, CommandoGuild, CommandoMessage, SyncSQLiteProvider } from 'awesome-commando';
import { DMChannel, GuildChannel, GuildMember, RateLimitData } from 'awesome-djs';
import Database from 'better-sqlite3';
import path from 'path';
import {
    handleChannelCreate, handleChannelDelete, handleCmdErr, handleCommandRun, handleDebug,
    handleErr, handleGuildJoin, handleGuildLeave, handleMemberJoin, handleMemberLeave,
    handleMsg, handlePresenceUpdate, handleRateLimit, handleReady, handleRejection,
    handleShardDisconnect, handleShardError, handleShardReady, handleShardReconnecting,
    handleShardResumed, handleWarn
} from './components/EventsHelper';

export default class Ribbon {
    public token: string;
    public client: CommandoClient;

    constructor (token: string) {
        this.token = token;
        this.client = new CommandoClient({
            commandPrefix: '!',
            owner: ['268792781713965056', '437280139353653249'],
            invite: 'discord.gg/sguypX8',
            presence: {
                status: 'online',
                activity: {
                    name: '@Ribbon help',
                    type: 'WATCHING',
                },
            },
            typescript: true,
            userid: ['512150391471996930', '512152952908152833'],
        });
    }

    public init () {
        this.client
            .on('commandError', (cmd: Command, err: Error, msg: CommandoMessage) => handleCmdErr(this.client, cmd, err, msg))
            .on('commandRun', (cmd: Command, promise: Promise<any>, message: CommandoMessage) => handleCommandRun(this.client, cmd, message))
            .on('channelCreate', (channel: DMChannel | GuildChannel) => handleChannelCreate(this.client, channel))
            .on('channelDelete', (channel: DMChannel | GuildChannel) => handleChannelDelete(this.client, channel))
            .on('debug', (info: string) => handleDebug(info))
            .on('error', (err: Error) => handleErr(this.client, err))
            .on('guildCreate', (guild: CommandoGuild) => handleGuildJoin(this.client, guild))
            .on('guildDelete', (guild: CommandoGuild) => handleGuildLeave(this.client, guild))
            .on('guildMemberAdd', (member: GuildMember) => handleMemberJoin(this.client, member))
            .on('guildMemberRemove', (member: GuildMember) => handleMemberLeave(this.client, member))
            .on('message', (message: CommandoMessage) => handleMsg(this.client, message))
            .on('presenceUpdate', (oldMember: GuildMember, newMember: GuildMember) => handlePresenceUpdate(this.client, oldMember, newMember))
            .on('rateLimit', (info: RateLimitData) => handleRateLimit(this.client, info))
            .on('ready', () => handleReady(this.client))
            .on('warn', (warn: string) => handleWarn(this.client, warn))
            .on('shardDisconnected', (event: CloseEvent, shard: number) => handleShardDisconnect(event, shard))
            .on('shardError', (error: Error, shard: number) => handleShardError(error, shard))
            .on('shardReady', (shard: number) => handleShardReady(shard))
            .on('shardReconnecting', (shard: number) => handleShardReconnecting(shard))
            .on('shardResumed', (shard: number, events: number) => handleShardResumed(shard, events));
        process.on('unhandledRejection', (reason: Error | any, p: Promise<any>) => handleRejection(reason, p));

        const db = new Database(path.join(__dirname, 'data/databases/settings.sqlite3'));

        this.client.setProvider(new SyncSQLiteProvider(db));

        this.client.registry
            .registerDefaultTypes()
            .registerTypesIn({
                dirname: path.join(__dirname, 'components/commandoTypes'),
                filter: (fileName: string) => /^.+Type\.ts$/.test(fileName) ? fileName : undefined,
            })
            .registerDefaultGroups()
            .registerGroups([
                ['games', 'Games - Play some games'],
                ['casino', 'Casino - Gain and gamble points'],
                ['converters', 'Converters - Unit conversion on a new level'],
                ['info', 'Info - Discord info at your fingertips'],
                ['music', 'Music - Let the DJ out'],
                ['searches', 'Searches - Browse the web and find results'],
                ['docs', 'Docs - Find documentation for various sources'],
                ['leaderboards', 'Leaderboards - View leaderboards from various games'],
                ['pokemon', 'Pokemon - Let Dexter answer your questions'],
                ['extra', 'Extra - Extra! Extra! Read All About It! Only Two Cents!'],
                ['weeb', 'Weeb - Hugs, Kisses, Slaps and all with weeb animu gifs'],
                ['moderation', 'Moderation - Moderate with no effort'],
                ['automod', 'Automod - Let Ribbon moderate the chat for you'],
                ['streamwatch', 'Streamwatch - Spy on members and get notified when they go live'],
                ['nsfw', 'NSFW - For all you dirty minds ( ͡° ͜ʖ ͡°)'],
                ['owner', 'Owner - Exclusive to the bot owner(s)']
            ])
            .registerDefaultCommands({
                help: false,
                prefix: true,
                eval: true,
                ping: true,
                commandState: true,
                unknownCommand: false,
            })
            .registerCommandsIn({
                dirname: path.join(__dirname, 'commands'),
                filter: (fileName: string) => /^.+\.ts$/.test(fileName) ? fileName : undefined,
            });

        return this.client.login(this.token);
    }
}
