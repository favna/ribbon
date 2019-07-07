/**
 * @file Moderation NewsCommand - Make an announcement to a channel named "announcements" or "news"
 *
 * **Aliases**: `news`
 * @module
 * @category moderation
 * @name announce
 * @example announce Pokemon Switch has released!
 * @param {string} Announcement The announcement you want to make
 */

import { deleteCommandMessages, logModMessage, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildChannel, MessageAttachment, MessageEmbed, Permissions, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';

type NewsArgs = {
  body: string;
};

export default class NewsCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'announce',
      aliases: ['news'],
      group: 'moderation',
      memberName: 'announce',
      description: 'Make an announcement in the news channel',
      format: 'Announcement',
      examples: ['announce John Appleseed reads the news'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'body',
          prompt: 'What do you want me to announce?',
          type: 'string',
        }
      ],
    });
  }

  @shouldHavePermission('ADMINISTRATOR', true)
  public run (msg: CommandoMessage, { body }: NewsArgs) {
    try {
      let announce = body;
      let newsChannel: TextChannel;

      const announceEmbed = new MessageEmbed();
      const modlogChannel = msg.guild.settings.get('modlogchannel', null);

      if (msg.guild.settings.get('announcechannel')) {
        newsChannel = msg.guild.channels.find((c: GuildChannel) => c.id === msg.guild.settings.get('announcechannel')) as TextChannel;
      } else {
        msg.guild.channels.find((c: GuildChannel) => c.name === 'announcements')
          ? (newsChannel = msg.guild.channels.find((c: GuildChannel) => c.name === 'announcements') as TextChannel)
          : (newsChannel = msg.guild.channels.find((c: GuildChannel) => c.name === 'news') as TextChannel);
      }

      if (!newsChannel) throw new Error('nochannel');
      if (!(newsChannel.permissionsFor(msg.guild.me!) as Readonly<Permissions>).has(['SEND_MESSAGES', 'VIEW_CHANNEL'])) throw new Error('noperms');

      if (announce.slice(0, 4) !== 'http') announce = `${body.slice(0, 1).toUpperCase()}${body.slice(1)}`;
      if (msg.attachments.first() && (msg.attachments.first() as MessageAttachment).url) announce += `\n${(msg.attachments.first() as MessageAttachment).url}`;

      announceEmbed
        .setColor('#AAEFE6')
        .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
        .setDescription(stripIndents`
          **Action:** Made an announcement
          **Content:** ${announce}`
        )
        .setTimestamp();

      newsChannel.send(announce);

      if (msg.guild.settings.get('modlogs', true)) {
        logModMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, announceEmbed);
      }

      deleteCommandMessages(msg, this.client);

      return msg.embed(announceEmbed);
    } catch (err) {
      if (/(?:nochannel)/i.test(err.toString())) {
        return msg.reply(oneLine`
          there is no channel for me to make the announcement in.
          Either create a channel named either \`announcements\` or \`news\`
          or use the \`${msg.guild.commandPrefix}setannounce\` command to set a custom channel`
        );
      }
      if (/(?:noperms)/i.test(err.toString())) {
        return msg.reply(oneLine`
          I do not have permission to send messages to the announcements channel.
          Give me permissions in either your \`announcements\` or \`news\` channel,
          or if you used the \`${msg.guild.commandPrefix}setannounce\` command allow me in your custom channel.`
        );
      }

      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`warn\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author!.tag} (${msg.author!.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Input:** ${body}
        **Error Message:** ${err}`
      );

      return msg.reply(oneLine`
        an unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
        Want to know more about the error?
        Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `
      );
    }
  }
}
