import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR, EVERY_THIRD_HOUR } from '@components/Constants';
import { createCasinoTimeout, readAllCasinoForGuild, readAllCasinoGuildIds, readCasinoTimeout, updateCasinoTimeout, writeCasino } from '@components/Typeorm/DbInteractions';
import { ApplyOptions } from '@components/Utils';
import { stripIndents } from 'common-tags';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { ScheduledTask, Task, TaskOptions } from 'klasa';
import moment from 'moment';
import { ClientSettings } from '@root/RibbonTypes';

@ApplyOptions<TaskOptions>({ name: 'payoutLotto', enabled: true })
export default class PayoutLottoTask extends Task {
  async run() {
    try {
      const casinoData = await readAllCasinoGuildIds();

      for (const casino of casinoData) {
        const guildId = casino.guildId!;

        if (this.client.guilds.get(guildId)) {
          const lastCheck = await readCasinoTimeout(guildId);

          if (lastCheck && lastCheck.timeout) {
            const diff = moment.duration(moment(lastCheck.timeout).add(1, 'days').diff(moment()));
            const diffInDays = diff.asDays();
            if (diffInDays >= 0) continue;
          } else {
            await createCasinoTimeout({
              guildId,
              timeout: new Date(),
            });
          }

          const casinoGuildEntries = await readAllCasinoForGuild(guildId);
          const winner = Math.floor(Math.random() * casinoGuildEntries.length);

          if (!casinoGuildEntries[winner]) throw new Error('no_rows');
          const previousBalance = casinoGuildEntries[winner].balance!;
          const newBalance = previousBalance + 2000;

          await writeCasino({
            userId: casinoGuildEntries[winner].userId,
            guildId,
            balance: newBalance,
          });

          await updateCasinoTimeout({
            guildId,
            timeout: new Date(),
          });

          const defaultChannel = this.client.guilds.get(guildId)!.systemChannel;
          const winnerEmbed = new MessageEmbed();
          const winnerMember: GuildMember = this.client.guilds.get(guildId)!.members.get(casinoGuildEntries[winner].userId!)!;
          if (!winnerMember) continue;
          const winnerLastMessageChannelId: string | null = winnerMember.lastMessageChannelID;
          const winnerLastMessageChannel = winnerLastMessageChannelId ?
            this.client.guilds.get(guildId)!.channels.get(winnerLastMessageChannelId)! as TextChannel :
            null;
          const winnerLastMessageChannelPermitted: boolean = winnerLastMessageChannel ?
            winnerLastMessageChannel.postable :
            false;

          winnerEmbed
            .setColor(DEFAULT_EMBED_COLOR)
            .setDescription(`Congratulations <@${casinoGuildEntries[winner].userId}>! You won today's random lotto and were granted 2000 chips 🎉!`)
            .setAuthor(winnerMember.displayName, winnerMember.user.displayAvatarURL({ format: 'png' }))
            .setThumbnail(`${ASSET_BASE_PATH}/ribbon/casinologo.png`)
            .addField('Balance', `${previousBalance} ➡ ${newBalance}`);

          if (winnerLastMessageChannelPermitted && winnerLastMessageChannel) {
            winnerLastMessageChannel.send(`<@${casinoGuildEntries[winner].userId}>`, { embed: winnerEmbed });
          } else if (defaultChannel) {
            defaultChannel.send(`<@${casinoGuildEntries[winner].userId}>`, { embed: winnerEmbed });
          }
        }
      }
    } catch (err) {
      if (!/(?:no_rows)/i.test(err.toString())) {
        const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

        channel.send(stripIndents`
          ${this.client.options.owners.map(owner => `<@${owner}>`).join(' and ')}, an error occurred giving someone their lotto payout!
          **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
          **Error Message:** ${err}`
        );
      }
    }
  }

  async init() {
    if (this.client.options.production) {
      this.ensureTask('payoutLotto', EVERY_THIRD_HOUR);
    }
  }

  private ensureTask(name: string, time: string): Promise<ScheduledTask> | void {
    const schedules = this.client.settings!.get(ClientSettings.Schedules) as ClientSettings.Schedules;
    if (!schedules.some(task => task.taskName === name)) return this.client.schedule.create(name, time, { catchUp: true });

    return undefined;
  }
}