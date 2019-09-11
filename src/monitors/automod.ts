import { GuildSettings } from '@settings/GuildSettings';
import { badwords, caps, duptext, emojis, invites, links, mentions } from '@utils/AutomodHelper';
import { ApplyOptions } from '@utils/Utils';
import { KlasaMessage, Monitor, MonitorOptions } from 'klasa';

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
export default class extends Monitor {
  async run(msg: KlasaMessage) {
    if (msg.guild && msg.deletable && msg.guildSettings.get(GuildSettings.automodEnabled)) {
      if (
        msg.member &&
        msg.member.roles
          .some(role => (msg.guildSettings.get(GuildSettings.automodFilterRoles) as GuildSettings.Automod['filterRoles'])
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
        const words = msg.guildSettings.get(GuildSettings.automodBadwordsWords) as GuildSettings.AutomodBadwords['words'];

        if (badwords(msg, words, this.client)) {
          await msg.delete();

          return;
        }
      }

      if (msg.guildSettings.get(GuildSettings.automodMentionsEnabled)) {
        const options = msg.guildSettings.get(GuildSettings.autmodMentions) as GuildSettings.AutomodMentions;

        if (mentions(msg, options.threshold, this.client)) {
          await msg.delete();

          return;
        }
      }

      if (msg.guildSettings.get(GuildSettings.automodCapsEnabled)) {
        const options = msg.guildSettings.get(GuildSettings.automodCaps) as GuildSettings.AutomodCaps;

        if (caps(msg, options.threshold, options.minLength, this.client)) {
          await msg.delete();

          return;
        }
      }

      if (msg.guildSettings.get(GuildSettings.automodDuptextEnabled)) {
        const options = msg.guildSettings.get(GuildSettings.autmodDuptext) as GuildSettings.AutomodDuptext;

        if (duptext(msg, options.within, options.equals, options.distance, this.client)) {
          await msg.delete();

          return;
        }
      }

      if (msg.guildSettings.get(GuildSettings.automodEmojisEnabled)) {
        const options = msg.guildSettings.get(GuildSettings.automodEmojis) as GuildSettings.AutomodEmojis;

        if (emojis(msg, options.threshold, options.minLength, this.client)) {
          await msg.delete();
        }
      }
    }
  }
}