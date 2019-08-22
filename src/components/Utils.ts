/* eslint-disable multiline-comment-style, capitalized-comments, line-comment-position*/
import { GuildMember, MessageEmbed, PermissionString, TextChannel, Util, Message, Guild, Channel } from 'discord.js';
import { oneLine, oneLineTrim } from 'common-tags';
import emojiRegex from 'emoji-regex';
import { YoutubeVideoType } from '../RibbonTypes';
import { diacriticsMap } from './Constants';
import { KlasaClient, KlasaMessage, KlasaGuild } from 'klasa';

/** Validation on whether this connection will be production or not */
export const prod = process.env.NODE_ENV === 'production';

/** Cleans an array of a given value */
export function removeNullAndUndefined<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

/** Transforms a message to Sentence case */
export const sentencecase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

/** Transforms a message to Title Case */
export const titlecase = (str: string) => str.toLowerCase().replace(/^([a-z]| [a-z]|-[a-z])/g, word => word.toUpperCase());

/** TypeGuard to distinguish TextChannel from Channel  */
export const isTextChannel = (channel: Channel | TextChannel): channel is TextChannel => {
  return (channel as TextChannel).topic !== undefined;
};

/** TypeGuard to distinguish string from object */
export const isString = (str: string | unknown): str is string => {
  return (str as string).length !== undefined && typeof str === 'string';
};

/** Helper function to count the amount of capital letters in a message */
export const countCaps = (stringToCheck: string, allowedLength: string): number => (stringToCheck.replace(/[^A-Z]/g, '').length / allowedLength.length) * 100;

/** Helper function to count the amount of emojis in a message */
export const countEmojis = (str: string) => {
  const customEmojis = /<a?:[\S]+:[0-9]{18}>/gim;
  const customMatch = str.match(customEmojis);
  const unicodeEmojis = emojiRegex();
  const unicodeMatch = str.match(unicodeEmojis);
  let counter = 0;

  if (unicodeMatch) counter += unicodeMatch.length;
  if (customMatch) counter += customMatch.length;

  return counter;
};

/** Helper function to count the amount of mentions in a message */
export const countMentions = (str: string) => {
  const mentions = /^<@![0-9]{18}>$/gim;
  const mentionsMatch = str.match(mentions);
  let counter = 0;

  if (mentionsMatch) counter += mentionsMatch.length;

  return counter;
};

/** Helper function to delete command messages */
export const deleteCommandMessages = (msg: KlasaMessage, client: KlasaClient) => {
  // if (msg.deletable && client.provider.get(msg.guild, 'deletecommandmessages', false)) msg.delete();
};

/** Helper function to log moderation commands */
export const logModMessage = async (
  msg: KlasaMessage, guild: KlasaGuild, outChannelID: string, outChannel: TextChannel, embed: MessageEmbed
) => {
  // if (!guild.settings.get('hasSentModLogMessage', false)) {
  //   msg.reply(oneLine`
  //           📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
  //           (or some other name configured by the ${guild.commandPrefix}setmodlogs command) and give me access to it.
  //           This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
  //   guild.settings.set('hasSentModLogMessage', true);
  // }

  // return outChannelID && guild.settings.get('modlogs', false)
  //   ? outChannel.send('', { embed })
  //   : null;
};

/** Helper function to validate if number (num) is between lower and upper boundaries */
export const isNumberBetween = (num: number, lower: number, upper: number, inclusive: boolean) => {
  const max = Math.max(lower, upper);
  const min = Math.min(lower, upper);

  return inclusive ? num >= min && num <= max : num > min && num < max;
};

/** Helper function to create the ordinal version of any number */
export const parseOrdinal = (num: number) => {
  const cent = num % 100;
  const dec = num % 10;

  if (cent >= 10 && cent <= 20) {
    return `${num}th`;
  }

  switch (dec) {
    case 1:
      return `${num}st`;
    case 2:
      return `${num}nd`;
    case 3:
      return `${num}rd`;
    default:
      return `${num}th`;
  }
};

/** Helper function to remove any diacritics (such as é and ê) from a message */
export const removeDiacritics = (input: string) => {
  let sentence = input;
  for (const diacritic of diacriticsMap) {
    sentence = input.replace(diacritic.letters, diacritic.base);
  }

  return sentence;
};

/** Helper function to properly round up or down a number */
export const roundNumber = (num: number, scale = 0) => {
  if (!num.toString().includes('e')) {
    return Number(`${Math.round(Number(`${num}e+${scale}`))}e-${scale}`);
  }
  const arr = `${num}`.split('e');
  let sig = '';

  if (Number(arr[1]) + scale > 0) {
    sig = '+';
  }

  return Number(`${Math.round(Number(`${Number(arr[0])}e${sig}${Number(arr[1]) + scale}`))}e-${scale}`);
};

/** Decorator function that checks if the bot client has the permissions to manage messages */
export const clientHasManageMessages = () => {
  return (target: unknown, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const fn: (...args: unknown[]) => unknown = descriptor.value;

    descriptor.value = async function value(msg: KlasaMessage, args: { hasManageMessages: boolean }, fromPattern: boolean) {
      const clientHasPermission = (msg.channel as TextChannel).permissionsFor(msg.client.user)!.has('MANAGE_MESSAGES');
      args.hasManageMessages = clientHasPermission;

      return fn.apply(this, [ msg, args, fromPattern ]);
    };
  };
};

/** Decorator function that checks if the user and the client have the required permissions */
export const shouldHavePermission = (permission: PermissionString, shouldClientHavePermission = false): MethodDecorator => {
  return (target: unknown, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    // const fn: (...args: unknown[]) => unknown = descriptor.value;

    // descriptor.value = async function value(msg: KlasaMessage, args: object, fromPattern: boolean) {
    //   const authorIsOwner = msg.client.isOwner(msg.author);
    //   const memberHasPermission = msg.member!.hasPermission(permission);

    //   if (!memberHasPermission && !authorIsOwner) {
    //     return msg.command.onBlock(msg, 'permission',
    //       { response: `You need the "${CommandoUtil.permissions[permission]}" permission to use the ${msg.command.name} command`});
    //   }

    //   if (shouldClientHavePermission) {
    //     const clientHasPermission = (msg.channel as TextChannel).permissionsFor(msg.client.user)!.has(permission);

    //     if (!clientHasPermission) {
    //       return msg.command.onBlock(msg, 'clientPermissions', { missing: [ permission ] });
    //     }
    //   }

    //   return fn.apply(this, [ msg, args, fromPattern ]);
    // };

    return descriptor;
  };
};

/** Song class used in music commands to track the song data */
export class Song {
  public name: string;
  public id: string;
  public length: number;
  public member: GuildMember;
  public playing: boolean;

  public constructor(video: YoutubeVideoType, member: GuildMember) {
    this.name = Util.escapeMarkdown(video.title);
    this.id = video.id;
    this.length = video.durationSeconds;
    this.member = member;
    this.playing = false;
  }

  public get url() {
    return `https://www.youtube.com/watch?v=${this.id}`;
  }

  public get thumbnail() {
    return `https://img.youtube.com/vi/${this.id}/mqdefault.jpg`;
  }

  public get username() {
    return Util.escapeMarkdown(`${this.member.user.tag} (${this.member.user.id})`);
  }

  public get avatar() {
    return `${this.member.user.displayAvatarURL({ format: 'png' })}`;
  }

  public get lengthString() {
    return Song.timeString(this.length);
  }

  public static timeString(seconds: number, forceHours = false) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return oneLineTrim`
     ${forceHours || hours >= 1 ? `${hours}:` : ''}
     ${hours >= 1 ? `0${minutes}`.slice(-2) : minutes}:
     ${`0${Math.floor(seconds % 60)}`.slice(-2)}
    `;
  }

  public timeLeft(currentTime: number) {
    return Song.timeString(this.length - currentTime);
  }

  public toString() {
    return `${this.name} (${this.lengthString})`;
  }
}