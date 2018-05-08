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
 * @module
 * @category moderation
 * @name warn
 * @example warn Biscuit 5 Not giving everyone cookies
 * @param {member} AnyMember The member to give warning points
 * @param {number} WarningPoints The amount of warning points to give
 * @param {string} TheReason Reason for warning
 * @returns {MessageEmbed} A MessageEmbed with a log of the warning
 */

const Database = require('better-sqlite3'),
  moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class WarnCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'warn',
      memberName: 'warn',
      group: 'moderation',
      aliases: ['warning'],
      description: 'Warn a member with a specified amount of points',
      format: 'MemberID|MemberName(partial or full) AmountOfWarnPoints ReasonForWarning',
      examples: ['warn JohnDoe 1 annoying'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Which member should I give a warning?',
          type: 'member'
        },
        {
          key: 'points',
          prompt: 'How many warning points should I give this member?',
          type: 'integer'
        },
        {
          key: 'reason',
          prompt: 'What is the reason for this warning?',
          type: 'string',
          default: ''
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
  }

  run (msg, {member, points, reason}) {
    const conn = new Database(path.join(__dirname, '../../data/databases/warnings.sqlite3')),
      modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.exists('name', 'mod-logs')
          ? msg.guild.channels.find('name', 'mod-logs').id
          : null),
      warnEmbed = new MessageEmbed();

    warnEmbed
      .setColor('#FFFF00')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setTimestamp();

    try {
      startTyping(msg);
      const query = conn.prepare(`SELECT id,points FROM "${msg.guild.id}" WHERE id = ?;`).get(member.id);
      let newPoints = points,
        previousPoints = null;

      if (query) {
        previousPoints = query.points;
        newPoints += query.points;
        conn.prepare(`UPDATE "${msg.guild.id}" SET points=$points WHERE id="${member.id}";`).run({points: newPoints});
      } else {
        previousPoints = 0;
        conn.prepare(`INSERT INTO "${msg.guild.id}" VALUES ($id, $tag, $points);`).run({
          id: member.id,
          tag: member.user.tag,
          points
        });
      }

      warnEmbed.setDescription(stripIndents`
            **Member:** ${member.user.tag} (${member.id})
            **Action:** Warn
            **Previous Warning Points:** ${previousPoints}
            **Current Warning Points:** ${newPoints}
            **Reason:** ${reason !== '' ? reason : 'No reason has been added by the moderator'}`);

      if (msg.guild.settings.get(msg.guild, 'modlogs', true)) {
        if (!msg.guild.settings.get(msg.guild, 'hasSentModLogMessage', false)) {
          msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
                                  (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
                                  This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
          msg.guild.settings.set(msg.guild, 'hasSentModLogMessage', true);
        }
        modlogChannel ? msg.guild.channels.get(modlogChannel).send('', {embed: warnEmbed}) : null;
      }

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(warnEmbed);
    } catch (err) {
      stopTyping(msg);
      if (/(?:no such table)/i.test(err.toString())) {
        conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (id TEXT PRIMARY KEY, tag TEXT, points INTEGER);`).run();

        conn.prepare(`INSERT INTO "${msg.guild.id}" VALUES ($id, $tag, $points);`).run({
          id: member.id,
          tag: member.user.tag,
          points
        });
      } else {
        this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
              <@${this.client.owners[0].id}> Error occurred in \`warn\` command!
              **Server:** ${msg.guild.name} (${msg.guild.id})
              **Author:** ${msg.author.tag} (${msg.author.id})
              **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
              **Input:** \`${member.user.tag} (${member.id})\`|| \`${points}\` || \`${reason}\`
              **Error Message:** ${err}
              `);

        return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
              Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
      }
    }
    warnEmbed.setDescription(stripIndents`
          **Member:** ${member.user.tag} (${member.id})
          **Action:** Warn
          **Previous Warning Points:** 0
          **Current Warning Points:** ${points}
          **Reason:** ${reason !== '' ? reason : 'No reason has been added by the moderator'}`);

    deleteCommandMessages(msg, this.client);

    return msg.embed(warnEmbed);
  }
};