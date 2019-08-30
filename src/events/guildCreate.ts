import { ASSET_BASE_PATH, MOMENT_LOG_FORMAT } from '@components/Constants';
import { setServersData } from '@components/FirebaseActions';
import FirebaseStorage from '@components/FirebaseStorage';
import { ApplyOptions, isTextChannel } from '@components/Utils';
import { stripIndents } from 'common-tags';
import { Guild, MessageAttachment, MessageEmbed } from 'discord.js';
import jimp from 'jimp';
import { Event, EventOptions } from 'klasa';
import moment from 'moment';
import path from 'path';
import { GuildSettings } from '../RibbonTypes';

@ApplyOptions<EventOptions>({event: 'guildCreate'})
export default class GuildCreateEvent extends Event {
  async run(guild: Guild) {
    try {
      let serverCount = FirebaseStorage.servers;
      serverCount++;

      FirebaseStorage.servers = serverCount;
      setServersData(serverCount.toString());
    } catch (err) {
      const logChannel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!)!;

      if (isTextChannel(logChannel)) {
        logChannel.send(stripIndents(
          `
            ${this.client.options.owners.map(owner => `<@${owner}>`).join(' and ')}, I failed to update Firebase guilds count when joining guild!
            **Guild Data:** ${guild.name} (${guild.id})
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Error Message:** ${err}
          `
        ));
      }
    }

    try {
      const avatar = await jimp.read(this.client.user!.displayAvatarURL({ format: 'png' }));
      const border = await jimp.read(`${ASSET_BASE_PATH}/ribbon/jimp/border.png`);
      const canvas = await jimp.read(500, 150);
      const mask = await jimp.read(`${ASSET_BASE_PATH}/ribbon/jimp/mask.png`);
      const fontMedium = await jimp.loadFont(path.join(__dirname, '../data/fonts/roboto-medium.fnt'));
      const newGuildEmbed = new MessageEmbed();
      const channel = guild.systemChannel ? guild.systemChannel : null;

      avatar.resize(136, jimp.AUTO);
      mask.resize(136, jimp.AUTO);
      border.resize(136, jimp.AUTO);
      avatar.mask(mask, 0, 0);
      avatar.composite(border, 0, 0);
      canvas.blit(avatar, 5, 5);
      canvas.print(fontMedium, 155, 55, `Currently powering up ${this.client.guilds.size} servers`.toUpperCase());
      canvas.print(fontMedium, 155, 75, `serving ${this.client.users.size} Discord users`.toUpperCase());

      const buffer = await canvas.getBufferAsync(jimp.MIME_PNG);
      const embedAttachment = new MessageAttachment(buffer, 'added.png');

      newGuildEmbed
        .attachFiles([ embedAttachment ])
        .setColor('#80F31F')
        .setTitle('Ribbon is here!')
        .setDescription(stripIndents`
          I'm an all-purpose bot and I hope I can make your server better!
          I've got many commands, you can see them all by using \`${guild.settings.get(GuildSettings.prefix)}help\`
          Don't like the prefix? The admins can change my prefix by using \`${guild.settings.get(GuildSettings.prefix)}prefix [new prefix]\`

          **All these commands can also be called by mentioning me instead of using a prefix, for example \`@${this.client.user!.tag} help\`**`
        )
        .setImage('attachment://added.png');

      if (channel) channel.send('', { embed: newGuildEmbed });
    } catch (err) {
      const logChannel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!)!;

      if (isTextChannel(logChannel)) {
        logChannel.send(stripIndents(
          `
            ${this.client.options.owners.map(owner => `<@${owner}>`).join(' and ')}, I failed to say welcome upon joining ${guild.name} (${guild.id})!
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Error Message:** ${err}
          `
        ));
      }
      this.client.console.error(`[${moment().format(MOMENT_LOG_FORMAT)}] Failed to say welcome upon joining ${guild.name} (${guild.id})`);
    }
  }
}