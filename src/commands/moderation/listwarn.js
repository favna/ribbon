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
 * @module
 * @category moderation
 * @name listwarn
 * @example listwarn Biscuit
 * @param {member} AnyMember The member of whom to list the warning points
 * @returns {MessageEmbed} The warnings that member has
 */

const Database = require('better-sqlite3'),
  moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class ListWarnCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'listwarn',
      memberName: 'listwarn',
      group: 'moderation',
      aliases: ['reqwarn', 'lw', 'rw'],
      description: 'Lists the warning points given to a member',
      format: 'MemberID|MemberName(partial or full)',
      examples: ['listwarn {member}'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Which member should I show warning points for?',
          type: 'member',
          label: 'member name or ID'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
  }

  run (msg, {member}) {
    const conn = new Database(path.join(__dirname, '../../data/databases/warnings.sqlite3')),
      embed = new MessageEmbed();


    embed
      .setColor('#ECECC9')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setTimestamp();

    try {
      startTyping(msg);
      const query = conn.prepare(`SELECT * FROM "${msg.guild.id}" WHERe id= ?;`).get(member.id);

      embed.setDescription(stripIndents`**Member:** ${query.tag} (${query.id})
                  **Current warning Points:** ${query.points}`);
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(embed);
    } catch (err) {
      stopTyping(msg);
      if (/(?:no such table)/i.test(err.toString())) {
        return msg.reply(`📘 No warnpoints found for this server, it will be created the first time you use the \`${msg.guild.commandPrefix}warn\` command`);
      }
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`listwarn\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author.tag} (${msg.author.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Input:** \`${member.user.tag} (${member.id})\`
        **Error Message:** ${err}
        `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
              Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};