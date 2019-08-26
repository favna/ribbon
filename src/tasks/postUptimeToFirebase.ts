import { Task, TaskOptions } from 'klasa';
import { ApplyOptions, isTextChannel } from '@components/Utils';
import moment from 'moment';
import { stripIndents } from 'common-tags';
import { setUptimeData } from '@components/FirebaseActions';
import { EVERY_THREE_MINUTES } from '@components/Constants';

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
      this.client.schedule.create('postUptimeToFirebase', EVERY_THREE_MINUTES, { catchUp: true });
    }
  }
}