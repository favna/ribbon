import { TextChannel, Role } from 'discord.js';
import { KlasaUser } from 'klasa';
import { SayData } from '@typings/General';

export namespace GuildSettings {
  export type automessage = {
    channel: TextChannel;
    enabled: boolean;
  };
  export type automessagesJoinmsgs = automessage;
  export type automessagesLeavemsgs = automessage;
  export type loggingMemberlogs = automessage;
  export type loggingModlogs = automessage;

  export type saydata = SayData;
  export type deleteCommand = boolean;
  export type unknownMessages = boolean;
  export type automodBadwords = {
    enabled: boolean;
    words: string[];
  };
  export type automodDuptext = {
    enabled: boolean;
    within: number;
    equals: number;
    distance: number;
  };
  export type automodCaps = {
    enabled: boolean;
    threshold: number;
    minLength: number;
  };
  export type automodEmojis = {
    enabled: boolean;
    threshold: number;
    minLength: number;
  };
  export type automodMentions = {
    enabled: boolean;
    threshold: number;
  };
  export type automod = {
    badwords: automodBadwords;
    duptext: automodDuptext;
    caps: automodCaps;
    emojis: automodEmojis;
    mentions: automodMentions;
    invites: boolean;
    links: boolean;
    enabled: boolean;
    filterRoles: string[];
  };
  export type casino = {
    lowerLimit: number;
    upperLimit: number;
  };
  export type moderation = {
    announcementsChannel: TextChannel;
    defaultRole: Role;
    muteRole: Role;
    selfRoles: Role[];
    unknownMessages: boolean;
  };
  export type automessages = {
    joinmsgs: automessagesJoinmsgs;
    leavemsgs: automessagesLeavemsgs;
  };
  export type logging = {
    memberlogs: loggingMemberlogs;
    modlogs: loggingModlogs;
  };
  export type music = {
    defaultVolume: number;
    maxLength: number;
    maxSongs: number;
  };
  export type twitch = {
    channel: TextChannel;
    enabled: boolean;
    users: KlasaUser[];
  };


  // Klasa Build-Ins
  export const prefix = 'prefix';

  // Parent groups
  export const saydata = 'saydata';
  export const deleteCommand = 'deleteCommand';
  export const unknownMessages = 'unknownMessages';
  export const automod = 'automod';
  export const casino = 'casino';
  export const moderation = 'moderation';
  export const automessages = 'automessages';
  export const logging = 'logging';
  export const music = 'music';
  export const twitch = 'twitch';

  // Property groups
  export const automodBadwords = 'automod.badwords';
  export const autmodDuptext = 'automod.duptext';
  export const automodCaps = 'automod.caps';
  export const automodEmojis = 'automod.emojis';
  export const autmodMentions = 'automod.mentions';
  export const automessagesJoinmsgs = 'automessages.joinmsgs';
  export const automessagesLeavemsgs = 'automessages.leavemsgs';
  export const loggingMemberlogs = 'logging.memberlogs';
  export const loggingModlogs = 'logging.modlogs';

  // Properties
  export const automodBadwordsEnabled = 'automod.badwords.enabled';
  export const automodBadwordsWords = 'automod.badwords.words';
  export const automodDuptextEnabled = 'automod.duptext.enabled';
  export const automodDuptextWithin = 'automod.duptext.within';
  export const automodDuptextEquals = 'automod.duptext.equals';
  export const automodDuptextDistance = 'automod.duptext.distance';
  export const automodCapsEnabled = 'automod.caps.enabled';
  export const automodCapsThreshold = 'automod.caps.threshold';
  export const automodCapsMinlength = 'automod.caps.minLength';
  export const automodEmojisEnabled = 'automod.emojis.enabled';
  export const automodEmojisThreshold = 'automod.emojis.threshold';
  export const automodEmojisMinlength = 'automod.emojis.minLength';
  export const automodMentionsEnabled = 'automod.mentions.enabled';
  export const automodMentionsThreshold = 'automod.mentions.threshold';
  export const automodLinks = 'automod.links';
  export const automodInvites = 'automod.invites';
  export const automodEnabled = 'automod.enabled';
  export const automodFilterRoles = 'automod.filterRoles';

  export const casinoLowerLimit = 'casino.lowerLimit';
  export const casinoUpperLimit = 'casino.upperLimit';

  export const moderationAnnouncementsChannel = 'moderation.announcementsChannel';
  export const moderationDefaultRole = 'moderation.defaultRole';
  export const moderationMuteRole = 'moderation.muteRole';
  export const moderationSelfRoles = 'moderation.selfRoles';
  export const moderationUnknownMessages = 'moderation.unknownMessages';

  export const automessagesJoinmsgChannel = 'automessages.joinmsgs.channel';
  export const automessagesJoinmsgEnabled = 'automessages.joinmsgs.enabled';
  export const automessagesLeavemsgChannel = 'automessages.leavemsgs.channel';
  export const automessagesLeavemsgEnabled = 'automessages.leavemsgs.enabled';

  export const loggingMemberlogsChannel = 'logging.memberlogs.channel';
  export const loggingMemberlogsEnabled = 'logging.memberlogs.enabled';
  export const loggingModlogsChannel = 'logging.modlogs.channel';
  export const loggingModlogsEnabled = 'logging.modlogs.enabled';

  export const musicDefaultVolume = 'music.defaultVolume';
  export const musicMaxLength = 'music.maxLength';
  export const musicMaxSongs = 'music.maxSongs';

  export const twitchChannel = 'twitch.channel';
  export const twitchEnabled = 'twitch.enabled';
  export const twitchUsers = 'twitch.users';
}