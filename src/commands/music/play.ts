/**
 * @file Music PlaySongCommand - Starts playing music
 *
 * You need to be in a voice channel before you can use this command and Ribbon needs to be allowed to join that channel as well as speak in it.
 * If music is already playing this will add to the queue or otherwise it will join your voice channel and start playing.
 * There are 4 ways to queue songs.
 * 1. YouTube Search Query
 * 2. YouTube video URL
 * 3. YouTube playlist URL
 * 4. YouTube video ID
 *
 * **Aliases**: `add`, `enqueue`, `start`, `join`
 * @module
 * @category music
 * @name play
 * @example play
 * @param {StringResolvable} Video One of the options linking to a video to play
 */

import { oneLine, stripIndents } from 'common-tags';
import {
    Guild,
    GuildChannel,
    Message,
    TextChannel,
    Util,
    VoiceChannel,
} from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import fetch from 'node-fetch';
import * as ytdl from 'ytdl-core';
import {
    deleteCommandMessages,
    IMusicCommand,
    IQueue,
    parse,
    Song,
    startTyping,
    stopTyping,
    stringify,
} from '../../components';

export default class PlaySongCommand extends Command {
    public queue: Map<any, any>;
    private queueVotes: any;

    constructor(client: CommandoClient) {
        super(client, {
            name: 'play',
            aliases: ['add', 'enqueue', 'start', 'join'],
            group: 'music',
            memberName: 'play',
            description: 'Adds a song to the queue',
            format: 'YoutubeURL|YoutubeVideoSearch',
            examples: ['play {youtube video to play}'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'videoQuery',
                    prompt: 'what music would you like to listen to?',
                    type: 'string',
                    parse: (p: string) => p.replace(/<(.+)>/g, '$1'),
                },
            ],
        });

        this.queue = new Map();
    }

    get votes() {
        if (!this.queueVotes) {
            this.queueVotes = (this.client.registry.resolveCommand(
                'music:skip'
            ) as IMusicCommand).votes;
        }

        return this.queueVotes;
    }

    public async run(
        msg: CommandoMessage,
        { videoQuery }: { videoQuery: string }
    ) {
        startTyping(msg);
        const queue = this.queue.get(msg.guild.id);

        let voiceChannel;

        if (!queue) {
            voiceChannel = msg.member.voice.channel;
            if (!voiceChannel) {
                deleteCommandMessages(msg, this.client);
                stopTyping(msg);

                return msg.reply(
                    'please join a voice channel before issuing this command.'
                );
            }

            const permissions = voiceChannel.permissionsFor(msg.client.user);

            if (!permissions.has('CONNECT')) {
                deleteCommandMessages(msg, this.client);
                stopTyping(msg);

                return msg.reply(
                    "I don't have permission to join your voice channel. Fix your server's permissions"
                );
            }
            if (!permissions.has('SPEAK')) {
                deleteCommandMessages(msg, this.client);
                stopTyping(msg);

                return msg.reply(
                    "I don't have permission to speak in your voice channel. Fix your server's permissions"
                );
            }
        } else if (!queue.voiceChannel.members.has(msg.author.id)) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(
                'please join a voice channel before issuing this command.'
            );
        }

        const statusMsg = (await msg.reply(
            'obtaining video details...'
        )) as Message;

        if (
            videoQuery.match(
                /^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/
            )
        ) {
            await statusMsg.edit(
                'obtaining playlist videos... (this can take a while for long lists)'
            );

            const playlist = this.getPlaylistID(videoQuery);
            const videos = await this.getPlaylistVideos(playlist);

            if (!queue) {
                const listQueue: IQueue = {
                    textChannel: msg.channel as GuildChannel,
                    voiceChannel,
                    connection: null,
                    songs: [],
                    volume: msg.guild.settings.get(
                        'defaultVolume',
                        process.env.DEFAULT_VOLUME
                    ),
                };

                this.queue.set(msg.guild.id, listQueue);

                statusMsg.edit(`${msg.author}, joining your voice channel...`);
                try {
                    listQueue.connection = await listQueue.voiceChannel.join();
                } catch (error) {
                    this.queue.delete(msg.guild.id);
                    statusMsg.edit(
                        `${msg.author}, unable to join your voice channel.`
                    );
                    stopTyping(msg);

                    return null;
                }
            }

            for (const video of videos) {
                await this.handlePlaylist(
                    video,
                    playlist,
                    queue,
                    voiceChannel,
                    msg,
                    statusMsg
                );
            }

            if (!this.queue.get(msg.guild.id).playing) {
                this.play(msg.guild, this.queue.get(msg.guild.id).songs[0]);
            }

            return null;
        }
        try {
            const video = await this.getVideoID(videoQuery);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return this.handleVideo(video, queue, voiceChannel, msg, statusMsg);
        } catch (error) {
            try {
                const videoId = await this.getVideoByName(videoQuery);

                if (!videoId) {
                    return statusMsg.edit(
                        `${msg.author}, there were no search results.`
                    );
                }

                const video = await this.getVideo(videoId);
                deleteCommandMessages(msg, this.client);

                return this.handleVideo(
                    video,
                    queue,
                    voiceChannel,
                    msg,
                    statusMsg
                );
            } catch (err) {
                deleteCommandMessages(msg, this.client);
                stopTyping(msg);

                return statusMsg.edit(
                    `${
                        msg.author
                    }, couldn't obtain the search result video's details.`
                );
            }
        }
    }

    private async handleVideo(
        video: any,
        queue: IQueue,
        voiceChannel: VoiceChannel,
        msg: CommandoMessage,
        statusMsg: Message
    ): Promise<any> {
        if (video.durationSeconds === 0) {
            statusMsg.edit(`${msg.author}, you can't play live streams.`);
            stopTyping(msg);

            return null;
        }

        if (!queue) {
            queue = {
                textChannel: msg.channel as TextChannel,
                voiceChannel,
                connection: null,
                songs: [],
                volume: msg.guild.settings.get(
                    'defaultVolume',
                    process.env.DEFAULT_VOLUME
                ),
            };
            this.queue.set(msg.guild.id, queue);

            const result = this.addSong(msg, video);
            const resultMessage = {
                author: {
                    iconURL: msg.author.displayAvatarURL({ format: 'png' }),
                    name: `${msg.author.tag} (${msg.author.id})`,
                },
                color: 3447003,
                description: result,
            };

            if (!result.startsWith('👍')) {
                this.queue.delete(msg.guild.id);
                statusMsg.edit('', { embed: resultMessage });
                stopTyping(msg);

                return null;
            }

            statusMsg.edit(`${msg.author}, joining your voice channel...`);
            try {
                queue.connection = await queue.voiceChannel.join();
                this.play(msg.guild, queue.songs[0]);
                statusMsg.delete();
                stopTyping(msg);

                return null;
            } catch (error) {
                this.queue.delete(msg.guild.id);
                statusMsg.edit(
                    `${msg.author}, unable to join your voice channel.`
                );
                stopTyping(msg);

                return null;
            }
        } else {
            const result = this.addSong(msg, video);
            const resultMessage = {
                author: {
                    iconURL: msg.author.displayAvatarURL({ format: 'png' }),
                    name: `${msg.author.tag} (${msg.author.id})`,
                },
                color: 3447003,
                description: result,
            };

            statusMsg.edit('', { embed: resultMessage });
            stopTyping(msg);

            return null;
        }
    }

    private async handlePlaylist(
        video: any,
        playlist: any,
        queue: any,
        voiceChannel: VoiceChannel,
        msg: CommandoMessage,
        statusMsg: Message
    ): Promise<any> {
        if (video.durationSeconds === 0) {
            statusMsg.edit(
                `${
                    msg.author
                }, looks like that playlist has a livestream and I cannot play livestreams`
            );
            stopTyping(msg);

            return null;
        }
        const result = this.addSong(msg, video);
        const resultMessage = {
            author: {
                iconURL: msg.author.displayAvatarURL({ format: 'png' }),
                name: `${msg.author.tag} (${msg.author.id})`,
            },
            color: 3447003,
            description: result,
        };

        if (!result.startsWith('👍')) {
            this.queue.delete(msg.guild.id);
            statusMsg.edit('', { embed: resultMessage });
            stopTyping(msg);

            return null;
        }

        statusMsg.edit('', {
            embed: {
                description: stripIndents`
                    Adding playlist [${
                        playlist.title
                    }](https://www.youtube.com/playlist?list=${
                    playlist.id
                }) to the queue!
                    Check what's been added with: \`${
                        msg.guild.commandPrefix
                    }queue\`!
                `,
                color: 3447003,
                author: {
                    name: `${msg.author.tag} (${msg.author.id})`,
                    icon_url: msg.author.displayAvatarURL({ format: 'png' }),
                },
            },
        });
        stopTyping(msg);

        return null;
    }

    private addSong(msg: CommandoMessage, video: any) {
        const queue = this.queue.get(msg.guild.id);
        const songNumerator = (prev: any, curSong: any) => {
            if (curSong.member.id === msg.author.id) {
                prev += 1;
            }

            return prev;
        };

        if (!this.client.isOwner(msg.author)) {
            const songMaxLength = msg.guild.settings.get(
                'maxLength',
                process.env.MAX_LENGTH
            );
            const songMaxSongs = msg.guild.settings.get(
                'maxSongs',
                process.env.MAX_SONGS
            );

            if (
                songMaxLength > 0 &&
                video.durationSeconds > songMaxLength * 60
            ) {
                return oneLine`
					👎 ${Util.escapeMarkdown(video.title)}
					(${Song.timeString(video.durationSeconds)})
					is too long. No songs longer than ${songMaxLength} minutes!
				`;
            }
            if (
                queue.songs.some(
                    (songIterator: Song) => songIterator.id === video.id
                )
            ) {
                return `👎 ${Util.escapeMarkdown(
                    video.title
                )} is already queued.`;
            }

            if (
                songMaxSongs > 0 &&
                queue.songs.reduce(songNumerator, 0) >= songMaxSongs
            ) {
                return `👎 you already have ${songMaxSongs} songs in the queue. Don't hog all the airtime!`;
            }
        }

        const song = new Song(video, msg.member);

        queue.songs.push(song);

        return oneLine`
                👍 ${`[${song}](${`${song.url}`})`}
            `;
    }

    private play(guild: Guild, song: any) {
        const queue = this.queue.get(guild.id);
        const vote = this.votes.get(guild.id);

        if (vote) {
            clearTimeout(vote);
            this.votes.delete(guild.id);
        }

        if (!song) {
            if (queue) {
                queue.textChannel.send(
                    "We've run out of songs! Better queue up some more tunes."
                );
                queue.voiceChannel.leave();
                this.queue.delete(guild.id);
            }

            return;
        }
        let streamErrored = false;

        const playing = queue.textChannel.send({
            embed: {
                author: {
                    iconURL: song.avatar,
                    name: song.username,
                },
                color: 4317875,
                description: `${`[${song}](${`${song.url}`})`}`,
                image: { url: song.thumbnail },
            },
        });
        const stream = ytdl(song.url, {
            quality: 'highestaudio',
            filter: 'audioonly',
            highWaterMark: 12,
        }).on('error', () => {
            streamErrored = true;
            playing.then((msg: CommandoMessage) =>
                msg.edit(`❌ Couldn't play ${song}. What a drag!`)
            );
            queue.songs.shift();
            this.play(guild, queue.songs[0]);
        });

        const dispatcher = queue.connection
            .play(stream, {
                fec: true,
                passes: Number(process.env.PASSES),
            })
            .on('end', () => {
                if (streamErrored) {
                    return;
                }
                queue.songs.shift();
                this.play(guild, queue.songs[0]);
            })
            .on('error', (err: any) => {
                queue.textChannel.send(
                    `An error occurred while playing the song: \`${err}\``
                );
            });

        dispatcher.setVolumeLogarithmic(queue.volume / 5);
        song.dispatcher = dispatcher;
        song.playing = true;
        queue.playing = true;
    }

    private getPlaylistID(url: string) {
        return parse(url.split('?')[1]).list;
    }

    private async getPlaylistVideos(id: string) {
        try {
            const request = await fetch(
                `https://www.googleapis.com/youtube/v3/playlistItems?${stringify(
                    {
                        key: process.env.GOOGLE_API_KEY,
                        maxResults: 25,
                        part: 'snippet,contentDetails',
                        playlistId: id,
                    }
                )}`
            );

            const data = await request.json();
            const arr = [];
            const videos = data.items;

            for (const video of videos) {
                arr.push(await this.getVideo(video.snippet.resourceId.videoId));
            }

            return arr;
        } catch (err) {
            return null;
        }
    }

    private async getVideoByName(name: string): Promise<string> {
        try {
            const request = await fetch(
                `https://www.googleapis.com/youtube/v3/search?${stringify({
                    key: process.env.GOOGLE_API_KEY,
                    maxResults: '1',
                    part: 'snippet',
                    q: name,
                    type: 'video',
                })}`
            );
            const data = await request.json();
            const video = data.items[0];

            return video.id.videoId;
        } catch (err) {
            return null;
        }
    }

    private getVideoID(url: string) {
        if (/youtu\.be/i.test(url)) {
            return this.getVideo(url.match(/\/[a-zA-Z0-9-_]+$/i)[0].slice(1));
        }

        return this.getVideo(parse(url.split('?')[1]).v);
    }

    private async getVideo(id: string) {
        try {
            const request = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?${stringify({
                    id,
                    key: process.env.GOOGLE_API_KEY,
                    maxResults: 1,
                    part: 'snippet,contentDetails',
                })}`
            );

            const data = await request.json();

            return {
                duration: data.items[0].contentDetails.duration,
                durationSeconds: moment
                    .duration(data.items[0].contentDetails.duration)
                    .asSeconds(),
                id: data.items[0].id,
                kind: data.items[0].kind,
                title: data.items[0].snippet.title,
            };
        } catch (err) {
            return null;
        }
    }
}
