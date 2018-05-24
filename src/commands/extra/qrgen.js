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
 * @file Extra QRGenCommand - Generates a QR code from text (like a URL)  
 * **Aliases**: `qr`, `qrcode`
 * @module
 * @category extra
 * @name qrgen
 * @example qrgen https://favna.xyz/ribbon
 * @param {StringResolvable} URL URL you want to encode into a QR image
 * @returns {MessageEmbed} Embedded QR code and original image URL
 */

const moment = require('moment'),
  qr = require('qrcode'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed, MessageAttachment} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class QRGenCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'qrgen',
      memberName: 'qrgen',
      group: 'extra',
      aliases: ['qr', 'qrcode'],
      description: 'Generates a QR code from text (like a URL)',
      format: 'TextToEncode',
      examples: ['qrgen https://github.com/Favna/Ribbon'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'url',
          prompt: 'Text to make a QR code for?',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, {url}) {
    try {
      startTyping(msg);
      const base64 = await qr.toDataURL(url, {errorCorrectionLevel: 'M'}),
        buffer = Buffer.from(base64.replace(/^data:image\/png;base64,/, '').toString(), 'base64'),
        embedAttachment = new MessageAttachment(buffer, 'qrcode.png'),
        qrEmbed = new MessageEmbed();

      qrEmbed
        .attachFiles([embedAttachment])
        .setTitle(`QR code for ${url}`)
        .setImage('attachment://qrcode.png');

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(qrEmbed);

    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`qr\` command!
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