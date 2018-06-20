/**
 * @file Owner DBPostCommand - Posts current guild count to discordbotlist  
 * @module
 * @category owner
 * @name dbpost
 * @returns {Message} Confirmation the update was made
 */

const request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

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
      await request.post(`https://discordbots.org/api/bots/${this.client.user.id}/stats`)
        .set('Authorization', process.env.discordbotskey)
        .send({server_count: this.client.guilds.size}); // eslint-disable-line camelcase

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