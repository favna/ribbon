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

const moment = require('moment'),
  request = require('snekfetch'),
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
      const info = await request.get(`https://discordbots.org/api/bots/${bot}`).set('Authorization', process.env.discordbotskey),
        infoEmbed = new MessageEmbed(),
        infoParsed = JSON.parse(info.text);

      infoEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setTitle(`Discord Bots Info for ${infoParsed.username}#${infoParsed.discriminator} (${infoParsed.clientid})`)
        .setURL(`https://discordbots.org/bot/${infoParsed.clientid}`)
        .setThumbnail(`https://images.discordapp.net/avatars/${infoParsed.clientid}/${infoParsed.avatar}.png`)
        .setDescription(infoParsed.shortdesc)
        .setFooter(`${infoParsed.username}#${infoParsed.discriminator} was submitted`)
        .setTimestamp(moment(infoParsed.date)._d)
        .addField('Default Prefix', infoParsed.prefix, true)
        .addField('Library', infoParsed.lib, true)
        .addField('Server Count', infoParsed.server_count, true) // eslint-disable-line camelcase
        .addField('Shards Count', infoParsed.shards.length, true)
        .addField('Invite Link', `[Click Here](${infoParsed.invite})`);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(infoEmbed, `https://discordbots.org/bot/${infoParsed.clientid}`);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('an error occurred getting info from that bot, are you sure it exists on the website?');
    }
  }
};