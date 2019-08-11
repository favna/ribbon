/**
 * @file Moderation CountdownList - List all stored countdown messages in the current guild
 *
 * **Aliases**: `cl`, `cdlist`
 * @module
 * @category moderation
 * @name countdownlist
 */

import { deleteCommandMessages, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { TextChannel, Util } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import { readAllCountdownsForGuild } from '@components/Typeorm/DbInteractions';

export default class CountdownList extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'countdownlist',
      aliases: [ 'cd', 'cdlist' ],
      group: 'moderation',
      memberName: 'countdownlist',
      description: 'List all stored countdown messages in the current guild',
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
    });
  }

  @shouldHavePermission('MANAGE_MESSAGES')
  public async run(msg: CommandoMessage) {
    try {
      const countdowns = await readAllCountdownsForGuild(msg.guild.id);

      if (!countdowns.length) throw new Error('no_countdowns');

      const body = countdowns.map(row => (
        `${stripIndents`
          **Name:** ${row.name}
          **Event at:** ${moment(row.datetime).format('YYYY-MM-DD HH:mm')}
          **Countdown Duration:** ${moment.duration(moment(row.datetime).diff(moment(), 'days'), 'days').format('w [weeks][, ] d [days] [and] h [hours]')}
          **Tag on event:** ${row.tag === 'none' ? 'No one' : `@${row.tag}`}
          **Channel:** <#${row.channelId}> (\`${row.channelId}\`)
          **Content:** ${row.content}
          **Last sent at:** ${moment(row.lastsend).format('YYYY-MM-DD HH:mm [UTC]Z')}`}
          \n`
      )).join('\n');

      deleteCommandMessages(msg, this.client);

      if (body.length >= 1800) {
        const splitContent = Util.splitMessage(body, { maxLength: 1800 });

        splitContent.forEach(part => {
          msg.embed({
            color: msg.guild.me.displayColor,
            description: part,
            title: 'Countdowns stored on this server',
          });
        });

        return null;
      }


      return msg.embed({
        color: msg.guild.me.displayColor,
        description: body,
        title: 'Countdowns stored on this server',
      });
    } catch (err) {
      if (/(?:no_countdowns)/i.test(err.toString())) {
        return msg.reply(`no countdowns saved for this server. Start saving your first with \`${msg.guild.commandPrefix}countdownadd\``);
      }
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`countdownlist\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author.tag} (${msg.author.id})
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