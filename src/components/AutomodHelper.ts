import { KlasaClient, KlasaMessage } from 'klasa';
import { Message } from 'discord.js';
import levenshtein from 'fast-levenshtein';
import moment from 'moment';
import { countCaps, countEmojis, countMentions, isNumberBetween } from './Utils';

export const badwords = (msg: KlasaMessage, words: string[], client: KlasaClient) => {
  if (msg.author!.bot || client.options.owners.includes(msg.author!.id) || msg.member!.hasPermission('MANAGE_MESSAGES') || !words || !words.length) {
    return false;
  }

  return words.some((word: string) => msg.content.includes(word));
};

export const duptext = (
  msg: KlasaMessage, within: number, equals: number, distance: number, client: KlasaClient
) => {
  if (msg.author!.bot || client.options.owners.includes(msg.author!.id) || msg.member!.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  const authorMessages = msg.channel.messages.filter((message: Message) => {
    const diff = moment.duration(moment(message.createdTimestamp).diff(moment()));

    return (
      isNumberBetween(diff.asMinutes(), within * -1, 0, true) &&
      message.author!.id === msg.author!.id
    );
  });

  if (authorMessages.size <= equals) {
    return false;
  }

  const msgArray = authorMessages.array();

  msgArray.sort((prevMsg: Message, nextMsg: Message) => nextMsg.createdTimestamp - prevMsg.createdTimestamp);

  const levdist = levenshtein.get(msgArray[0].cleanContent,
    msgArray[1].cleanContent);

  return levdist <= distance;
};

export const caps = (msg: KlasaMessage, threshold: number, minlength: number, client: KlasaClient) => {
  if (msg.author!.bot || client.options.owners.includes(msg.author!.id) || msg.member!.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  if (msg.cleanContent.length >= minlength) {
    if (countCaps(msg.content, msg.cleanContent) >= threshold) {
      return true;
    }
  }

  return false;
};

export const emojis = (msg: KlasaMessage, threshold: number, minlength: number, client: KlasaClient) => {
  if (msg.author!.bot || client.options.owners.includes(msg.author!.id) || msg.member!.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  if (msg.cleanContent.length >= minlength) {
    if (countEmojis(msg.content) >= threshold) {
      return true;
    }
  }

  return false;
};

export const mentions = (msg: KlasaMessage, threshold: number, client: KlasaClient) => {
  if (msg.author!.bot || client.options.owners.includes(msg.author!.id) || msg.member!.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }

  return countMentions(msg.content) >= threshold;
};

export const links = (msg: KlasaMessage, client: KlasaClient) => {
  if (msg.author!.bot || client.options.owners.includes(msg.author!.id) || msg.member!.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }

  return /https?:\/\/(?!discordapp\.com|discord.gg)[^\s]+/gim.test(msg.content);
};

export const invites = (msg: KlasaMessage, client: KlasaClient) => {
  if (msg.author!.bot || client.options.owners.includes(msg.author!.id) || msg.member!.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }

  return /(?:discord\.gg|discordapp.com\/invite)/gim.test(msg.content);
};

export const slowmode = (msg: KlasaMessage, within: number, client: KlasaClient) => {
  if (msg.author!.bot || client.options.owners.includes(msg.author!.id) || msg.member!.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  const authorMessages = msg.channel.messages.filter((message: Message) => {
    const diff = moment.duration(moment(message.createdTimestamp).diff(moment()));

    return (
      isNumberBetween(diff.asSeconds(), within * -1, 0, true) &&
      message.author!.id === msg.author!.id
    );
  });

  const msgArray = authorMessages.array();

  if (msgArray.length) {
    const diff = moment.duration(moment(msgArray[0].createdAt).diff(moment()));

    if (diff.asSeconds() <= within) {
      return true;
    }
  }

  return false;
};