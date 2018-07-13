/**
 * @file Extra CopyPastaCommand - Sends a copypasta to the chat  
 * Note: It is possible to get copypastas with more than 2000 characters. Ask me to add it through my server!  
 * **Aliases**: `cp`, `pasta`
 * @module
 * @category extra
 * @name copypasta
 * @example copypasta navy
 * @param {StringResolvable} PastaName Name of the copypasta to send
 * @returns {MessageEmbed} Copypasta content. In a normal message if more than 1024 characters
 */

const Database = require('better-sqlite3'),
  dym = require('didyoumean2'),
  moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {splitMessage, MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class CopyPastaCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'copypasta',
      memberName: 'copypasta',
      group: 'extra',
      aliases: ['cp', 'pasta'],
      description: 'Sends a copypasta to the chat',
      format: 'CopypastaName',
      examples: ['copypasta navy'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'name',
          prompt: 'Which copypasta should I send?',
          type: 'string',
          parse: p => p.toLowerCase()
        }
      ]
    });
  }

  async run (msg, {name}) {
    const conn = new Database(path.join(__dirname, '../../data/databases/pastas.sqlite3')),
      pastaEmbed = new MessageEmbed();

    try {
      startTyping(msg);
      const query = conn.prepare(`SELECT * FROM "${msg.guild.id}" WHERE name = ?;`).get(name);

      if (query) {
        const image = query.content.match(/(https?:\/\/.*\.(?:png|jpg|gif|webp|jpeg|svg))/im);

        if (image) {
          pastaEmbed.setImage(image[0]);
          query.content = query.content.replace(/(<|>)/gm, '');
          query.content = query.content.substring(0, image.index - 1) + query.content.substring(image.index + image[0].length);
        }

        if (query.content.length >= 1950) {
          const messages = [],
            splitTotal = splitMessage(query.content);

          for (const part in splitTotal) {
            messages.push(await msg.say(splitTotal[part]));
          }

          deleteCommandMessages(msg, this.client);
          stopTyping(msg);

          return messages;
        }
        pastaEmbed
          .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
          .setTitle(query.name)
          .setDescription(query.content);

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(pastaEmbed);
      }
      // eslint-disable-next-line one-var
      const maybe = dym(name, conn.prepare(`SELECT name FROM "${msg.guild.id}";`)
        .all()
        .map(a => a.name), {deburr: true});

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(oneLine`that copypasta does not exist! ${maybe 
        ? oneLine`Did you mean \`${maybe}\`?` 
        : `You can save it with \`${msg.guild.commandPrefix}copypastaadd <name> <content>\``}`);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);
      if ((/(?:no such table)/i).test(err.toString())) {
        return msg.reply(`no pastas saved for this server. Start saving your first with \`${msg.guild.commandPrefix}copypastaadd <name> <content>\``);
      }
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
          <@${this.client.owners[0].id}> Error occurred in \`copypasta\` command!
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