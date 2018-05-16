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
 * @file Moderation TimerRemoveCommand - Remove a specified timed message  
 * **Aliases**: `tr`, `timeremove`, `timerdelete`, `timedelete`
 * @module
 * @category moderation
 * @name timerremove
 * @returns {MessageEmbed} Confirmation the timed message was removed
 */

const Database = require('better-sqlite3'),
  moment = require('moment'),
  ms = require('ms'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class TimerRemoveCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'timerremove',
      memberName: 'timerremove',
      group: 'moderation',
      aliases: ['tr', 'timeremove', 'timerdelete', 'timedelete'],
      description: 'Remove a specified timed message',
      details: 'Use the timerlist command to find the ID for deleting',
      format: 'idOfMessage',
      examples: ['timerremove 1'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'id',
          prompt: 'Which timed message should I delete?',
          type: 'integer'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES');
  }

  run (msg, {id}) {
    const conn = new Database(path.join(__dirname, '../../data/databases/timers.sqlite3'));

    try {
      startTyping(msg);
      const rows = conn.prepare(`SELECT id FROM "${msg.guild.id}";`).all(),
        validIDs = [];

      for (const row in rows) {
        validIDs.push(rows[row].id);
      }

      if (!validIDs.includes(id)) {
        stopTyping(msg);
        
        return msg.reply(`that is not an ID of a message stored for this guild. You can view all the stored messages with the \`${msg.guild.commandPrefix}timerlist\` command`);
      }
    } catch (err) {
      stopTyping(msg);
      if (/(?:no such table)/i.test(err.toString())) {
        return msg.reply(`no timed messages found for this server. Start saving your first with ${msg.guild.commandPrefix}timeradd`);
      }
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in validating the ID for the \`timerremove\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }

    try {
      const modlogChannel = msg.guild.settings.get('modlogchannel',
          msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null),
        timedMessage = conn.prepare(`SELECT * from "${msg.guild.id}" WHERE id=$id`).get({id}),
        timerRemoveEmbed = new MessageEmbed();

      conn.prepare(`DELETE FROM "${msg.guild.id}" WHERE id=$id`).run({id});

      timerRemoveEmbed
        .setColor('#F7F79D')
        .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
        .setDescription(stripIndents`
        **Action:** Timed message removed
        **Interval:** ${ms(timedMessage.interval, {long: true})}
        **Channel:** <#${timedMessage.channel}>
        **Message:** ${timedMessage.content}`)
        .setTimestamp();

      if (msg.guild.settings.get('modlogs', true)) {
        if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
          msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
                              (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
                              This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
          msg.guild.settings.set('hasSentModLogMessage', true);
        }
        modlogChannel ? msg.guild.channels.get(modlogChannel).send('', {embed: timerRemoveEmbed}) : null;
      }

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(timerRemoveEmbed);

    } catch (err) {
      if (/(?:no such table)/i.test(err.toString())) {
        return msg.reply(`no timed messages found for this server. Start saving your first with ${msg.guild.commandPrefix}timeradd`);
      }
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in removing message in the \`timerremove\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};