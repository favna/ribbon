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
 * @file Info ServerInfoCommand - Gets information about the current server  
 * **Aliases**: `serverinfo`, `sinfo`
 * @module
 * @category info
 * @name server
 * @returns {MessageEmbed} Info about the server
 */

const moment = require('moment'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class ServerInfoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'server',
      memberName: 'server',
      group: 'info',
      aliases: ['serverinfo', 'sinfo'],
      description: 'Gets information about the server.',
      examples: ['server'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  contentFilter (filter) {
    switch (filter) {
    case 0:
      return 'Content filter disabled';
    case 1:
      return 'Scan messages of members without a role';
    case 2:
      return 'Scan messages sent by all members';
    default:
      return 'Content Filter unknown';
    }
  }

  verificationFilter (filter) {
    switch (filter) {
    case 0:
      return 'None - unrestricted';
    case 1:
      return 'Low - must have verified email on account';
    case 2:
      return 'Medium - must be registered on Discord for longer than 5 minutes';
    case 3:
      return 'High - 	(╯°□°）╯︵ ┻━┻ - must be a member of the server for longer than 10 minutes';
    case 4:
      return 'Very High - ┻━┻ミヽ(ಠ益ಠ)ﾉ彡┻━┻ - must have a verified phone number';
    default:
      return 'Verification Filter unknown';
    }
  }

  run (msg, args) {
    startTyping(msg);
    if (msg.channel.type !== 'text' && args.server === 'current') {
      stopTyping(msg);

      return msg.reply('an argument of server name (partial or full) or server ID is required when talking outside of a server');
    }

    const channels = msg.guild.channels.map(ty => ty.type), // eslint-disable-line sort-vars
      presences = msg.guild.presences.map(st => st.status),
      serverEmbed = new MessageEmbed();

    let guildChannels = 0,
      onlineMembers = 0;

    for (const i in presences) {
      if (presences[i] !== 'offline') {
        onlineMembers += 1;
      }
    }
    for (const i in channels) {
      if (channels[i] === 'text') {
        guildChannels += 1;
      }
    }

    serverEmbed
      .setColor(msg.guild.owner ? msg.guild.owner.displayHexColor : '#7CFC00')
      .setAuthor('Server Info', 'https://favna.xyz/images/ribbonhost/discordlogo.png')
      .setThumbnail(msg.guild.iconURL({format: 'png'}))
      .setFooter(`Server ID: ${msg.guild.id}`)
      .addField('Server Name', msg.guild.name, true)
      .addField('Owner', msg.guild.owner ? msg.guild.owner.user.tag : 'Owner is MIA', true)
      .addField('Members', msg.guild.memberCount, true)
      .addField('Currently Online', onlineMembers, true)
      .addField('Region', msg.guild.region, true)
      .addField('Highest Role', msg.guild.roles.sort((a, b) => a.position - b.position || a.id - b.id).last().name, true)
      .addField('Number of emojis', msg.guild.emojis.size, true)
      .addField('Number of roles', msg.guild.roles.size, true)
      .addField('Number of channels', guildChannels, true)
      .addField('Created At', moment(msg.guild.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z'), false)
      .addField('Verification Level', this.verificationFilter(msg.guild.verificationLevel), false)
      .addField('Explicit Content Filter', this.contentFilter(msg.guild.explicitContentFilter), false);

    msg.guild.splashURL() !== null ? serverEmbed.setImage(msg.guild.splashURL()) : null;

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(serverEmbed);
  }
};