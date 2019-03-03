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
 * @param {string} Video One of the options linking to a video to play
 */

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { Guild, Message, Snowflake, StreamDispatcher, TextChannel, Util, VoiceChannel } from 'awesome-djs';
import { parse, stringify } from 'awesome-querystring';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import fetch from 'node-fetch';
import { Readable } from 'stream';
import ytdl from 'ytdl-core';
import { DEFAULT_VOLUME, deleteCommandMessages, IMusicCommand, MAX_LENGTH, MAX_SONGS, MusicQueueType, PASSES, Song, startTyping, stopTyping, YoutubeVideoType } from '../../components';

export default class PlaySongCommand extends Command {
    public queue: Map<Snowflake, MusicQueueType>;
    private queueVotes: any;

    constructor (client: CommandoClient) {
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
                }
            ],
        });

        this.queue = new Map();
    }

    get votes () {
        if (!this.queueVotes) this.queueVotes = (this.client.registry.resolveCommand('music:skip') as IMusicCommand).votes;
        return this.queueVotes;
    }

    private static getPlaylistID (url: string): string {
        return parse(url.split('?')[1]).list;
    }

    private static async getVideoByName (name: string): Promise<string> {
        try {
            const request = await fetch(
                `https://www.googleapis.com/youtube/v3/search?${stringify({
                    key: (process.env.GOOGLE_API_KEY as string),
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

    private static async getVideo (id: string): Promise<YoutubeVideoType> {
        try {
            const request = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?${stringify({
                    id,
                    key: (process.env.GOOGLE_API_KEY as string),
                    maxResults: 1,
                    part: 'snippet,contentDetails',
                })}`
            );

            const data = await request.json();

            return {
                durationSeconds: moment.duration(data.items[0].contentDetails.duration).asSeconds(),
                id: data.items[0].id,
                kind: data.items[0].kind,
                title: data.items[0].snippet.title,
            };
        } catch (err) {
            return null;
        }
    }

    public async run (msg: CommandoMessage, { videoQuery }: { videoQuery: string }) {
        const queue = this.queue.get(msg.guild.id);

        let voiceChannel: VoiceChannel;

        if (!queue) {
            voiceChannel = msg.member.voice.channel;
            if (!voiceChannel) return msg.reply('please join a voice channel before issuing this command.');

            const permissions = voiceChannel.permissionsFor(msg.client.user);

            if (!permissions.has('CONNECT')) return msg.reply('I don\'t have permission to join your voice channel. Fix your server\'s permissions');
            if (!permissions.has('SPEAK')) return msg.reply('I don\'t have permission to speak in your voice channel. Fix your server\'s permissions');
        } else if (!queue.voiceChannel.members.has(msg.author.id)) {
            return msg.reply('please join a voice channel before issuing this command.');
        }

        startTyping(msg);

        const statusMsg: Message = await msg.reply('obtaining video details...') as Message;

        if (videoQuery.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            await statusMsg.edit('obtaining playlist videos... (this can take a while for long lists)');

            const playlist = PlaySongCommand.getPlaylistID(videoQuery);
            const videos = await this.getPlaylistVideos(playlist);

            if (!queue) {
                const listQueue: MusicQueueType = {
                    textChannel: msg.channel as TextChannel,
                    voiceChannel,
                    connection: null,
                    songs: [],
                    volume: msg.guild.settings.get('defaultVolume', DEFAULT_VOLUME),
                    playing: false,
                };

                this.queue.set(msg.guild.id, listQueue);

                statusMsg.edit(`${msg.author}, joining your voice channel...`);
                try {
                    listQueue.connection = await listQueue.voiceChannel.join();
                } catch (error) {
                    this.queue.delete(msg.guild.id);
                    statusMsg.edit(`${msg.author}, unable to join your voice channel.`);
                    stopTyping(msg);

                    return null;
                }
            }

            videos.forEach(async (video: YoutubeVideoType) => this.handlePlaylist(video, playlist, msg, statusMsg));

            if (!this.queue.get(msg.guild.id).playing) {
                this.play(msg.guild, this.queue.get(msg.guild.id).songs[0]);
            }

            return null;
        }

        try {
            const video: YoutubeVideoType = await this.getVideoID(videoQuery);
            if (!video) throw new Error('no_video_id');

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            this.handleVideo(video, queue, voiceChannel, msg, statusMsg);
            return null;
        } catch (error) {
            if (/(?:no_video_id)/i.test(error.toString())) {
                try {
                    const videoId = await PlaySongCommand.getVideoByName(videoQuery);
                    if (!videoId) return statusMsg.edit(`${msg.author}, there were no search results.`);

                    const video = await PlaySongCommand.getVideo(videoId);
                    deleteCommandMessages(msg, this.client);

                    this.handleVideo(video, queue, voiceChannel, msg, statusMsg);
                    return null;
                } catch (err) {
                    deleteCommandMessages(msg, this.client);
                    stopTyping(msg);

                    return statusMsg.edit(`<@${msg.author.id}>, couldn't obtain the search result video's details.`);
                }
            }

            return statusMsg.edit(`<@${msg.author.id}>, couldn't match a youtube result. Was that really a youtube video?`);
        }
    }

    private async handleVideo (video: YoutubeVideoType, queue: MusicQueueType, voiceChannel: VoiceChannel, msg: CommandoMessage, statusMsg: Message): Promise<void> {
        if (!video.durationSeconds || video.durationSeconds === 0) {
            stopTyping(msg);
            statusMsg.edit(oneLine`${msg.author}, you can't play live streams.
                Please note that this error might also be something else and there is currently additional debugging information being send to <@${this.client.owners[0].id}>`);

            const channel = this.client.channels.get((process.env.ISSUE_LOG_CHANNEL_ID as string)) as TextChannel;
            /* tslint:disable:no-console*/
            console.error('PLAYBACK ERROR OCCURRED: DEBUG BELOW');
            console.error(video);
            /* tslint:enable:no-console*/
            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Some playback error ocurred. I logged the video data to the error log!
                **Handling:** Video
                **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            `);

            return null;
        }

        if (!queue) {
            queue = {
                textChannel: msg.channel as TextChannel,
                voiceChannel,
                connection: null,
                songs: [],
                volume: msg.guild.settings.get('defaultVolume', DEFAULT_VOLUME),
                playing: false,
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
                statusMsg.edit(oneLine`${msg.author}, something went wrong playing music.
                    Please contact <@${this.client.owners[0].id}> as there is likely something wrong in the code!
                    Use \`${msg.guild.commandPrefix}invite\` to get an invite to the support server.`);
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

    private async handlePlaylist (video: YoutubeVideoType, playlistId: string, msg: CommandoMessage, statusMsg: Message): Promise<void> {
        if (!video.durationSeconds || video.durationSeconds === 0) {
            stopTyping(msg);
            statusMsg.edit(oneLine`${msg.author}, you can't play live streams.
                Please note that this error might also be something else and there is currently additional debugging information being send to <@${this.client.owners[0].id}>`);

            const channel = this.client.channels.get((process.env.ISSUE_LOG_CHANNEL_ID as string)) as TextChannel;
            /* tslint:disable:no-console*/
            console.error('PLAYBACK ERROR OCCURRED: DEBUG BELOW');
            console.error(video);
            /* tslint:enable:no-console*/
            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Some playback error ocurred. I logged the video data to the error log!
                **Handling:** Playlist
                **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            `);

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
                    Adding [the playlist](https://www.youtube.com/playlist?list=${playlistId}) to the queue!
                    Check what's been added with: \`${msg.guild.commandPrefix}queue\`!
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

    private addSong (msg: CommandoMessage, video: YoutubeVideoType) {
        const queue = this.queue.get(msg.guild.id);
        const songNumerator = (prev: any, curSong: any) => {
            if (curSong.member.id === msg.author.id) {
                prev += 1;
            }

            return prev;
        };

        if (!this.client.isOwner(msg.author)) {
            const songMaxLength = msg.guild.settings.get('maxLength', MAX_LENGTH);
            const songMaxSongs = msg.guild.settings.get('maxSongs', MAX_SONGS);

            if (songMaxLength > 0 && video.durationSeconds > songMaxLength * 60) {
                return oneLine`
					👎 ${Util.escapeMarkdown(video.title)}
					(${Song.timeString(video.durationSeconds)})
					is too long. No songs longer than ${songMaxLength} minutes!
				`;
            }
            if (queue.songs.some((songIterator: Song) => songIterator.id === video.id)) {
                return `👎 ${Util.escapeMarkdown(video.title)} is already queued.`;
            }

            if (songMaxSongs > 0 && queue.songs.reduce(songNumerator, 0) >= songMaxSongs) {
                return `👎 you already have ${songMaxSongs} songs in the queue. Don't hog all the airtime!`;
            }
        }

        const song = new Song(video, msg.member);

        queue.songs.push(song);

        return oneLine`👍 ${`[${song}](${`${song.url}`})`}`;
    }

    private async play (guild: Guild, song: any) {
        const queue = this.queue.get(guild.id);
        const vote = this.votes.get(guild.id);

        if (vote) {
            clearTimeout(vote);
            this.votes.delete(guild.id);
        }

        if (!song) {
            if (queue && !queue.isTriggeredByStop) {
                queue.textChannel.send('We\'ve run out of songs! Better queue up some more tunes.');
            }
            queue.voiceChannel.leave();
            return this.queue.delete(guild.id);
        }
        let streamErrored = false;

        const playing: Promise<Message> = queue.textChannel.send({
            embed: {
                author: {
                    iconURL: song.avatar,
                    name: song.username,
                },
                color: 4317875,
                description: `${`[${song}](${`${song.url}`})`}`,
                image: { url: song.thumbnail },
            },
        }) as Promise<Message>;
        const stream: Readable = ytdl(song.url, {
            quality: 'highestaudio',
            filter: 'audioonly',
            highWaterMark: 12,
        }).on('error', () => {
            streamErrored = true;
            playing.then((msg: Message) => msg.edit(`❌ Couldn't play ${song}. What a drag!`));
            queue.songs.shift();
            this.play(guild, queue.songs[0]);
        });

        const dispatcher: StreamDispatcher = queue.connection
            .play(stream, {
                passes: Number(PASSES),
                fec: true,
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
        return queue.playing = true;
    }

    private async getPlaylistVideos (id: string) {
        try {
            const request = await fetch(
                `https://www.googleapis.com/youtube/v3/playlistItems?${stringify({
                        key: (process.env.GOOGLE_API_KEY as string),
                        maxResults: 25,
                        part: 'snippet,contentDetails',
                        playlistId: id,
                    }
                )}`
            );

            const data = await request.json();
            const arr: YoutubeVideoType[] = [];
            const videos = data.items;

            videos.forEach(async (video: YoutubeVideoType) => arr.push(await PlaySongCommand.getVideo(video.snippet.resourceId.videoId)));
            return arr;
        } catch (err) {
            return null;
        }
    }

    private getVideoID (url: string): Promise<YoutubeVideoType> {
        try {
            if (/youtu\.be/i.test(url)) {
                return PlaySongCommand.getVideo(url.match(/\/[a-zA-Z0-9-_]+$/i)[0].slice(1));
            }

            return PlaySongCommand.getVideo(parse(url.split('?')[1]).v);
        } catch (err) {
            return null;
        }
    }
}
