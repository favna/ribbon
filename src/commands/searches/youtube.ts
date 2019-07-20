/**
 * @file Searches YouTubeCommand - Find a video on YouTube
 *
 * By default returns MessageEmbed. use `yts` to return just the URL and have in-client playback
 *
 * **Aliases**: `yt`, `tube`, `yts`
 * @module
 * @category searches
 * @name youtube
 * @example youtube Voldemort Origins of the heir
 * @param {string} VideoQuery Video to find on YouTube
 */

import { CollectorTimeout, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { clientHasManageMessages, deleteCommandMessages, injectNavigationEmotes, navigationReactionFilter } from '@components/Utils';
import { stringify } from '@favware/querystring';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, MessageReaction, ReactionCollector, User } from 'awesome-djs';
import { stripIndents } from 'common-tags';
import moment from 'moment';
import fetch from 'node-fetch';
import { YoutubeResultList, YoutubeVideoSnippetType } from 'RibbonTypes';

type YoutubeArgs = {
  query: string;
  hasManageMessages: boolean;
  position: number;
};

export default class YouTubeCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'youtube',
      aliases: [ 'yt', 'tube', 'yts' ],
      group: 'searches',
      memberName: 'youtube',
      description: 'Find videos on youtube',
      format: 'VideoName',
      examples: [ 'youtube RWBY Volume 4' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'query',
          prompt: 'Which video do you want to find?',
          type: 'string',
        }
      ],
    });
  }

  @clientHasManageMessages()
  public async run(msg: CommandoMessage, { query, hasManageMessages, position = 0 }: YoutubeArgs) {
    try {
      const tubeSearch = await fetch(`https://www.googleapis.com/youtube/v3/search?${
        stringify({
          key: process.env.GOOGLE_API_KEY!,
          maxResults: '10',
          part: 'snippet',
          q: query,
          type: 'video',
        })}`);
      const videoList: YoutubeResultList = await tubeSearch.json();
      const color = msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR;
      const commandPrefix = msg.guild ? msg.guild.commandPrefix.length : this.client.commandPrefix.length;
      const replyShouldBeSimple = msg.content.split(' ')[0].slice(commandPrefix) === 'yts';
      const amountOfVideos = videoList.items.length;

      let currentVideo = videoList.items[position];
      let currentVideoId = videoList.items[position].id.videoId;
      let videoEmbed = this.prepMessage(
        color, query, currentVideo.snippet, currentVideoId,
        amountOfVideos, position, hasManageMessages
      );

      deleteCommandMessages(msg, this.client);

      const message = replyShouldBeSimple
        ? await msg.say(stripIndents`
                    https://www.youtube.com/watch?v=${currentVideoId}
                    ${hasManageMessages ? `__*Result ${position + 1} of ${amountOfVideos}*__` : ''}`) as CommandoMessage
        : await msg.embed(videoEmbed, `https://www.youtube.com/watch?v=${currentVideoId}`) as CommandoMessage;

      if (amountOfVideos > 1 && hasManageMessages) {
        injectNavigationEmotes(message);
        new ReactionCollector(message, navigationReactionFilter, { time: CollectorTimeout.five })
          .on('collect', (reaction: MessageReaction, user: User) => {
            if (!this.client.userid.includes(user.id)) {
              if (reaction.emoji.name === '➡') position++;
              else position--;
              if (position >= amountOfVideos) position = 0;
              if (position < 0) position = amountOfVideos - 1;
              currentVideo = videoList.items[position];
              currentVideoId = videoList.items[position].id.videoId;
              videoEmbed = this.prepMessage(
                color, query, currentVideo.snippet, currentVideoId,
                amountOfVideos, position, hasManageMessages
              );
              if (replyShouldBeSimple) {
                message.edit(stripIndents`
                  https://www.youtube.com/watch?v=${currentVideoId}${hasManageMessages ? `__*Result ${position + 1} of ${amountOfVideos}*__` : ''}`
                );
              } else {
                message.edit(`https://www.youtube.com/watch?v=${currentVideoId}`, videoEmbed);
              }
              message.reactions.get(reaction.emoji.name)!.users.remove(user);
            }
          });
      }

      return null;
    } catch (err) {
      return msg.reply(`no videos found for \`${query}\``);
    }
  }

  private prepMessage(
    color: string, query: string, video: YoutubeVideoSnippetType, videoId: string,
    videosLength: number, position: number, hasManageMessages: boolean
  ): MessageEmbed {
    return new MessageEmbed()
      .setTitle(`Youtube Search Result for \`${query}\``)
      .setURL(`https://www.youtube.com/watch?v=${videoId}`)
      .setColor(color)
      .setImage(video.thumbnails.default.url)
      .setFooter(hasManageMessages ? `Result ${position + 1} of ${videosLength}` : '')
      .addField('Title', video.title, true)
      .addField('URL', `[Click Here](https://www.youtube.com/watch?v=${videoId})`, true)
      .addField('Channel', `[${video.channelTitle}](https://www.youtube.com/channel/${video.channelId})`, true)
      .addField('Published At', moment(video.publishedAt).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z'), false)
      .addField('Description', video.description ? video.description : 'No Description', false);
  }
}