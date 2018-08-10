/**
 * @file Moderation NewsCommand - Make an announcement to a channel named "announcements" or "news"  
 * **Aliases**: `news`
 * @module
 * @category moderation
 * @name announce
 * @example announce Pokemon Switch has released!
 * @param {StringResolvable} Announcement The announcement you want to make
 * @returns {Message} Announcement you wrote in the announcement / news channel
 */

const {Command} = require('discord.js-commando'), 
  {stripIndents} = require('common-tags'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class NewsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'announce',
      memberName: 'announce',
      group: 'moderation',
      aliases: ['news'],
      description: 'Make an announcement in the news channel',
      format: 'Announcement',
      examples: ['announce John Appleseed reads the news'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'body',
          prompt: 'What do you want me to announce?',
          type: 'string'
        }
      ],
      userPermissions: ['ADMINISTRATOR']
    });
  }

  run (msg, {body}) {
    startTyping(msg);
    if (msg.guild.channels.find(c => c.name === 'announcements' || c.name === 'news')) {
      const newsChannel = msg.guild.channels.find(c => c.name === 'announcements') ? msg.guild.channels.find(c => c.name === 'announcements') : msg.guild.channels.find(c => c.name === 'news');

      if (newsChannel.permissionsFor(msg.guild.me).has(['SEND_MESSAGES', 'VIEW_CHANNEL'])) {
        stopTyping(msg);

        return msg.reply('I do not have permission to send messages to that channel. Better go and fix that!');
      }
      newsChannel.startTyping(1);

      let announce = body;

      announce.slice(0, 4) !== 'http' ? announce = `${body.slice(0, 1).toUpperCase()}${body.slice(1)}` : null;
      msg.attachments.first() && msg.attachments.first().url ? announce += `\n${msg.attachments.first().url}` : null;

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);
      newsChannel.stopTyping(true);
      msg.say('Announcement has been made!');
      
      return newsChannel.send(announce);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(stripIndents`To use the announce command you need a channel named \'news\' or \'announcements\'.
    Here is a backup of your message:
    \`\`\`
    ${body}
    \`\`\``);
  }
};