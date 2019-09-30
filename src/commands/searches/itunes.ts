/**
 * @file Searches iTunesCommand - Search iTunes for music tracks
 *
 * **Aliases**: `apple`, `tunes`
 * @module
 * @category searches
 * @name itunes
 * @example itunes dash berlin symphony
 * @param {string} TrackQuery The music track to look up
 */

import { CollectorTimeout, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { clientHasManageMessages, deleteCommandMessages, injectNavigationEmotes, navigationReactionFilter } from '@components/Utils';
import { stringify } from '@favware/querystring';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed, MessageReaction, ReactionCollector, TextChannel, User } from 'discord.js';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import fetch from 'node-fetch';
import { } from 'RibbonTypes';

interface AppleTunesArgs {
  music: string;
  hasManageMessages: boolean;
  position: number;
}

export default class ITunesCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'itunes',
      aliases: [ 'apple', 'tunes' ],
      group: 'searches',
      memberName: 'itunes',
      description: 'Search iTunes for music tracks',
      examples: [ 'itunes dash berlin symphony' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'music',
          prompt: 'What track should I search on iTunes?',
          type: 'string',
          parse: (p: string) => p.replace(/ /gm, '+'),
        }
      ],
    });
  }

  @clientHasManageMessages()
  public async run(msg: CommandoMessage, { music, hasManageMessages, position = 0 }: AppleTunesArgs) {
    try {
      const request = await fetch(`https://itunes.apple.com/search?${stringify({
        country: 'US',
        entity: 'song',
        explicit: 'yes',
        lang: 'en_us',
        limit: hasManageMessages ? 10 : 1,
        media: 'music',
        term: music,
      }).replace(/%2B/gm, '+')}`);
      const tracks: iTunesResult = await request.json();
      const color = msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR;

      if (!tracks.resultCount) throw new Error('nosong');

      let currentSong = tracks.results[position];
      let tunesEmbed = this.prepMessage(
        color, currentSong, tracks.resultCount, position, hasManageMessages
      );

      deleteCommandMessages(msg, this.client);

      const message = await msg.embed(tunesEmbed) as CommandoMessage;

      if (tracks.resultCount > 1 && hasManageMessages) {
        injectNavigationEmotes(message);
        new ReactionCollector(message, navigationReactionFilter, { time: CollectorTimeout.five })
          .on('collect', (reaction: MessageReaction, user: User) => {
            if (!this.client.botIds.includes(user.id)) {
              if (reaction.emoji.name === '➡') position++;
              else position--;
              if (position >= tracks.resultCount) position = 0;
              if (position < 0) position = tracks.resultCount - 1;
              currentSong = tracks.results[position];
              tunesEmbed = this.prepMessage(
                color, currentSong, tracks.resultCount, position, hasManageMessages
              );
              message.edit('', tunesEmbed);
              message.reactions.get(reaction.emoji.name)!.users.remove(user);
            }
          });
      }

      return null;
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      if (/(?:nosong)/i.test(err.toString())) {
        return msg.reply(`no song found for \`${music.replace(/\+/g, ' ')}\``);
      }
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`itunes\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author!.tag} (${msg.author!.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Input:** ${music}
        **Error Message:** ${err}`);

      return msg.reply(oneLine`
        an unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
        Want to know more about the error?
        Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command`);
    }
  }

  private prepMessage(
    color: string, song: iTunesData, songResultsLength: number,
    position: number, hasManageMessages: boolean
  ): MessageEmbed {
    return new MessageEmbed()
      .setThumbnail(song.artworkUrl100)
      .setTitle(song.trackName)
      .setURL(song.trackViewUrl)
      .setColor(color)
      .setFooter(hasManageMessages ? `Result ${position + 1} of ${songResultsLength}` : '')
      .addField('Artist', `[${song.artistName}](${song.artistViewUrl})`, true)
      .addField('Collection', `[${song.collectionName}](${song.collectionViewUrl})`, true)
      .addField('Collection Price (USD)', `$${song.collectionPrice}`, true)
      .addField('Track price (USD)', `$${song.trackPrice}`, true)
      .addField('Track Release Date', moment(song.releaseDate).format('MMMM Do YYYY'), true)
      .addField('# Tracks in Collection', song.trackCount, true)
      .addField('Primary Genre', song.primaryGenreName, true)
      .addField('Preview', `[Click Here](${song.previewUrl})`, true);
  }
}