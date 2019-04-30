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

import { DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { stringify } from 'awesome-querystring';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import fetch from 'node-fetch';

type ITunesArgs = {
    music: string;
};

export default class ITunesCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'itunes',
            aliases: ['apple', 'tunes'],
            group: 'searches',
            memberName: 'itunes',
            description: 'Search iTunes for music tracks',
            examples: ['itunes dash berlin symphony'],
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

    public async run (msg: CommandoMessage, { music }: ITunesArgs) {
        try {
            const apple = await fetch(
                `https://itunes.apple.com/search?${stringify({
                    country: 'US',
                    entity: 'song',
                    explicit: 'yes',
                    lang: 'en_us',
                    limit: 5,
                    media: 'music',
                    term: music,
                }).replace(/%2B/gm, '+')}`
            );
            const tune = await apple.json();
            const song = tune.resultCount >= 1 ? tune.results[0] : null;
            const tunesEmbed = new MessageEmbed();

            if (!song) throw new Error('nosong');

            tunesEmbed
                .setThumbnail(song.artworkUrl100)
                .setTitle(song.trackName)
                .setURL(song.trackViewUrl)
                .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
                .addField('Artist', `[${song.artistName}](${song.artistViewUrl})`, true)
                .addField('Collection', `[${song.collectionName}](${song.collectionViewUrl})`, true)
                .addField('Collection Price (USD)', `$${song.collectionPrice}`, true)
                .addField('Track price (USD)', `$${song.trackPrice}`, true)
                .addField('Track Release Date', moment(song.releaseDate).format('MMMM Do YYYY'), true)
                .addField('# Tracks in Collection', song.trackCount, true)
                .addField('Primary Genre', song.primaryGenreName, true)
                .addField('Preview', `[Click Here](${song.previewUrl})`, true);

            deleteCommandMessages(msg, this.client);

            return msg.embed(tunesEmbed);
        } catch (err) {

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
                **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }
}
