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
 * @file Moderation ListWarnCommand - Show the amount of warning points a member has  
 * **Aliases**: `reqwarn`, `lw`, `rw`
 * @author Jeroen Claassens (favna) <sharkie.jeroen@gmail.com>
 * @license GPL-3.0-or-later
 * @module
 * @category moderation
 * @name listwarn
 * @example listwarn Biscuit
 * @param {member} AnyMember The member of whom to list the warning points
 * @returns {MessageEmbed} The warnings that member has
 */

const Fuse = require('fuse.js'),
  commando = require('discord.js-commando'),
  fs = require('fs'),
  moment = require('moment'),
  path = require('path'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages} = require('../../util.js');

module.exports = class ListWarnCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'listwarn',
      'memberName': 'listwarn',
      'group': 'moderation',
      'aliases': ['reqwarn', 'lw', 'rw'],
      'description': 'Lists the warning points given to a member',
      'format': 'MemberID|MemberName(partial or full)',
      'examples': ['listwarn {member}'],
      'guildOnly': true,
      'throttling': {
        'usages': 2,
        'duration': 3
      },
      'args': [
        {
          'key': 'member',
          'prompt': 'Which member should I show warning points for?',
          'type': 'string',
          'label': 'member name or ID'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
  }

  run (msg, args) {

    if (fs.existsSync(path.join(__dirname, `../../data/modlogs/${msg.guild.id}/warnlog.json`))) {
      /* eslint-disable sort-vars*/
      const embed = new MessageEmbed(),
        fsoptions = {
          'shouldSort': true,
          'threshold': 0.6,
          'location': 0,
          'distance': 100,
          'maxPatternLength': 32,
          'minMatchCharLength': 1,
          'keys': ['id', 'usertag']
        },
        warns = JSON.parse(fs.readFileSync(path.join(__dirname, `../../data/modlogs/${msg.guild.id}/warnlog.json`)), 'utf8'),
        fuse = new Fuse(warns, fsoptions),
        results = fuse.search(args.member);
      /* eslint-enable sort-vars*/

      if (results.length) {
        embed
          .setColor('#ECECC9')
          .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
          .setFooter(moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z'))
          .setDescription(`**Member:** ${results[0].usertag} (${results[0].id})\n` +
            `**Current Warning Points:** ${results[0].points}`);

        deleteCommandMessages(msg, this.client);

        return msg.embed(embed);
      }

      return msg.reply('⚠️ That user has no warning points yet');
    }

    return msg.reply(`📘 No warnpoints log found for this server, it will be created the first time you use the \`${msg.guild.commandPrefix}warn\` command`);
  }
};