import { GuildSettings } from '@settings/GuildSettings';
import RibbonEmbed from '@structures/RibbonEmbed';
import { ASSET_BASE_PATH, LIB_FOLDER } from '@utils/Constants';
import { setUsersData } from '@utils/FirebaseActions';
import FirebaseStorage from '@utils/FirebaseStorage';
import { isTextChannel } from '@utils/Utils';
import { stripIndents } from 'common-tags';
import { GuildMember, MessageAttachment, TextChannel } from 'discord.js';
import jimp from 'jimp';
import { Event } from 'klasa';
import moment from 'moment';
import { join } from 'path';

export default class GuildMemberAddEvent extends Event {
  async run(member: GuildMember) {
    await Promise.all([ this.sendLeaveMessage(member), this.sendMemberLog(member) ]);
    this.updateUserCount(member);
  }

  private async sendLeaveMessage(member: GuildMember) {
    try {
      const avatar = await jimp.read(member.user.displayAvatarURL({ format: 'png' }));
      const border = await jimp.read(`${ASSET_BASE_PATH}/ribbon/jimp/border.png`);
      const canvas = await jimp.read(500, 150);
      const fontLarge = await jimp.loadFont(join(LIB_FOLDER, 'fonts', 'roboto-large.fnt'));
      const fontMedium = await jimp.loadFont(join(LIB_FOLDER, 'fonts', 'roboto-medium.fnt'));
      const mask = await jimp.read(`${ASSET_BASE_PATH}/ribbon/jimp/mask.png`);
      const channel = member.guild.settings.get(GuildSettings.automessagesLeavemsgChannel) as GuildSettings.automessagesLeavemsgs['channel'];

      avatar.resize(136, jimp.AUTO);
      mask.resize(136, jimp.AUTO);
      border.resize(136, jimp.AUTO);
      avatar.mask(mask, 0, 0);
      avatar.composite(border, 0, 0);
      canvas.blit(avatar, 5, 5);
      canvas.print(fontLarge, 155, 10, 'goodbye'.toUpperCase());
      canvas.print(fontMedium, 160, 60, `there are now ${member.guild.memberCount} members`.toUpperCase());
      canvas.print(fontMedium, 160, 80, `on ${member.guild.name}`.toUpperCase());

      const buffer = await canvas.getBufferAsync(jimp.MIME_PNG);
      const embedAttachment = new MessageAttachment(buffer, 'leaveimg.png');

      const embed = new RibbonEmbed(this.client.user!)
        .attachFiles([ embedAttachment ])
        .setTitle('Member Left 😢')
        .setDescription(`You will be missed __**${member.displayName}**__ (\`${member.id}\`)`)
        .setImage('attachment://leaveimg.png');


      if (channel) {
        channel.send('', { embed });
      }
    } catch (err) {
      const logChannel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!)!;

      if (isTextChannel(logChannel)) {
        logChannel.send(stripIndents(
          `
            ${this.client.options.owners.map(owner => `<@${owner}>`).join(' and ')}, failed to say goodbye to a member!
            **Member:** ${member.user.tag} (${member.id})
            **Guild Data:** ${member.guild.name} (${member.guild.id})
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Error Message:** ${err}
          `
        ));
      }
    }
  }

  private async sendMemberLog(member: GuildMember) {
    try {
      const logOpts = member.guild.settings.get(GuildSettings.loggingMemberlogs) as GuildSettings.loggingMemberlogs;

      if (logOpts.enabled) {
        let memberLogs = logOpts.channel;
        if (!memberLogs) {
          memberLogs = member.guild.channels.find(channel => channel.name === 'member-logs') as TextChannel;
        }

        const memberLogsEmbed = new RibbonEmbed(this.client.user!)
          .setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL({ format: 'png' }))
          .setFooter('User left')
          .setColor('#F4BF42');

        if (memberLogs && memberLogs.postable) {
          logOpts.channel.send('', { embed: memberLogsEmbed });
        }
      }
    } catch (err) {
      const logChannel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!)!;

      if (isTextChannel(logChannel)) {
        logChannel.send(stripIndents(
          `
            ${this.client.options.owners.map(owner => `<@${owner}>`).join(' and ')}, An error sending the member leave memberlog message!
            **Member:** ${member.user.tag} (${member.id})
            **Guild Data:** ${member.guild.name} (${member.guild.id})
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Error Message:** ${err}
          `
        ));
      }
    }
  }

  private updateUserCount(member: GuildMember) {
    try {
      let userCount = FirebaseStorage.users;
      userCount--;

      FirebaseStorage.users = userCount;
      setUsersData(String(userCount));
    } catch (err) {
      const logChannel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!)!;

      if (isTextChannel(logChannel)) {
        logChannel.send(stripIndents(
          `
            ${this.client.options.owners.map(owner => `<@${owner}>`).join(' and ')}, I failed to update Firebase users count!
            **Member:** ${member.user.tag} (${member.id})
            **Guild Data:** ${member.guild.name} (${member.guild.id})
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Error Message:** ${err}
          `
        ));
      }
    }
  }
}