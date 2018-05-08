/*
 *   This file is part of Ribbon
 *   Copyright (C) 2017-2018 Favna
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
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *   Additional Terms 7.b and 7.c of GPLv3 apply to this file:
 *       * Requiring preservation of specified reasonable legal notices or
 *         author attributions in that material or in the Appropriate Legal
 *         Notices displayed by works containing it.
 *       * Prohibiting misrepresentation of the origin of that material,
 *         or requiring that modified versions of such material be marked in
 *         reasonable ways as different from the original version.
 */

/**
 * @file Info DiscordBotsCommand - Gets the stats from a bot listed on DiscordBotList  
 * **Aliases**: `dbapi`, `db`
 * @module
 * @category info
 * @name discordbots
 * @example discordbots 376520643862331396
 * @param {string} BotID the user ID of the bot you want to get info about
 * @returns {MessageEmbed} Info about a bot
 */

const moment = require('moment'),
  request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class DiscordBotsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'discordbots',
      memberName: 'discordbots',
      group: 'info',
      aliases: ['dbapi', 'db'],
      description: 'Gets the stats from a Discord Bot on DiscordBotList',
      format: 'DiscordBotID',
      examples: ['discordbots 376520643862331396'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'bot',
          prompt: 'ID of the bot to get stats from?',
          type: 'string',
          default: '376520643862331396'
        }
      ]
    });
  }

  async run (msg, args) {
    startTyping(msg);
    const info = await request.get(`https://discordbots.org/api/bots/${args.bot}`)
        .set('Authorization', process.env.discordbotskey),
      infoEmbed = new MessageEmbed();

    if (info) {
      const botinfo = JSON.parse(info.text);

      infoEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setTitle(`Discord Bots Info for ${botinfo.username}#${botinfo.discriminator} (${botinfo.clientid})`)
        .setURL(`https://discordbots.org/bot/${botinfo.clientid}`)
        .setThumbnail(`https://images.discordapp.net/avatars/${botinfo.clientid}/${botinfo.avatar}.png`)
        .setDescription(botinfo.shortdesc)
        .setFooter(`${botinfo.username}#${botinfo.discriminator} was submitted`)
        .setTimestamp(moment(botinfo.date)._d)
        .addField('Default Prefix', botinfo.prefix, true)
        .addField('Library', botinfo.lib, true)
        .addField('Server Count', botinfo.server_count, true) // eslint-disable-line camelcase
        .addField('Shards Count', botinfo.shards.length, true)
        .addField('Invite Link', `[Click Here](${botinfo.invite})`);


      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(infoEmbed, `https://discordbots.org/bot/${botinfo.clientid}`);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply('an error occurred getting info from that bot, are you sure it exists on the website?');
  }
};