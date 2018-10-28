/**
 * @file Owner DBPostCommand - Posts current guild count to discordbotlist  
 * @module
 * @category owner
 * @name dbpost
 * @returns {Message} Confirmation the update was made
 */

import fetch from 'node-fetch';
import {Command} from 'discord.js-commando';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class DBPostCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'dbpost',
      memberName: 'dbpost',
      group: 'owner',
      description: 'Post current server count to Discord Bots List',
      guildOnly: false,
      ownerOnly: true
    });
  }

  async run (msg) {
    try {
      startTyping(msg);

      await fetch(`https://discordbots.org/api/bots/${this.client.user.id}/stats`, {
        method: 'POST',
        body: JSON.stringify({server_count: this.client.guilds.size}), // eslint-disable-line camelcase
        headers: {
          Authorization: process.env.discordbotskey,
          'Content-Type': 'application/json'
        }
      });

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('updated discordbots.org stats.');
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('an error occurred updating discordbots.org stats.');
    }
  }
};