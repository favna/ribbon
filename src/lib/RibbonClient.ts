/* eslint-disable multiline-comment-style, capitalized-comments, line-comment-position*/
import { Collection } from 'discord.js';
import { KlasaClient, KlasaClientOptions, KlasaUser, util } from 'klasa';
import './extensions/RibbonGuild';
import { CLIENT_OPTIONS } from './utils/Constants';
import { enumerable } from './utils/Utils';

export class RibbonClient extends KlasaClient {
  @enumerable(false)
  public usertags: Collection<string, string> = new Collection();

  public constructor(options: KlasaClientOptions = {}) {
    super(util.mergeDefault(CLIENT_OPTIONS, options));
  }

  public async fetchTag(id: string) {
    // Return from cache if exists
    const cache = this.usertags.get(id);
    if (cache) return cache;

    // Fetch the user and set to cache
    const user = await this.users.fetch(id);
    this.usertags.set(user.id, user.tag);

    return user.tag;
  }

  public async fetchUsername(id: string) {
    const tag = await this.fetchTag(id);

    return tag.slice(0, tag.indexOf('#'));
  }

  public async fetchUser(id: string) {
    // Return from cache if it exists
    const cache = this.users.get(id);
    if (cache) return cache;

    // Fetch the user and set to cache
    const user = await this.users.fetch(id);
    this.users.set(user.id, user);

    return user;
  }
}

// Setup Klasa settings schema
RibbonClient.defaultGuildSchema
  .add('deleteCommand', 'boolean', { default: false, configurable: true })
  .add('unknownMessages', 'boolean', { default: true, configurable: true })
  .add('saydata', saydatafolder => saydatafolder
    .add('argString', 'string', { default: '', configurable: false })
    .add('authorID', 'string', { default: '', configurable: false })
    .add('authorTag', 'string', { default: '', configurable: true })
    .add('avatarURL', 'string', { default: '', configurable: true })
    .add('commandPrefix', 'string', { default: '', configurable: false })
    .add('memberHexColor', 'string', { default: '', configurable: false })
    .add('messageDate', 'string', { configurable: false })
    .add('attachment', 'string', { default: '', configurable: false })
  )
  .add('automod', automodFolder => automodFolder
    .add('badwords', badwordsfolder => badwordsfolder
      .add('enabled', 'boolean', { default: false, configurable: true })
      .add('words', 'string', { array: true, default: [ 'fuck' ], configurable: true })
    )
    .add('duptext', duptextfolder => duptextfolder
      .add('enabled', 'boolean', { default: false, configurable: true })
      .add('within', 'integer', { default: 3, configurable: true })
      .add('equals', 'integer', { default: 2, configurable: true })
      .add('distance', 'integer', { default: 20, configurable: true })
    )
    .add('caps', capsfolder => capsfolder
      .add('enabled', 'boolean', { default: false, configurable: true })
      .add('threshold', 'integer', { default: 60, configurable: true })
      .add('minLength', 'integer', { default: 10, configurable: true })
    )
    .add('emojis', capsfolder => capsfolder
      .add('enabled', 'boolean', { default: false, configurable: true })
      .add('threshold', 'integer', { default: 5, configurable: true })
      .add('minLength', 'integer', { default: 10, configurable: true })
    )
    .add('mentions', mentionsFolder => mentionsFolder
      .add('enabled', 'boolean', { default: false, configurable: true })
      .add('threshold', 'integer', { default: 5, configurable: true })
    )
    .add('links', 'boolean', { default: false, configurable: true })
    .add('invites', 'boolean', { default: false, configurable: true })
    .add('enabled', 'boolean', { default: false, configurable: true })
    .add('filterRoles', 'role', { array: true, default: [], configurable: true })
  )
  .add('casino', casinoFolder => casinoFolder
    .add('lowerLimit', 'integer', { default: 1, configurable: true })
    .add('upperLimit', 'integer', { default: 10000, configurable: true })
  )
  .add('moderation', moderationFolder => moderationFolder
    .add('announcementsChannel', 'textchannel', { configurable: true })
    .add('defaultRole', 'role', { configurable: true })
    .add('muteRole', 'role', { configurable: true })
    .add('selfRoles', 'role', { array: true, default: [], configurable: true })
    .add('unknownMessages', 'boolean', { default: true, configurable: true })
  )
  .add('automessages', autoMessagesFolder => autoMessagesFolder
    .add('joinmsgs', joinmsgsfolder => joinmsgsfolder
      .add('channel', 'textchannel', { configurable: true })
      .add('enabled', 'boolean', { default: false, configurable: true })
    )
    .add('leavemsgs', leavemsgsfolder => leavemsgsfolder
      .add('channel', 'textchannel', { configurable: true })
      .add('enabled', 'boolean', { default: false, configurable: true })
    )
  )
  .add('logging', loggingFolder => loggingFolder
    .add('memberlogs', memberlogsfolder => memberlogsfolder
      .add('channel', 'textchannel', { configurable: true })
      .add('enabled', 'boolean', { default: false, configurable: true })
    )
    .add('modlogs', modlogsfolder => modlogsfolder
      .add('channel', 'textchannel', { configurable: true })
      .add('enabled', 'boolean', { default: false, configurable: true })
    )
  )
  .add('music', musicFolder => musicFolder
    .add('defaultVolume', 'integer', { default: 3, configurable: true })
    .add('maxLength', 'integer', { default: 10, configurable: true })
    .add('maxSongs', 'integer', { default: 3, configurable: true })
  )
  .add('twitch', twitchFolder => twitchFolder
    .add('channel', 'textchannel', { configurable: true })
    .add('enabled', 'boolean', { configurable: true })
    .add('users', 'user', { array: true, default: [], configurable: true })
  );

export default RibbonClient;

declare module 'discord.js' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  export interface Client {
    // lavalink: Lavalink | null;
    usertags: Collection<string, string>;
    fetchTag(id: string): Promise<string>;
    fetchUsername(id: string): Promise<string>;
    fetchUser(id: string): Promise<KlasaUser>;
  }
}