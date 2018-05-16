/**
 * @file Ribbon Automod - Automod module for Ribbon
 * @author Jeroen Claassens (favna) <sharkie.jeroen@gmail.com>
 * @copyright © 2017-2018 Favna  
 *  
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, version 3 of the License  
 *  
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.  
 *  
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http:www.gnu.org/licenses/>.  
 *  
 *   Additional Terms 7.b and 7.c of GPLv3 apply to this file:  
 *       * Requiring preservation of specified reasonable legal notices or
 *         author attributions in that material or in the Appropriate Legal
 *         Notices displayed by works containing it.  
 *       * Prohibiting misrepresentation of the origin of that material,
 *         or requiring that modified versions of such material be marked in
 *         reasonable ways as different from the original version.  
 */

/* eslint-disable one-var */
const levenshtein = require('fast-levenshtein'),
  moment = require('moment'),
  path = require('path'),
  {numberBetween, countCaps, countEmojis, countMentions} = require(path.join(__dirname, 'util.js'));

const badwords = function (msg, words, client) {
  if (msg.author.bot || client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  if (words.some(v => msg.content.indexOf(v) >= 0)) {
    return true;
  }

  return false;
};

const duptext = function (msg, within, equals, distance, client) {
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

const caps = function (msg, threshold, minlength, client) {
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

const emojis = function (msg, threshold, minlength, client) {
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

const mentions = function (msg, threshold, client) {
  if (msg.author.bot || client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  if (countMentions(msg.content) >= threshold) {
    return true;
  }

  return false;
};

const links = function (msg, client) {
  if (msg.author.bot || client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  if (/https?:\/\/(?!discordapp\.com|discord.gg)[^\s]+/gim.test(msg.content)) {
    return true;
  }

  return false;
};

const invites = function (msg, client) {
  if (msg.author.bot || client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  if (/(?:discord\.gg|discordapp.com\/invite)/gim.test(msg.content)) {
    return true;
  }

  return false;
};

const slowmode = function (msg, within, client) {
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

module.exports = {
  badwords,
  caps,
  duptext,
  emojis,
  invites,
  links,
  mentions,
  slowmode
};