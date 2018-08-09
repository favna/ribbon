/**
 * @file Searches YouTubeCommand - Find a video on YouTube  
 * By default returns MessageEmbed. use `yts` to return just the URL and have in-client playback  
 * **Aliases**: `yt`, `tube`, `yts`
 * @module
 * @category searches
 * @name youtube
 * @example youtube Voldemort Origins of the heir
 * @param {StringResolvable} VideoQuery Video to find on YouTube
 * @returns {MessageEmbed} Title, Channel, Publication Date and Description of the video
 */

const fetch = require('node-fetch'),
  moment = require('moment'),
  querystring = require('querystring'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class YouTubeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'youtube',
      memberName: 'youtube',
      group: 'searches',
      aliases: ['yt', 'tube', 'yts'],
      description: 'Find videos on youtube',
      format: 'VideoName',
      examples: ['youtube RWBY Volume 4'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'query',
          prompt: 'Which video do you want to find?',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, {query}) {
    try {
      startTyping(msg);

      const tubeSearch = await fetch(`https://www.googleapis.com/youtube/v3/search?${querystring.stringify({
          key: process.env.googleapikey,
          part: 'snippet',
          maxResults: '1',
          q: query,
          type: 'video'
        })}`),
        videoList = await tubeSearch.json(),
        video = videoList.items[0],
        videoEmbed = new MessageEmbed();

      deleteCommandMessages(msg, this.client);
      if (msg.content.split(' ')[0].slice(msg.guild ? msg.guild.commandPrefix.length : this.client.commandPrefix.length) === 'yts') {
        stopTyping(msg);

        return msg.say(`https://www.youtube.com/watch?v=${video.id.videoId}`);
      }

      videoEmbed
        .setTitle(`Youtube Search Result for \`${query}\``)
        .setURL(`https://www.youtube.com/watch?v=${video.id.videoId}`)
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setImage(video.snippet.thumbnails.high.url)
        .addField('Title', video.snippet.title, true)
        .addField('URL', `[Click Here](https://www.youtube.com/watch?v=${video.id.videoId})`, true)
        .addField('Channel', `[${video.snippet.channelTitle}](https://www.youtube.com/channel/${video.snippet.channelId})`, true)
        .addField('Published At', moment(video.snippet.publishedAt).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z'), false)
        .addField('Description', video.snippet.description ? video.snippet.description : 'No Description', false);
      stopTyping(msg);

      return msg.embed(videoEmbed, `https://www.youtube.com/watch?v=${video.id.videoId}`);
    } catch (err) {
      stopTyping(msg);

      return msg.reply(`no videos found for \`${query}\``);
    }
  }
};