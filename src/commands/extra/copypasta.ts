/**
 * @file Extra CopypastaCommand - Sends a copypasta to the chat
 *
 * Note: It is possible to get copypastas with more than 2000 characters. Ask me to add it through my server!
 *
 * **Aliases**: `cp`, `pasta`, `tag`
 * @module
 * @category extra
 * @name copypasta
 * @example copypasta navy
 * @param {string} PastaName Name of the copypasta to send
 */

import { DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages, removeNullAndUndefined } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed, TextChannel, Util } from 'discord.js';
import { oneLine, stripIndents } from 'common-tags';
import dym from 'didyoumean2';
import moment from 'moment';
import { readPasta, readAllPastas } from '@components/Typeorm/DbInteractions';

interface CopypastaArgs {
  name: string;
}

export default class CopypastaCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'copypasta',
      aliases: [ 'cp', 'pasta', 'tag' ],
      group: 'extra',
      memberName: 'copypasta',
      description: 'Sends a copypasta to the chat',
      format: 'CopypastaName',
      examples: [ 'copypasta navy' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'name',
          prompt: 'Which copypasta should I send?',
          type: 'string',
          parse: (name: string) => name.toLowerCase(),
        }
      ],
    });
  }

  public async run(msg: CommandoMessage, { name }: CopypastaArgs) {
    const pastaEmbed = new MessageEmbed();

    try {
      const pasta = await readPasta(name, msg.guild.id);

      if (pasta && pasta.content) {
        const image = pasta.content.match(/https?:\/\/.*\.(?:png|jpg|gif|webp|jpeg|svg)/im);

        if (image) {
          pastaEmbed.setImage(image[0]);
          pasta.content = pasta.content.replace(/([<>])/gm, '');
          pasta.content =
            pasta.content.substring(0, image.index! - 1) +
            pasta.content.substring(image.index! + image[0].length);
        }

        if (pasta.content.length >= 1800) {
          const splitContent = Util.splitMessage(pasta.content, {maxLength: 1800});

          for (const part of splitContent) {
            await msg.say(part);
          }

          return null;
        }

        pastaEmbed
          .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
          .setTitle(pasta.name)
          .setDescription(pasta.content);

        deleteCommandMessages(msg, this.client);

        return msg.embed(pastaEmbed);
      }

      const allPastas = await readAllPastas(msg.guild.id);
      const maybe = dym(name, allPastas.map(cp => cp.name).filter(removeNullAndUndefined), { deburr: true });

      deleteCommandMessages(msg, this.client);

      return msg.reply(oneLine`that copypasta does not exist! ${maybe
        ? oneLine`Did you mean \`${maybe}\`?`
        : `You can save it with \`${msg.guild.commandPrefix}copypastaadd <name> <content>\``}`
      );
    } catch (err) {
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`copypasta\` command!
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