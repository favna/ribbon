/* eslint-disable multiline-comment-style, capitalized-comments, line-comment-position*/
import { oneLineTrim } from 'common-tags';
import { BitFieldResolvable, Channel, Constructor, GuildMember, MessageEmbed, PermissionString, TextChannel, Util } from 'discord.js';
import emojiRegex from 'emoji-regex';
import { KlasaMessage, Piece, PieceOptions, Store } from 'klasa';
import { YoutubeVideoType } from '../typings/Music';
import { GuildSettings } from '../typings/settings/GuildSettings';
import { diacriticsMap } from './Constants';

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
  return channel.type === 'text' && channel instanceof TextChannel;
};

/** TypeGuard to ensure param is string */
export const isString = (str: string | unknown): str is string => {
  return typeof str === 'string';
};

/** TypeGuard to ensure param is number */
export const isNumber = (num: string | unknown): num is number => {
  return (num as number).valueOf() !== undefined && typeof num === 'number';
};

export const isArray = (arr: unknown[] | unknown): arr is unknown[] => {
  return Array.isArray(arr);
};

export const isNumbers = (array: number[] | string[] | (string | number)[]): array is number[] => {
  return array.every(val => typeof val === 'number');
};

export const isStrings = (array: number[] | string[] | (string | number)[]): array is number[] => {
  return array.every(val => typeof val === 'string');
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

/** Logs moderation commands */
export const logModMessage = async (msg: KlasaMessage, embed: MessageEmbed) => {
  if (msg.guildSettings.get(GuildSettings.loggingModlogsEnabled)) {
    let modLogChannel = msg.guildSettings.get(GuildSettings.loggingModlogsChannel) as GuildSettings.loggingModlogs['channel'] | null;
    if (!modLogChannel) modLogChannel = msg.guild!.channels.find(channel => channel.name === 'mod-logs' || channel.name === 'modlogs') as TextChannel | null;

    if (modLogChannel) {
      modLogChannel.send('', embed);
    }
  }
};

/** Validates if number (num) is between lower and upper boundaries */
export const isNumberBetween = (num: number, lower: number, upper: number, inclusive: boolean) => {
  const max = Math.max(lower, upper);
  const min = Math.min(lower, upper);

  return inclusive ? num >= min && num <= max : num > min && num < max;
};

/** Creates the ordinal version of any number */
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

/** Remove any diacritics (such as é and ê) from a string and replaces them with their non-diacritic counterparts */
export const removeDiacritics = (input: string) => {
  let sentence = input;
  for (const diacritic of diacriticsMap) {
    sentence = input.replace(diacritic.letters, diacritic.base);
  }

  return sentence;
};

/** Properly rounds up or down a number */
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

function createClassDecorator(fn: Function): Function {
  return fn;
}

/** Decorator function that applies given options to any Klasa piece */
export function ApplyOptions<T extends PieceOptions>(options: T): Function {
  return createClassDecorator((target: Constructor<Piece>) => class extends target {
    public constructor(store: Store<string, Piece, typeof Piece>, file: string[], directory: string) {
      super(store, file, directory, options);
    }
  });
}

export const clientHasPermission = (permission: BitFieldResolvable<PermissionString>): MethodDecorator => {
  return (target: unknown, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const fn: (...args: unknown[]) => unknown = descriptor.value;

    descriptor.value = async function value(msg: KlasaMessage, ...params: unknown[][]) {
      let hasPermission: boolean;

      if (!msg.guild || !msg.guild.me) hasPermission = false;
      else hasPermission = msg.guild.me.permissions.has(permission);

      params[0].push(hasPermission);

      return fn.apply(this, [ msg, ...params ]);
    };
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