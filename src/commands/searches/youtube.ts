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

import { DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages, startTyping, stopTyping } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';
import { stringify } from 'awesome-querystring';
import moment from 'moment';
import fetch from 'node-fetch';

export default class YouTubeCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'youtube',
            aliases: ['yt', 'tube', 'yts'],
            group: 'searches',
            memberName: 'youtube',
            description: 'Find videos on youtube',
            format: 'VideoName',
            examples: ['youtube RWBY Volume 4'],
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

    public async run (msg: CommandoMessage, { query }: { query: string }) {
        try {
            startTyping(msg);

            const tubeSearch = await fetch(`https://www.googleapis.com/youtube/v3/search?${stringify({
                    key: process.env.GOOGLE_API_KEY!,
                    maxResults: '1',
                    part: 'snippet',
                    q: query,
                    type: 'video',
                })}`
            );
            const videoList = await tubeSearch.json();
            const video = videoList.items[0];
            const videoEmbed = new MessageEmbed();

            deleteCommandMessages(msg, this.client);
            if (msg.content.split(' ')[0].slice(msg.guild ? msg.guild.commandPrefix.length : this.client.commandPrefix.length) === 'yts') {
                stopTyping(msg);

                return msg.say(`https://www.youtube.com/watch?v=${video.id.videoId}`);
            }

            videoEmbed
                .setTitle(`Youtube Search Result for \`${query}\``)
                .setURL(`https://www.youtube.com/watch?v=${video.id.videoId}`)
                .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
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
}
