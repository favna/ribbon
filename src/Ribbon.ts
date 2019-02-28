import { Client, Command, CommandoClient, CommandoGuild, CommandoMessage, SyncSQLiteProvider } from 'awesome-commando';
import { GuildMember, RateLimitData } from 'awesome-djs';
import Database from 'better-sqlite3';
import path from 'path';
import {
    handleCmdErr,
    handleDebug,
    handleErr,
    handleGuildJoin,
    handleGuildLeave,
    handleMemberJoin,
    handleMemberLeave,
    handleMsg,
    handlePresenceUpdate,
    handleRateLimit,
    handleReady,
    handleRejection,
    handleWarn,
} from './components';

export default class Ribbon {
    public token: string;
    public client: CommandoClient;

    constructor (token: string) {
        this.token = token;
        this.client = new Client({
            commandPrefix: '!',
            disabledEvents: [ 'CHANNEL_CREATE', 'CHANNEL_DELETE', 'CHANNEL_PINS_UPDATE',
                              'CHANNEL_UPDATE', 'GUILD_BAN_ADD', 'GUILD_BAN_REMOVE', 'GUILD_EMOJIS_UPDATE',
                              'GUILD_INTEGRATIONS_UPDATE', 'GUILD_MEMBER_UPDATE', 'GUILD_ROLE_CREATE',
                              'GUILD_ROLE_DELETE', 'GUILD_ROLE_UPDATE', 'MESSAGE_DELETE_BULK',
                              'MESSAGE_DELETE', 'MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE_ALL',
                              'MESSAGE_REACTION_REMOVE', 'TYPING_START', 'USER_UPDATE', 'WEBHOOKS_UPDATE'
            ],
            messageCacheLifetime: 10 * 60,
            messageSweepInterval: 8 * 60,
            owner: ['268792781713965056', '437280139353653249'],
            presence: {
                status: 'online',
                activity: {
                    name: '@Ribbon help',
                    type: 'WATCHING',
                },
            },
            typescript: true,
            ws: { compress: true },
        });
    }

    public init () {
        this.client
            .on('commandError', (cmd: Command, err: Error, msg: CommandoMessage) => handleCmdErr(this.client, cmd, err, msg))
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
            .on('warn', (warn: string) => handleWarn(this.client, warn));
        process.on('unhandledRejection', (reason: Error | any, p: Promise<any>) => handleRejection(this.client, reason, p));

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
                ['leaderboards', 'Leaderboards - View leaderboards from various games'],
                ['pokemon', 'Pokemon - Let Dexter answer your questions'],
                ['extra', 'Extra - Extra! Extra! Read All About It! Only Two Cents!'],
                ['weeb', 'Weeb - Hugs, Kisses, Slaps and all with weeb animu gifs'],
                ['moderation', 'Moderation - Moderate with no effort'],
                ['automod', 'Automod - Let Ribbon moderate the chat for you'],
                ['streamwatch', 'Streamwatch - Spy on members and get notified when they go live'],
                ['custom', 'Custom - Server specific commands'],
                ['nsfw', 'NSFW - For all you dirty minds ( ͡° ͜ʖ ͡°)'],
                ['owner', 'Owner - Exclusive to the bot owner(s)']
            ])
            .registerDefaultCommands({
                help: true,
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
