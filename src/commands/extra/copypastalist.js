/**
 * @file Extra CopyPastaListCommand - Gets all copypastas available to the server  
 * **Aliases**: `cplist`, `copylist`, `pastalist`
 * @module
 * @category extra
 * @name copypastalist
 * @returns {MessageEmbed} List of all available copypastas
 */

const Database = require('better-sqlite3'),
  moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {splitMessage} = require('discord.js'),
  {stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class CopyPastaListCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'copypastalist',
      memberName: 'copypastalist',
      group: 'extra',
      aliases: ['cplist', 'copylist', 'pastalist'],
      description: 'Gets all copypastas available to the server',
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  async run (msg) {
    const conn = new Database(path.join(__dirname, '../../data/databases/pastas.sqlite3'));

    try {
      startTyping(msg);

      const list = conn.prepare(`SELECT name FROM "${msg.guild.id}";`).all().map(p => p.name);

      if (list && list.length) {
        for (const entry in list) {
          list[entry] = `- \`${list[entry]}\``;
        }
      }

      deleteCommandMessages(msg, this.client);

      if (list.join('\n').length >= 2048) {
        const messages = [],
          splitTotal = splitMessage(stripIndents`${list.join('\n')}`);

        for (const part in splitTotal) {
          messages.push(await msg.embed({
            title: 'Copypastas available on this server',
            description: splitTotal[part],
            color: msg.guild.me.displayColor
          }));
        }
        stopTyping(msg);

        return messages;
      }

      stopTyping(msg);

      return msg.embed({
        title: 'Copypastas available on this server',
        description: list.join('\n'),
        color: msg.guild.me.displayColor
      });

    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);
      if ((/(?:no such table)/i).test(err.toString())) {
        return msg.reply(`no pastas saved for this server. Start saving your first with \`${msg.guild.commandPrefix}copypastaadd <name> <content>\``);
      }
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`copypastalist\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);

      return msg.reply(`no copypastas found for this server. Start saving your first with \`${msg.guild.commandPrefix}copypastaadd\`!`);
    }
  }
};