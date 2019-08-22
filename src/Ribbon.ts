/* eslint-disable multiline-comment-style, capitalized-comments, line-comment-position*/
// import path from 'path';
import { Client, KlasaMessage, Command, KlasaGuild } from 'klasa';
import { prod } from './components/Utils';
import moment from 'moment';
import { handleCommandRun, handleDebug, handleErr, handleWarn, handleReady, handleRejection } from './components/EventsHelper';
// import { GuildMember, RateLimitData, DMChannel, GuildChannel } from 'discord.js';

export default class Ribbon {
  public token: string;
  public client: Client;

  public constructor(token: string) {
    this.token = token;
    this.client = new Client({
      commandEditing: true,
      commandLogging: !prod,
      console: { useColor: true },
      consoleEvents: {
        debug: !prod,
        verbose: !prod,
      },
      customPromptDefaults: {
        limit: 5,
        quotedStringSupport: true,
      },
      noPrefixDM: true,
      ownerID: '268792781713965056',
      production: prod,
      prefix: '.',
      readyMessage: client => `Client ready at ${moment().format('HH:mm:ss')}. Logged in as ${client.user!.tag} (${client.user!.id})`,
      typing: true,
    });
    // this.client = new CommandoClient({
    //   commandPrefix: '!',
    //   owner: [ '268792781713965056', '437280139353653249' ],
    //   botIds: [ '512150391471996930', '512152952908152833' ],
    //   invite: 'discord.gg/sguypX8',
    //   presence: {
    //     status: 'online',
    //     activity: {
    //       name: '@Ribbon help',
    //       type: 'WATCHING',
    //     },
    //   },
    //   typescript: true,
    //   disabledEvents: [
    //     'CHANNEL_PINS_UPDATE', 'CHANNEL_UPDATE', 'GUILD_BAN_ADD',
    //     'GUILD_BAN_REMOVE', 'GUILD_EMOJIS_UPDATE', 'GUILD_INTEGRATIONS_UPDATE',
    //     'GUILD_MEMBER_UPDATE', 'GUILD_ROLE_CREATE', 'GUILD_ROLE_DELETE',
    //     'GUILD_ROLE_UPDATE', 'MESSAGE_DELETE_BULK', 'MESSAGE_DELETE',
    //     'TYPING_START', 'WEBHOOKS_UPDATE', 'MESSAGE_REACTION_REMOVE_ALL', 'USER_UPDATE'
    //   ],
    //   ws: { compress: true },
    //   restTimeOffset: 800,
    //   messageCacheLifetime: 10 * 60,
    //   messageSweepInterval: 5 * 60,
    // });
  }

  public async init() {
    this.client
      // .on('commandError', (msg: KlasaMessage, cmd: Command, params: unknown[], err: Error): void => handleCmdErr(this.client, cmd, err, msg))
      // .on('commandInhibited', (msg: KlasaMessage, cmd: Command, response: string | Error): void => handleCommandInhibited(this.client, cmd, msg, response))
      .on('commandRun', (msg: KlasaMessage, cmd: Command): void => handleCommandRun(this.client, msg, cmd))
      // .on('commandUnknown', (msg: KlasaMessage, cmd: Command, prefix: RegExp, prefixLength: number): void => handleUnknownCommand(msg,cmd,prefix,prefixLength))
      // .on('channelCreate', (channel: DMChannel | GuildChannel): void => handleChannelCreate(this.client, channel))
      // .on('channelDelete', (channel: DMChannel | GuildChannel): void => handleChannelDelete(this.client, channel))
      .on('log', (info: string | object) => handleDebug(info))
      .on('verbose', (info: string | object) => handleDebug(info))
      .on('debug', (info: string) => handleDebug(info))
      .on('error', (err: Error) => handleErr(this.client, err))
      .on('wtf', (err: Error) => handleErr(this.client, err))
      // .on('guildCreate', async (guild: KlasaGuild) => handleGuildJoin(this.client, guild))
      // .on('guildDelete', (guild: KlasaGuild) => handleGuildLeave(this.client, guild))
      // .on('guildMemberAdd', (member: GuildMember) => handleMemberJoin(this.client, member))
      // .on('guildMemberRemove', (member: GuildMember) => handleMemberLeave(this.client, member))
      // .on('message', (message: KlasaMessage) => handleMsg(this.client, message))
      // .on('presenceUpdate', async (oldMember: GuildMember, newMember: GuildMember) => handlePresenceUpdate(this.client, oldMember, newMember))
      // .on('rateLimit', async (info: RateLimitData) => handleRateLimit(this.client, info))
      .on('warn', (warn: string) => handleWarn(this.client, warn))
      // .on('shardDisconnected', (event: CloseEvent, shard: number) => handleShardDisconnect(event, shard))
      // .on('shardError', (error: Error, shard: number) => handleShardError(error, shard))
      // .on('shardReady', (shard: number) => handleShardReady(shard))
      // .on('shardReconnecting', (shard: number) => handleShardReconnecting(shard))
      // .on('shardResumed', (shard: number, events: number) => handleShardResumed(shard, events))
      .once('ready', () => handleReady(this.client));
    process.on('unhandledRejection', (reason: Error | unknown, promise: Promise<unknown>) => handleRejection(reason, promise));

    // const database = await openDb(path.join(__dirname, 'data/databases/settings.sqlite'));

    // this.client.setProvider(new SQLiteProvider(database));

    // this.client.registry
    //   .registerDefaultTypes()
    //   .registerTypesIn({
    //     dirname: path.join(__dirname, 'components/commandoTypes'),
    //     filter: (fileName: string) => /^.+Type\.ts$/.test(fileName) ? fileName : undefined,
    //   })
    //   .registerDefaultGroups()
    //   .registerGroups([
    //     [ 'games', 'Games - Play some games' ],
    //     [ 'casino', 'Casino - Gain and gamble points' ],
    //     [ 'converters', 'Converters - Unit conversion on a new level' ],
    //     [ 'info', 'Info - Discord info at your fingertips' ],
    //     [ 'music', 'Music - Let the DJ out' ],
    //     [ 'searches', 'Searches - Browse the web and find results' ],
    //     [ 'docs', 'Docs - Find documentation for various sources' ],
    //     [ 'leaderboards', 'Leaderboards - View leaderboards from various games' ],
    //     [ 'pokemon', 'Pokemon - Let Dexter answer your questions' ],
    //     [ 'extra', 'Extra - Extra! Extra! Read All About It! Only Two Cents!' ],
    //     [ 'weeb', 'Weeb - Hugs, Kisses, Slaps and all with weeb animu gifs' ],
    //     [ 'moderation', 'Moderation - Moderate with no effort' ],
    //     [ 'automod', 'Automod - Let Ribbon moderate the chat for you' ],
    //     [ 'streamwatch', 'Streamwatch - Spy on members and get notified when they go live' ],
    //     [ 'nsfw', 'NSFW - For all you dirty minds ( ͡° ͜ʖ ͡°)' ],
    //     [ 'owner', 'Owner - Exclusive to the bot owner(s)' ]
    //   ])
    //   .registerDefaultCommands({
    //     help: false,
    //     prefix: true,
    //     eval: true,
    //     ping: true,
    //     commandState: true,
    //     unknownCommand: false,
    //   })
    //   .registerCommandsIn({
    //     dirname: path.join(__dirname, 'commands'),
    //     filter: (fileName: string) => /^.+\.ts$/.test(fileName) ? fileName : undefined,
    //   });

    return this.client.login(this.token);
  }
}