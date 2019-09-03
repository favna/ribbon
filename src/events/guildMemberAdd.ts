import { ASSET_BASE_PATH } from '@components/Constants';
import { setUsersData } from '@components/FirebaseActions';
import FirebaseStorage from '@components/FirebaseStorage';
import { isTextChannel, parseOrdinal } from '@components/Utils';
import { stripIndents } from 'common-tags';
import { GuildMember, MessageAttachment, MessageEmbed, TextChannel } from 'discord.js';
import jimp from 'jimp';
import { Event } from 'klasa';
import moment from 'moment';
import path from 'path';
import { GuildSettings } from '@root/RibbonTypes';
import RibbonEmbed from '@root/components/RibbonEmbed';

export default class GuildMemberAddEvent extends Event {
  async run(member: GuildMember) {
    let newMemberEmbed = new RibbonEmbed(this.client.user!)
      .setTitle('NEW MEMBER!')
      .setDescription(`Please give a warm welcome to __**${member.displayName}**__  (\`${member.id}\`)`);

    newMemberEmbed = this.assignDefaultRole(member, newMemberEmbed);
    await Promise.all([ this.sendJoinMessage(member, newMemberEmbed), this.sendMemberLog(member) ]);
    this.updateUserCount(member);
  }

  private assignDefaultRole(member: GuildMember, embed: MessageEmbed) {
    const guild = member.guild;
    const defaultRole = guild.settings.get(GuildSettings.moderationDefaultRole) as GuildSettings.moderation['defaultRole'];
    if (defaultRole && member.manageable) {
      member.roles.add(defaultRole);
      embed.setDescription(`Automatically assigned the role ${defaultRole.name} to this member`);
    }

    return embed;
  }

  private async sendJoinMessage(member: GuildMember, embed: MessageEmbed) {
    try {
      const avatar = await jimp.read(member.user.displayAvatarURL({ format: 'png' }));
      const border = await jimp.read(`${ASSET_BASE_PATH}/ribbon/jimp/border.png`);
      const canvas = await jimp.read(500, 150);
      const fontLarge = await jimp.loadFont(path.join(__dirname, '../data/fonts/roboto-large.fnt'));
      const fontMedium = await jimp.loadFont(path.join(__dirname, '../data/fonts/roboto-medium.fnt'));
      const mask = await jimp.read(`${ASSET_BASE_PATH}/ribbon/jimp/mask.png`);
      const channel = member.guild.settings.get(GuildSettings.automessagesJoinmsgChannel) as GuildSettings.automessagesJoinmsgs['channel'];

      avatar.resize(136, jimp.AUTO);
      mask.resize(136, jimp.AUTO);
      border.resize(136, jimp.AUTO);
      avatar.mask(mask, 0, 0);
      avatar.composite(border, 0, 0);
      canvas.blit(avatar, 5, 5);
      canvas.print(fontLarge, 155, 10, 'welcome'.toUpperCase());
      canvas.print(fontMedium, 160, 60, `you are the ${parseOrdinal(member.guild.memberCount)} member`.toUpperCase());
      canvas.print(fontMedium, 160, 80, `of ${member.guild.name}`.toUpperCase());

      const buffer = await canvas.getBufferAsync(jimp.MIME_PNG);
      const embedAttachment = new MessageAttachment(buffer, 'joinimg.png');

      embed
        .attachFiles([ embedAttachment ])
        .setImage('attachment://joinimg.png');

      if (channel) {
        channel.send(`Welcome <@${member.id}> 🎗️!`, { embed });
      }
    } catch (err) {
      const logChannel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!)!;

      if (isTextChannel(logChannel)) {
        logChannel.send(stripIndents(
          `
            ${this.client.options.owners.map(owner => `<@${owner}>`).join(' and ')}, failed to welcome a member!
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
          .setFooter('User joined');

        if (memberLogs && memberLogs.postable) {
          logOpts.channel.send('', { embed: memberLogsEmbed });
        }
      }
    } catch (err) {
      const logChannel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!)!;

      if (isTextChannel(logChannel)) {
        logChannel.send(stripIndents(
          `
            ${this.client.options.owners.map(owner => `<@${owner}>`).join(' and ')}, An error sending the member join memberlog message!
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
      userCount++;

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