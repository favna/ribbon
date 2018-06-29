/**
 * @file Info EmotesCommand - Lists all emotes from the server  
 * **Aliases**: `listemo`, `emolist`, `listemoji`, `emote`, `emojis`, `emoji`
 * @module
 * @category info
 * @name emotes
 * @returns {MessageEmbed} List of emotes
 */

const {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class EmotesCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'emotes',
      memberName: 'emotes',
      group: 'info',
      aliases: ['listemo', 'emolist', 'listemoji', 'emote', 'emojis', 'emoji'],
      description: 'Gets all available custom emotes from the server',
      examples: ['emotes'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  run (msg) {
    startTyping(msg);
    const embed = new MessageEmbed();

    let animEmotes = [],
      staticEmotes = [];

    msg.guild.emojis.forEach((e) => {
      e.animated ? animEmotes.push(`<a:${e.name}:${e.id}>`) : staticEmotes.push(`<:${e.name}:${e.id}>`);
    });

    embed
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setAuthor(`${staticEmotes.length + animEmotes.length} ${msg.guild.name} Emotes`, msg.guild.iconURL({format: 'png'}))
      .setTimestamp();

    staticEmotes = staticEmotes.length !== 0 ? `__**${staticEmotes.length} Static Emotes**__\n${staticEmotes.join('')}` : '';
    animEmotes = animEmotes.length !== 0 ? `\n\n__**${animEmotes.length} Animated Emotes**__\n${animEmotes.join('')}` : '';

    embed.setDescription(staticEmotes + animEmotes);

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(embed);
  }
};