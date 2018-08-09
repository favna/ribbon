/**
 * @file Info DiscordBotsCommand - Gets the stats from a bot listed on DiscordBotList  
 * **Aliases**: `dbapi`, `db`
 * @module
 * @category info
 * @name discordbots
 * @example discordbots 376520643862331396
 * @param {StringResolvable} BotID the user ID of the bot you want to get info about
 * @returns {MessageEmbed} Info about a bot
 */

const fetch = require('node-fetch'),
  moment = require('moment'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class DiscordBotsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'discordbots',
      memberName: 'discordbots',
      group: 'info',
      aliases: ['dbapi', 'db'],
      description: 'Gets the stats from a Discord Bot on DiscordBotList',
      format: 'DiscordBotID',
      examples: ['discordbots 376520643862331396'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'bot',
          prompt: 'ID of the bot to get stats from?',
          type: 'string',
          default: '376520643862331396'
        }
      ]
    });
  }

  async run (msg, {bot}) {
    try {
      startTyping(msg);
      const res = await fetch(`https://discordbots.org/api/bots/${bot}`, {headers: {Authorization: process.env.discordbotskey}}),
        info = await res.json(),
        infoEmbed = new MessageEmbed();

      infoEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setTitle(`Discord Bots Info for ${info.username}#${info.discriminator} (${info.clientid})`)
        .setURL(`https://discordbots.org/bot/${info.clientid}`)
        .setThumbnail(`https://images.discordapp.net/avatars/${info.clientid}/${info.avatar}.png`)
        .setDescription(info.shortdesc)
        .setFooter(`${info.username}#${info.discriminator} was submitted`)
        .setTimestamp(moment(info.date)._d)
        .addField('Default Prefix', info.prefix, true)
        .addField('Library', info.lib, true)
        .addField('Server Count', info.server_count, true) // eslint-disable-line camelcase
        .addField('Shards Count', info.shards.length, true)
        .addField('Invite Link', `[Click Here](${info.invite})`);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(infoEmbed, `https://discordbots.org/bot/${info.clientid}`);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('an error occurred getting info from that bot, are you sure it exists on the website?');
    }
  }
};