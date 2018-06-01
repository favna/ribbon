/**
 * @file Extra SayWutCommand - Bust the last "say" user  
 * **Aliases**: `saywat`, `saywot`
 * @module
 * @category extra
 * @name saywut
 * @returns {MessageEmbed} Info on who used the "say" command last
 */

const moment = require('moment'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class SayWutCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'saywut',
      memberName: 'saywut',
      group: 'extra',
      aliases: ['saywat', 'saywot'],
      description: 'Bust the last "say" user',
      examples: ['saywut'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  run (msg) {
    startTyping(msg);
    const saydata = msg.guild.settings.get('saydata', null),
      wutEmbed = new MessageEmbed();

    if (saydata) {
      wutEmbed
        .setColor(saydata.memberHexColor)
        .setTitle(`Last ${saydata.commandPrefix}say message author`)
        .setAuthor(oneLine`${saydata.authorTag} (${saydata.authorID})`, saydata.avatarURL)
        .setDescription(saydata.argString)
        .setTimestamp(moment(saydata.messageDate)._d);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(wutEmbed);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(`couldn't fetch message for your server. Has anyone used the ${msg.guild.commandPrefix}say command before?`);
  }
};