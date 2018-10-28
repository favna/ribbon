/**
 * @file Ribbon Automod - Automod module for Ribbon
 * @author Jeroen Claassens (favna) <sharkie.jeroen@gmail.com>
 * @copyright © 2017-2018 Favna  
 */

/* eslint-disable one-var */
import levenshtein from 'fast-levenshtein';
import moment from 'moment';
import {countCaps, countEmojis, countMentions, numberBetween} from './util';

export const badwords = (msg, words, client) => {
  if (msg.author.bot || client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  if (words.some(v => msg.content.indexOf(v) >= 0)) {
    return true;
  }

  return false;
};

export const duptext = (msg, within, equals, distance, client) => {
  if (msg.author.bot || client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  const authorMessages = msg.channel.messages.filter((m) => {
    const diff = moment.duration(moment(m.createdTimestamp).diff());

    if (numberBetween(diff.asMinutes(), within * -1, 0, true) && m.author.id === msg.author.id) {
      return m;
    }

    return false;
  });

  if (authorMessages.size <= equals) {
    return false;
  }

  const msgArray = authorMessages.array();

  msgArray.sort((x, y) => y.createdTimestamp - x.createdTimestamp);

  const levdist = levenshtein.get(msgArray[0].cleanContent, msgArray[1].cleanContent);

  if (levdist <= distance) {
    return true;
  }

  return false;
};

export const caps = (msg, threshold, minlength, client) => {
  if (msg.author.bot || client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  if (msg.cleanContent.length >= minlength) {
    if (countCaps(msg.content, msg.cleanContent) >= threshold) {
      return true;
    }
  }

  return false;
};

export const emojis = (msg, threshold, minlength, client) => {
  if (msg.author.bot || client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  if (msg.cleanContent.length >= minlength) {
    if (countEmojis(msg.content) >= threshold) {
      return true;
    }
  }

  return false;
};

export const mentions = (msg, threshold, client) => {
  if (msg.author.bot || client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  if (countMentions(msg.content) >= threshold) {
    return true;
  }

  return false;
};

export const links = (msg, client) => {
  if (msg.author.bot || client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  if ((/https?:\/\/(?!discordapp\.com|discord.gg)[^\s]+/gim).test(msg.content)) {
    return true;
  }

  return false;
};

export const invites = (msg, client) => {
  if (msg.author.bot || client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  if ((/(?:discord\.gg|discordapp.com\/invite)/gim).test(msg.content)) {
    return true;
  }

  return false;
};

export const slowmode = (msg, within, client) => {
  if (msg.author.bot || client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  const authorMessages = msg.channel.messages.filter((m) => {
    const diff = moment.duration(moment(m.createdTimestamp).diff());

    if (numberBetween(diff.asSeconds(), within * -1, 0, true) && m.author.id === msg.author.id) {
      return m;
    }

    return false;
  });

  const msgArray = authorMessages.array();

  if (msgArray.length) {
    const diff = moment.duration(moment(msgArray[0].createdAt).diff());

    if (diff.asSeconds() <= within) {
      return true;
    }
  }

  return false;
};