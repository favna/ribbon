/**
 * @file Extra CopyPastaListCommand - Gets all copypastas available to the server
 *
 * **Aliases**: `cplist`, `copylist`, `pastalist`, `taglist`
 * @module
 * @category extra
 * @name copypastalist
 */

import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { TextChannel, Util } from 'discord.js';
import { stripIndents, oneLine } from 'common-tags';
import moment from 'moment';
import { readAllPastas } from '@components/Typeorm/DbInteractions';

export default class CopyPastaListCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'copypastalist',
      aliases: [ 'cplist', 'copylist', 'pastalist', 'taglist' ],
      group: 'extra',
      memberName: 'copypastalist',
      description: 'Gets all copypastas available to the server',
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
    });
  }

  public async run(msg: CommandoMessage) {
    try {
      const pastas = await readAllPastas(msg.guild.id);

      if (!pastas.length) throw new Error('no_pastas');

      const body = pastas.map(row => (
        `**name:** ${row.name}\n`
      )).join('\n');

      deleteCommandMessages(msg, this.client);

      if (body.length >= 1800) {
        const splitContent = Util.splitMessage(body, { maxLength: 1800 });

        splitContent.forEach(async part => msg.embed({
          color: msg.guild.me!.displayColor,
          description: part,
          title: 'Copypastas available on this server',
        }));

        return null;
      }

      return msg.embed({
        color: msg.guild.me!.displayColor,
        description: body,
        title: 'Copypastas available on this server',
      });
    } catch (err) {
      if (/(?:no_pastas)/i.test(err.toString())) {
        return msg.reply(`no pastas saved for this server. Start saving your first with \`${msg.guild.commandPrefix}copypastaadd <name> <content>\``);
      }

      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`copypastalist\` command!
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