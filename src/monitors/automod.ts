import { Monitor, MonitorOptions, KlasaMessage } from 'klasa';
import { ApplyOptions } from '@components/Utils';
import { GuildSettings } from 'RibbonTypes';
import { caps, duptext, emojis, badwords, invites, links, mentions } from '@components/AutomodHelper';

@ApplyOptions<MonitorOptions>({
  name: 'automod',
  enabled: true,
  ignoreBots: false,
  ignoreSelf: true,
  ignoreOthers: false,
  ignoreWebhooks: false,
  ignoreEdits: false,
  ignoreBlacklistedGuilds: false,
  ignoreBlacklistedUsers: false,
})
export default class MessageMonitor extends Monitor {
  async run(msg: KlasaMessage) {
    if (msg.guild && msg.deletable && msg.guildSettings.get(GuildSettings.automodEnabled)) {
      if (
        msg.member &&
        msg.member.roles
          .some(role => (msg.guildSettings.get(GuildSettings.automodFilterRoles) as GuildSettings.automod['filterRoles'])
            .includes(role.id)
          )
      ) {
        return;
      }

      if (msg.guildSettings.get(GuildSettings.automodInvites)) {
        if (invites(msg, this.client)) {
          await msg.delete();

          return;
        }
      }

      if (msg.guildSettings.get(GuildSettings.automodLinks)) {
        if (links(msg, this.client)) {
          await msg.delete();

          return;
        }
      }

      if (msg.guildSettings.get(GuildSettings.automodBadwordsEnabled)) {
        const words = msg.guildSettings.get(GuildSettings.automodBadwordsWords) as GuildSettings.automodBadwords['words'];

        if (badwords(msg, words, this.client)) {
          await msg.delete();

          return;
        }
      }

      if (msg.guildSettings.get(GuildSettings.automodMentionsEnabled)) {
        const options = msg.guildSettings.get(GuildSettings.autmodMentions) as GuildSettings.automodMentions;

        if (mentions(msg, options.threshold, this.client)) {
          await msg.delete();

          return;
        }
      }

      if (msg.guildSettings.get(GuildSettings.automodCapsEnabled)) {
        const options = msg.guildSettings.get(GuildSettings.automodCaps) as GuildSettings.automodCaps;

        if (caps(msg, options.threshold, options.minLength, this.client)) {
          await msg.delete();

          return;
        }
      }

      if (msg.guildSettings.get(GuildSettings.automodDuptextEnabled)) {
        const options = msg.guildSettings.get(GuildSettings.autmodDuptext) as GuildSettings.automodDuptext;

        if (duptext(msg, options.within, options.equals, options.distance, this.client)) {
          await msg.delete();

          return;
        }
      }

      if (msg.guildSettings.get(GuildSettings.automodEmojisEnabled)) {
        const options = msg.guildSettings.get(GuildSettings.automodEmojis) as GuildSettings.automodEmojis;

        if (emojis(msg, options.threshold, options.minLength, this.client)) {
          await msg.delete();
        }
      }
    }
  }
}