/* eslint-disable multiline-comment-style, capitalized-comments, line-comment-position*/
import { KlasaClient, KlasaClientOptions } from 'klasa';
import moment from 'moment';
import { prod } from './components/Utils';

export default class Ribbon extends KlasaClient {
  public token: string;

  public constructor(token: string, options?: KlasaClientOptions) {
    super({
      ...options,
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
      prefix: '.',
      readyMessage: client => `Client ready at ${moment().format('HH:mm:ss')}. Logged in as ${client.user!.tag} (${client.user!.id})`,
      typing: true,
      providers: { default: 'firestore' },
      presence: {
        status: 'online',
        activity: {
          name: '@Ribbon help',
          type: 'WATCHING',
        },
      },
      disabledEvents: [
        'CHANNEL_PINS_UPDATE', 'CHANNEL_UPDATE', 'GUILD_BAN_ADD',
        'GUILD_BAN_REMOVE', 'GUILD_EMOJIS_UPDATE', 'GUILD_INTEGRATIONS_UPDATE',
        'GUILD_MEMBER_UPDATE', 'GUILD_ROLE_CREATE', 'GUILD_ROLE_DELETE',
        'GUILD_ROLE_UPDATE', 'MESSAGE_DELETE_BULK', 'MESSAGE_DELETE',
        'TYPING_START', 'WEBHOOKS_UPDATE', 'MESSAGE_REACTION_REMOVE_ALL', 'USER_UPDATE'
      ],
      ws: { compress: true },
      restTimeOffset: 800,
      messageCacheLifetime: 10 * 60,
      messageSweepInterval: 5 * 60,
    });
    this.token = token;
  }

  public async init() {
    // .on('commandUnknown', (msg: KlasaMessage, cmd: Command, prefix: RegExp, prefixLength: number): void => handleUnknownCommand(msg,cmd,prefix,prefixLength))
    // .on('channelCreate', (channel: DMChannel | GuildChannel): void => handleChannelCreate(this.client, channel))
    // .on('channelDelete', (channel: DMChannel | GuildChannel): void => handleChannelDelete(this.client, channel))
    // .on('guildCreate', async (guild: KlasaGuild) => handleGuildJoin(this.client, guild))
    // .on('guildDelete', (guild: KlasaGuild) => handleGuildLeave(this.client, guild))
    // .on('guildMemberAdd', (member: GuildMember) => handleMemberJoin(this.client, member))
    // .on('guildMemberRemove', (member: GuildMember) => handleMemberLeave(this.client, member))
    // .on('presenceUpdate', async (oldMember: GuildMember, newMember: GuildMember) => handlePresenceUpdate(this.client, oldMember, newMember))

    return this.login(this.token);
  }
}