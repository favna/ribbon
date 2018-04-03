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
 * @file Moderation WarnCommand - Gives a member warning points  
 * Please note that the bot will not auto ban when the member has a certain amount of points!
 * **Aliases**: `warning`
 * @author Jeroen Claassens (favna) <sharkie.jeroen@gmail.com>
 * @license GPL-3.0-or-later
 * @module
 * @category moderation
 * @name warn
 * @example warn Biscuit
 * @param {member} AnyMember The member to give warning points
 * @param {number} WarningPoints The amount of warning points to give
 * @param {string} TheReason Reason for warning
 * @returns {MessageEmbed} A MessageEmbed with a log of the warning
 */

const commando = require('discord.js-commando'),
  fs = require('fs'),
  moment = require('moment'),
  path = require('path'),
  {MessageEmbed} = require('discord.js'),
  {oneLine} = require('common-tags'),
  {deleteCommandMessages} = require('../../util.js');

module.exports = class WarnCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'warn',
      'memberName': 'warn',
      'group': 'moderation',
      'aliases': ['warning'],
      'description': 'Warn a member with a specified amount of points',
      'format': 'MemberID|MemberName(partial or full) AmountOfWarnPoints ReasonForWarning',
      'examples': ['warn JohnDoe 1 annoying'],
      'guildOnly': true,
      'throttling': {
        'usages': 2,
        'duration': 3
      },
      'args': [
        {
          'key': 'member',
          'prompt': 'Which member should I give a warning?',
          'type': 'member'
        },
        {
          'key': 'points',
          'prompt': 'How many warning points should I give this member?',
          'type': 'integer'
        },
        {
          'key': 'reason',
          'prompt': 'What is the reason for this warning?',
          'type': 'string',
          'default': ''
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
  }

  run (msg, args) {
    const embed = new MessageEmbed(),
      modLogs = this.client.provider.get(msg.guild, 'modlogchannel',
        msg.guild.channels.exists('name', 'mod-logs')
          ? msg.guild.channels.find('name', 'mod-logs').id
          : null);

    let warn = {
      'id': args.member.id,
      'usertag': args.member.user.tag,
      'points': args.points
    };

    if (fs.existsSync(path.join(__dirname, `../../data/modlogs/${msg.guild.id}/warnlog.json`))) {
      const warns = JSON.parse(fs.readFileSync(path.join(__dirname, `../../data/modlogs/${msg.guild.id}/warnlog.json`)), 'utf8');

      for (const i in warns) {
        if (warns[i].id === args.member.id) {
          warn = {
            'id': warns[i].id,
            'usertag': warns[i].usertag,
            'points': warns[i].points + args.points
          };
          warns.splice(i, 1);
          break;
        }
      }

      warns.push(warn);

      fs.writeFileSync(path.join(__dirname, `../../data/modlogs/${msg.guild.id}/warnlog.json`), JSON.stringify(warns), 'utf8');
    } else {
      msg.reply('📘 No warnpoints log found for this server, creating one and filling with the first warning data');
      fs.mkdirSync(path.join(__dirname, `../../data/modlogs/${msg.guild.id}`));

      const warns = [warn];

      fs.writeFileSync(path.join(__dirname, `../../data/modlogs/${msg.guild.id}/warnlog.json`), JSON.stringify(warns), 'utf8');
    }

    if (fs.existsSync(path.join(__dirname, `../../data/modlogs/${msg.guild.id}/warnlog.json`))) {
      embed
        .setColor('#FFFF00')
        .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
        .setDescription(`**Member:** ${args.member.user.tag} (${args.member.id})\n` +
          '**Action:** Warn\n' +
          `**Previous Warning Points:** ${warn.points - args.points}\n` +
          `**Current Warning Points:** ${warn.points}\n` +
          `**Reason:** ${args.reason !== '' ? args.reason : 'No reason has been added by the moderator'}`)
        .setFooter(moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z'));

      if (this.client.provider.get(msg.guild, 'modlogs', true)) {
        if (!this.client.provider.get(msg.guild, 'hasSentModLogMessage', false)) {
          msg.reply(oneLine `📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
							(or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
							Alternatively use the ${msg.guild.commandPrefix}listwarn command to view the current warning points for a given member.
							This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
          this.client.provider.set(msg.guild, 'hasSentModLogMessage', true);
        }

        deleteCommandMessages(msg, this.client);

        return modLogs
          ? msg.guild.channels.get(modLogs).send({embed}) && msg.embed(embed, `<@${args.member.id}> you have been given ${args.points} warning point(s) by ${msg.member.displayName}`)
          : msg.embed(embed, `<@${args.member.id}> you have been given ${args.points} warning point(s) by ${msg.member.displayName}`);
      }

      return msg.embed(embed, `<@${args.member.id}> you have been given ${args.points} warning point(s) by ${msg.member.displayName}`);
    }

    return msg.reply(oneLine `⚠️ An error occured writing the warning to disc.
							You can contact my developer on his server. Use \`${msg.guild.commandPrefix}invite\` to get an invite to his server.`);
  }
};