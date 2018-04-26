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
 * @file Games StrawpollCommand - Create a strawpoll and find out what people really think (hopefully)  
 * **Aliases**: `straw`, `poll`
 * @module
 * @category games
 * @name strawpoll
 * @example strawpoll "Best Anime Waifu?" "Pyrrha Nikos|Ruby Rose"
 * @param {string} Question The question that the strawpoll needs to answer. Recommended to wrap in `" "` (or `' '`) to allow spaces
 * @param {string} Options The options the strawpoll should have. Recommended to wrap in `" "` (or `' '`) to allow spaces. Splits on every `|`
 * @returns {MessageEmbed} Poll url, title, options and preview image
 */

const request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class StrawpollCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'strawpoll',
      memberName: 'strawpoll',
      group: 'games',
      aliases: ['straw', 'poll'],
      description: 'Strawpoll something. Recommended to use the replying with each argument method to allow spaces in the title',
      format: 'TitleOfStrawpoll OptionA|OptionB|OptionC...',
      examples: ['strawpoll "Best Anime Waifu?" "Pyrrha Nikos|Ruby Rose"'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'title',
          prompt: 'Title of the strawpoll',
          type: 'string',
          wait: 60
        },
        {
          key: 'options',
          prompt: 'Options for the strawpoll?',
          type: 'string',
          wait: 60,
          validate: (opts) => {
            if (/([a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\-\_\=\+\[\{\]\}\;\:\'\"\\\,\<\.\>\/\?\`\~ ]*\|[a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\-\_\=\+\[\{\]\}\;\:\'\"\\\,\<\.\>\/\?\`\~]*)*/.test(opts) &&
              opts.split('|').length >= 2 && opts.split('|').length <= 30) {
              return true;
            }

            return 'You need between 2 and 30 options and the valid format for the options is `Question 1|Question 2|Question 3 etc..`';

          }
        }
      ]
    });
  }

  async run (msg, args) {
    startTyping(msg);
    const pollEmbed = new MessageEmbed(),
      strawpoll = await request
        .post('https://www.strawpoll.me/api/v2/polls')
        .set('Content-Type', 'application/json')
        .send({
          title: args.title,
          options: args.options.split('|'),
          multi: false,
          dupcheck: 'normal',
          captcha: true
        });

    if (strawpoll.ok) {
      pollEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setTitle(strawpoll.body.title)
        .setURL(`http://www.strawpoll.me/${strawpoll.body.id}`)
        .setImage(`http://www.strawpoll.me/images/poll-results/${strawpoll.body.id}.png`)
        .setDescription(`Options on this poll: \`${strawpoll.body.options.join(', ')}\` `);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(pollEmbed, `http://www.strawpoll.me/${strawpoll.body.id}`);
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply('an error occurred creating the strawpoll');
  }
};