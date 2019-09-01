/* eslint-disable multiline-comment-style, capitalized-comments, line-comment-position*/
import { KlasaClient, KlasaClientOptions, PermissionLevels } from 'klasa';
import moment from 'moment';
import { prod } from './components/Utils';
import { DATABASE_PRODUCTION, DATABASE_DEVELOPMENT } from './components/Constants';

export class Ribbon extends KlasaClient {
  public constructor(options?: KlasaClientOptions) {
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
      prefix: prod ? '!' : '.',
      typing: true,
      permissionLevels: new PermissionLevels()
        .add(0, () => true)
        .add(1, ({ guild, member }) => guild! && member!.permissions.has('MANAGE_NICKNAMES'), { fetch: true })
        .add(2, ({ guild, member }) => guild! && member!.permissions.has('MANAGE_MESSAGES'), { fetch: true })
        .add(3, ({ guild, member }) => guild! && member!.permissions.has('MANAGE_ROLES'), { fetch: true })
        .add(4, ({ guild, member }) => guild! && member!.permissions.has('KICK_MEMBERS'), { fetch: true })
        .add(5, ({ guild, member }) => guild! && member!.permissions.has('BAN_MEMBERS'), { fetch: true })
        .add(6, ({ guild, member }) => guild! && member!.permissions.has('MANAGE_GUILD'), { fetch: true })
        .add(7, ({ guild, member }) => guild! && member!.permissions.has('ADMINISTRATOR'), { fetch: true })
        .add(8, ({ guild, member }) => guild! && member === guild!.owner, { fetch: true })
        .add(9, ({ author, client }) => client.owners.has(author!), { break: true })
        .add(10, ({ author, client }) => client.owners.has(author!)),
      pieceDefaults: {
        commands: {
          deletable: true,
          quotedStringSupport: true,
        },
      },
      providers: {
        default: 'rethinkdb',
        rethinkdb: prod ? DATABASE_PRODUCTION : DATABASE_DEVELOPMENT,
      },
      presence: {
        status: 'online',
        activity: {
          name: '@Ribbon help',
          type: 'WATCHING',
        },
      },
      readyMessage: client => `Client ready at ${moment().format('HH:mm:ss')}. Logged in as ${client.user!.tag} (${client.user!.id})`,
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
      schedule: { interval: 5000 },
    });
  }
}

export const ribbon = (token: string, options?: KlasaClientOptions) => new Ribbon(options).login(token);
export default ribbon;