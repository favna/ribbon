/**
 * @file Extra RemindCommand - Set a reminder and Ribbon will remind you
 *
 * Works by reminding you after a given amount of minutes, hours or days in the format of `5m`, `2h` or `1d`
 *
 * **Aliases**: `remindme`, `reminder`
 * @module
 * @category extra
 * @name remind
 * @example remind 1h To continue developing Ribbon
 * @param {string} Time Amount of time you want to be reminded in
 * @param {string} Reminder Thing you want Ribbon to remind you of
 */

import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR, DURA_FORMAT } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import { writeReminder } from '@components/Typeorm/DbInteractions';

type RemindArgs = {
  time: number;
  reminder: string;
};

export default class RemindCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'remind',
      aliases: [ 'remindme', 'reminder' ],
      group: 'extra',
      memberName: 'remind',
      description: 'Set a reminder and Ribbon will remind you',
      format: 'Time Reminder',
      details: 'Works by reminding you after a given amount of minutes, hours or days in the format of `5m`, `2h` or `1d`',
      examples: [ 'remind 1h To continue developing Ribbon' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'time',
          prompt: 'Reply with the time in which you want to be reminded?',
          type: 'duration',
        },
        {
          key: 'reminder',
          prompt: 'What do I need to remind you about?',
          type: 'string',
        }
      ],
    });
  }

  public async run(msg: CommandoMessage, { time, reminder }: RemindArgs) {
    const remindEmbed = new MessageEmbed();

    try {
      await writeReminder({
        userId: msg.author.id,
        date: moment().add(time, 'ms').toDate(),
        content: reminder,
      });

      remindEmbed
        .setAuthor(msg.guild ? msg.member.displayName : msg.author.tag, msg.author.displayAvatarURL({ format: 'png' }))
        .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
        .setThumbnail(`${ASSET_BASE_PATH}/ribbon/reminders.png`)
        .setTitle('Your reminder was stored!')
        .setDescription(reminder)
        .addField('I will remind you in', moment.duration(time).format(DURA_FORMAT));

      deleteCommandMessages(msg, this.client);

      return msg.embed(remindEmbed);
    } catch (err) {
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
          <@${this.client.owners[0].id}> Error occurred in \`remind\` command!
          **Server:** ${msg.guild.name} (${msg.guild.id})
          **Author:** ${msg.author.tag} (${msg.author.id})
          **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
          **Should have reminded in:** ${moment.duration(time).format(DURA_FORMAT)}
          **Reminder that should've been sent:** \`${reminder}\`
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