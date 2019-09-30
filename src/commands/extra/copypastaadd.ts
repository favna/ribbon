/**
 * @file Extra CopypastaAddCommand - Adds a new copypasta for your server
 *
 * **Aliases**: `cpadd`, `pastaadd`, `tagadd`, `newtag`
 * @module
 * @category extra
 * @name copypastaadd
 * @example copypastaadd lipsum Lorem ipsum dolor sit amet.
 * @param {string} PasteName Name for the new pasta
 * @param {string} PastaContent Content for the new pasta
 */

import { DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed, TextChannel } from 'discord.js';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import { writePasta } from '@components/Typeorm/DbInteractions';

interface CopypastaAddArgs {
  name: string;
  content: string;
}

export default class CopypastaAddCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'copypastaadd',
      aliases: [ 'cpadd', 'pastaadd', 'tagadd', 'newtag' ],
      group: 'extra',
      memberName: 'copypastaadd',
      description: 'Saves a copypasta to local file',
      format: 'CopypastaName CopypastaContent',
      examples: [ 'copypasta navy what the fuck did you just say to me ... (etc.)' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'name',
          prompt: 'What is the name of the copypasta you want to save?',
          type: 'string',
          parse: (name: string) => name.toLowerCase(),
        },
        {
          key: 'content',
          prompt: 'What should be stored in the copypasta?',
          type: 'string',
        }
      ],
    });
  }

  public async run(msg: CommandoMessage, { name, content }: CopypastaAddArgs) {
    const pastaAddEmbed = new MessageEmbed()
      .setAuthor(msg.member!.displayName, msg.author!.displayAvatarURL({ format: 'png' }))
      .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
      .setDescription(content)
      .setTitle(`Stored the \`${name}\` copypasta`);

    try {
      await writePasta({
        name,
        guildId: msg.guild.id,
        content,
      });

      deleteCommandMessages(msg, this.client);

      return msg.embed(pastaAddEmbed);
    } catch (err) {
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`copypastaadd\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author!.tag} (${msg.author!.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Error Message:** ${err}`
      );

      return msg.reply(oneLine`
        an unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
        Want to know more about the error?
        Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command`
      );
    }
  }
}