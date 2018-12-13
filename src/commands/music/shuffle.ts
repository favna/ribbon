/**
 * @file Music ShuffleCommand - Shuffles the current queue
 *
 * Shuffles using a [modern version of the Fisher-Yates shuffle
 *     algorithm](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle#The_modern_algorithm)
 *
 * **Aliases**: `remix`, `mixtape`
 * @module
 * @category music
 * @name queue
 * @example queue 2
 */

import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage, util } from 'discord.js-commando';
import { deleteCommandMessages, IMusicCommand, IMusicQueue, Song, startTyping, stopTyping } from '../../components';

export default class ShuffleCommand extends Command {
    private songQueue: Map<string, IMusicQueue>;

    constructor (client: CommandoClient) {
        super(client, {
            name: 'shuffle',
            aliases: ['remix', 'mixtape'],
            group: 'music',
            memberName: 'shuffle',
            description: 'Shuffles the current queue of songs',
            details: 'Shuffles using a [modern version of the Fisher-Yates shuffle algorithm](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle#The_modern_algorithm)',
            examples: ['shuffle'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
        });
    }

    get queue () {
        if (!this.songQueue) {
            this.songQueue = (this.client.registry.resolveCommand('music:play') as IMusicCommand).queue;
        }

        return this.songQueue;
    }

    public run (msg: CommandoMessage) {
        const queue = this.queue.get(msg.guild.id);
        if (!queue) return msg.reply('there are no songs in the queue. Why not put something in my jukebox?');
        if (queue.songs.length <= 2) return msg.reply('cannot shuffle a queue smaller than 2 tracks. Why not queue some more tunes?');

        startTyping(msg);
        const currentPlaying = queue.songs[0];

        queue.songs.shift();
        queue.songs = this.shuffle(queue.songs);
        queue.songs.unshift(currentPlaying);

        const currentSong = queue.songs[0];
        const currentTime = currentSong.dispatcher ? currentSong.dispatcher.streamTime / 1000 : 0;
        const embed = new MessageEmbed();
        const paginated = util.paginate(queue.songs, 1, Math.floor(10));

        embed
            .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
            .setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL({ format: 'png' }))
            .setImage(currentSong.thumbnail)
            .setDescription(stripIndents`
                __**First 10 songs in the queue**__${paginated.items
                .map((song: Song) =>
                    `**-** ${
                        !isNaN(song.id)
                            ? `${song.name} (${song.lengthString})`
                            : `[${song.name}](${`https://www.youtube.com/watch?v=${song.id}`})`
                        } (${song.lengthString})`
                ).join('\n')}
                ${paginated.maxPage > 1 ? `\nUse ${msg.usage()} to view a specific page.\n` : ''}

                **Now playing:** ${
                !isNaN(currentSong.id)
                    ? `${currentSong.name}`
                    : `[${currentSong.name}](${`https://www.youtube.com/watch?v=${currentSong.id}`})`
                }
                ${oneLine`
                    **Progress:**
                    ${!currentSong.playing ? 'Paused: ' : ''}${Song.timeString(currentTime)} / ${currentSong.lengthString}
                    (${currentSong.timeLeft(currentTime)} left)
                `}
            `);

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(embed);
    }

    private shuffle (a: Song[]) {
        for (let i = a.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));

            [a[i], a[j]] = [a[j], a[i]];
        }

        return a;
    }
}
