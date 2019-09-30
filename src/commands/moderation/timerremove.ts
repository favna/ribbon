/**
 * @file Moderation TimerRemoveCommand - Remove a specified timed message
 *
 * Use the timerlist command to find the ID for deleting
 *
 * **Aliases**: `timeremove`, `timerdelete`, `timedelete`
 * @module
 * @category moderation
 * @name timerremove
 * @example timerremove reminder
 * @param {string} TimerID The ID of the timed message to remove
 */

import { DURA_FORMAT } from '@components/Constants';
import { deleteCommandMessages, logModMessage, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed, TextChannel } from 'discord.js';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import { readAllTimersForGuild, readTimer, deleteTimer } from '@components/Typeorm/DbInteractions';

interface TimerRemoveArgs {
  name: string;
}

export default class TimerRemoveCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'timerremove',
      aliases: [ 'timeremove', 'timerdelete', 'timedelete' ],
      group: 'moderation',
      memberName: 'timerremove',
      description: 'Remove a specified timed message',
      format: 'TimerID',
      details: 'Use the timerlist command to find the ID for deleting',
      examples: [ 'timerremove reminder' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'name',
          prompt: 'Which timed message should I delete?',
          type: 'string',
          validate: async (value: string, msg: CommandoMessage) => {
            try {
              const timers = await readAllTimersForGuild(msg.guild.id);
              if (timers.some(pasta => pasta.name === value)) return true;

              return `that is not a name of a timer stored for this guild. You can view all the stored pastas with the \`${msg.guild.commandPrefix}timerlist\` command`;
            } catch {
              return msg.reply(`no timers saved for this server. Start saving your first with \`${msg.guild.commandPrefix}timeradd\``);
            }
          },
        }
      ],
    });
  }

  @shouldHavePermission('MANAGE_MESSAGES')
  public async run(msg: CommandoMessage, { name }: TimerRemoveArgs) {
    try {
      const modlogChannel = msg.guild.settings.get('modlogchannel', null);
      const timerRemoveEmbed = new MessageEmbed();
      const timer = await readTimer(name, msg.guild.id);
      const timerContent = timer && timer.content ? timer.content : '';
      const timerInterval = timer && timer.interval ? timer.interval : null;
      const timerChannel = timer && timer.channelId ? timer.channelId : null;

      await deleteTimer(name, msg.guild.id);

      timerRemoveEmbed
        .setColor('#F7F79D')
        .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
        .setDescription(stripIndents`
          **Action:** Timed message removed
          ${timerInterval ? `**Interval:** ${moment.duration(timerInterval).format(DURA_FORMAT)}` : ''}
          ${timerChannel ? `**Channel:** <#${timerChannel}>` : ''}
          **Content was:** ${timerContent.length <= 1800 ? timerContent : `${timerContent.slice(0, 1800)}...`}`)
        .setTimestamp();

      if (msg.guild.settings.get('modlogs', true)) {
        logModMessage(
          msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, timerRemoveEmbed
        );
      }

      deleteCommandMessages(msg, this.client);

      return msg.embed(timerRemoveEmbed);
    } catch (err) {
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in removing message in the \`timerremove\` command!
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