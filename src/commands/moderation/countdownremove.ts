/**
 * @file Moderation CountdownRemove - Remove a specified countdown
 *
 * Use the countdownlist command to find the ID for deleting
 *
 * **Aliases**: `cdremove`, `countdowndelete`, `cddelete`, `cdd`, `cdr`
 * @module
 * @category moderation
 * @name countdownremove
 * @example countdownremove newyears
 * @param {string} CountdownID The ID of the Countdown to remove
 */

import { deleteCommandMessages, logModMessage, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed, TextChannel } from 'discord.js';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import { readAllPastas, readCountdown, deleteCountdown } from '@components/Typeorm/DbInteractions';

interface CountdownRemoveArgs {
  name: string;
}

export default class CountdownRemove extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'countdownremove',
      aliases: [ 'cdremove', 'countdowndelete', 'cddelete', 'cdd', 'cdr' ],
      group: 'moderation',
      memberName: 'countdownremove',
      description: 'Remove a specified countdown',
      format: 'CountdownID',
      details: 'Use the countdownlist command to find the ID for deleting',
      examples: [ 'countdownremove newyears' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'name',
          prompt: 'Which countdowns should I delete?',
          type: 'string',
          validate: async (value: string, msg: CommandoMessage) => {
            try {
              const countdowns = await readAllPastas(msg.guild.id);

              if (countdowns.some(countdown => countdown.name === value)) return true;

              return `that is not a name of a countdown stored for this guild. You can view all the stored pastas with the \`${msg.guild.commandPrefix}countdownlist\` command`;
            } catch {
              return msg.reply(`no countdowns saved for this server. Start saving your first with \`${msg.guild.commandPrefix}countdownadd <name> <datetime> <channel> <content>\``);
            }
          },
        }
      ],
    });
  }

  @shouldHavePermission('MANAGE_MESSAGES')
  public async run(msg: CommandoMessage, { name }: CountdownRemoveArgs) {
    try {
      const modlogChannel = msg.guild.settings.get('modlogchannel', null);
      const cdrEmbed = new MessageEmbed();
      const countdown = await readCountdown(name, msg.guild.id);

      await deleteCountdown(name, msg.guild.id);

      cdrEmbed
        .setColor('#F7F79D')
        .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
        .setTimestamp();

      if (countdown) {
        cdrEmbed.setDescription(stripIndents`
          **Action:** Countdown removed
          **Event was at:** ${moment(countdown.datetime).format('YYYY-MM-DD HH:mm')}
          **Countdown Duration:** ${this.parseDateTime(countdown.datetime!)}
          **Tag on event:** ${countdown.tag === 'none' ? 'No one' : `@${countdown.tag}`}
          **Channel:** <#${countdown.channelId}>
          **Message:** ${countdown.content}`
        );
      }

      if (msg.guild.settings.get('modlogs', true)) {
        logModMessage(
          msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, cdrEmbed
        );
      }

      deleteCommandMessages(msg, this.client);

      return msg.embed(cdrEmbed);
    } catch (err) {
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in validating the ID for the \`countdownremove\` command!
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

  private parseDateTime(date: string) {
    moment
      .duration(moment(date).diff(Date.now(), 'days'), 'days')
      .format('w [weeks][, ] d [days] [and] h [hours]');
  }
}