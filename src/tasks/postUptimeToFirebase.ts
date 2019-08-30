import { EVERY_THREE_MINUTES } from '@components/Constants';
import { setUptimeData } from '@components/FirebaseActions';
import { ApplyOptions, isTextChannel } from '@components/Utils';
import { stripIndents } from 'common-tags';
import { ScheduledTask, Task, TaskOptions } from 'klasa';
import moment from 'moment';
import { ClientSettings } from '../RibbonTypes';

@ApplyOptions<TaskOptions>({ name: 'postUptimeToFirebase', enabled: true })
export default class PostUptimeToFirebaseTask extends Task {
  async run() {
    try {
      const uptime = moment.duration(process.uptime() * 1000).format('D [days], H [hours] [and] m [minutes]');
      setUptimeData(uptime);
    } catch (err) {
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!);

      if (channel && isTextChannel(channel)) {
        channel.send(stripIndents(
          `
            ${this.client.options.owners.map(owner => `<@${owner}>`).join(' and ')}, I failed to update Firebase uptime data!
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Error Message:** ${err}
          `
        ));
      }
    }
  }

  async init() {
    if (this.client.options.production) {
      this.ensureTask('postUptimeToFirebase', EVERY_THREE_MINUTES);
    }
  }

  private ensureTask(name: string, time: string): Promise<ScheduledTask> | void {
    const schedules = this.client.settings!.get(ClientSettings.Schedules) as ClientSettings.Schedules;
    if (!schedules.some(task => task.taskName === name)) return this.client.schedule.create(name, time, { catchUp: true });

    return undefined;
  }
}