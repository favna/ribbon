import { EVERY_MINUTE } from '@components/Constants';
import { readAllTimers, writeTimer } from '@components/Typeorm/DbInteractions';
import { ApplyOptions } from '@components/Utils';
import { stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { ScheduledTask, Task, TaskOptions } from 'klasa';
import moment from 'moment';
import { ClientSettings } from '../RibbonTypes';

@ApplyOptions<TaskOptions>({ name: 'sendTimerMessage', enabled: true })
export default class SendTimerMessageTask extends Task {
  async run() {
    try {
      const timers = await readAllTimers();

      for (const timer of timers) {
        const timerMoment = moment(timer.lastsend).add(timer.interval, 'ms');
        const dura = moment.duration(timerMoment.diff(moment()));

        if (dura.asMinutes() <= 0) {
          await writeTimer({
            name: timer.name,
            guildId: timer.guildId,
            lastsend: new Date(),
          });
          const guild = this.client.guilds.get(timer.guildId!);
          if (!guild) continue;
          const channel = guild.channels.get(timer.channelId!) as TextChannel;
          const me = guild.me!;
          const memberMentions = timer.members ? timer.members.map(member => `<@${member}>`).join(' ') : null;
          const timerEmbed = new MessageEmbed()
            .setAuthor(`${this.client.user!.username} Timed Message`, me.user.displayAvatarURL({ format: 'png' }))
            .setColor(me.displayHexColor)
            .setDescription(timer.content)
            .setTimestamp();

          channel.send(memberMentions ? memberMentions : '', timerEmbed);
        }
      }
    } catch (err) {
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        ${this.client.options.owners.map(owner => `<@${owner}>`).join(' and ')}, an error occurred sending a timed message!
        **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Error Message:** ${err}`
      );
    }
  }

  async init() {
    if (this.client.options.production) {
      this.ensureTask('sendTimerMessage', EVERY_MINUTE);
    }
  }

  private ensureTask(name: string, time: string): Promise<ScheduledTask> | void {
    const schedules = this.client.settings!.get(ClientSettings.Schedules) as ClientSettings.Schedules;
    if (!schedules.some(task => task.taskName === name)) return this.client.schedule.create(name, time, { catchUp: true });

    return undefined;
  }
}