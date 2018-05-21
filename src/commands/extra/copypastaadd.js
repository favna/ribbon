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
 * @file Extra CopyPastaAddCommand - Adds a new copypasta for your server  
 * **Aliases**: `cpadd`, `pastaadd`
 * @module
 * @category extra
 * @name copypastaadd
 * @example copypastaadd lipsum Lorem ipsum dolor sit amet. 
 * @param {StringResolvable} PasteName Name for the new pasta
 * @param {StringResolvable} PastaContent Content for the new pasta
 * @returns {Message} Confirmation the copypasta was added
 */

const Database = require('better-sqlite3'),
  moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class CopyPastaAddCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'copypastaadd',
      memberName: 'copypastaadd',
      group: 'extra',
      aliases: ['cpadd', 'pastaadd'],
      description: 'Saves a copypasta to local file',
      format: 'CopypastaName CopypastaContent',
      examples: ['copypasta navy what the fuck did you just say to me ... (etc.)'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'name',
          prompt: 'What is the name of the copypasta you want to save?',
          type: 'string',
          parse: p => p.toLowerCase()
        },
        {
          key: 'content',
          prompt: 'What should be stored in the copypasta?',
          type: 'string'
        }
      ]
    });
  }

  run (msg, {name, content}) {
    const conn = new Database(path.join(__dirname, '../../data/databases/pastas.sqlite3')),
      pastaAddEmbed = new MessageEmbed();

    pastaAddEmbed
      .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({format: 'png'}))
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setDescription(content);

    try {
      startTyping(msg);
      const query = conn.prepare(`SELECT name FROM "${msg.guild.id}" WHERE name = ?;`).get(name);

      if (query) {
        conn.prepare(`UPDATE "${msg.guild.id}" SET content=$content WHERE name=$name`).run({
          name,
          content
        });

        pastaAddEmbed.setTitle(`Copypasta \`${name}\` Updated`);

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(pastaAddEmbed);
      }
      conn.prepare(`INSERT INTO "${msg.guild.id}" VALUES ($name, $content);`).run({
        name,
        content
      });
      pastaAddEmbed.setTitle(`Copypasta \`${name}\` Added`);

      stopTyping(msg);

      return msg.embed(pastaAddEmbed);
    } catch (err) {
      stopTyping(msg);
      if (/(?:no such table)/i.test(err.toString())) {
        conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (name TEXT PRIMARY KEY, content TEXT);`).run();

        conn.prepare(`INSERT INTO "${msg.guild.id}" VALUES ($name, $content);`).run({
          name,
          content
        });
        pastaAddEmbed.setTitle(`Copypasta \`${name}\` Added`);

        stopTyping(msg);

        return msg.embed(pastaAddEmbed);
      }

      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`copypastaadd\` command!
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