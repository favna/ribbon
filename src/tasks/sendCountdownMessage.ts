import { EVERY_THREE_MINUTES } from '@components/Constants';
import { deleteCountdown, readAllCountdowns, writeCountdown } from '@components/Typeorm/DbInteractions';
import { ApplyOptions } from '@components/Utils';
import { stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { ScheduledTask, Task, TaskOptions } from 'klasa';
import moment from 'moment';
import { ClientSettings } from '@root/RibbonTypes';

@ApplyOptions<TaskOptions>({ name: 'sendCountdownMessage', enabled: true })
export default class SendCountdownMessageTask extends Task {
  async run() {
    try {
      const countdowns = await readAllCountdowns();

      for (const countdown of countdowns) {
        const cdMoment = moment(countdown.lastsend).add(24, 'hours');
        const dura = moment.duration(cdMoment.diff(moment()));

        if (dura.asMinutes() <= 0) {
          const guild = this.client.guilds.get(countdown.guildId!);
          if (!guild) continue;
          const channel = guild.channels.get(countdown.channelId!) as TextChannel;
          const me = guild.me!;
          const countdownEmbed = new MessageEmbed()
            .setAuthor('Countdown Reminder', me.user.displayAvatarURL({ format: 'png' }))
            .setColor(me.displayHexColor)
            .setTimestamp()
            .setDescription(stripIndents`
              Event on: ${moment(countdown.datetime).format('MMMM Do YYYY [at] HH:mm')}
              That is:
              ${moment.duration(moment(countdown.datetime).diff(moment(), 'days'), 'days').format('w [weeks][, ] d [days] [and] h [hours]')}

              **__${countdown.content}__**`
            );

          if (moment(countdown.datetime).diff(new Date(), 'hours') >= 24) {
            await writeCountdown({
              name: countdown.name,
              guildId: countdown.guildId,
              lastsend: new Date(),
            });
          }
          await deleteCountdown(countdown.name, countdown.guildId);

          switch (countdown.tag) {
            case 'everyone':
              channel.send('@everyone GET HYPE IT IS TIME!', countdownEmbed);
              break;
            case 'here':
              channel.send('@here GET HYPE IT IS TIME!', countdownEmbed);
              break;
            default:
              channel.send('GET HYPE IT IS TIME!', countdownEmbed);
              break;
          }
        }
      }
    } catch (err) {
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        ${this.client.options.owners.map(owner => `<@${owner}>`).join(' and ')}, an error occurred sending a countdown!
        **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Error Message:** ${err}`
      );
    }
  }

  async init() {
    if (this.client.options.production) {
      this.ensureTask('sendCountdownMessage', EVERY_THREE_MINUTES);
    }
  }

  private ensureTask(name: string, time: string): Promise<ScheduledTask> | void {
    const schedules = this.client.settings!.get(ClientSettings.Schedules) as ClientSettings.Schedules;
    if (!schedules.some(task => task.taskName === name)) return this.client.schedule.create(name, time, { catchUp: true });

    return undefined;
  }
}