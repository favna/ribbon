/*
 *   This file is part of Ribbon
 *   Copyright (C) 2017-2018 Favna
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, version 3 of the License
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *   Additional Terms 7.b and 7.c of GPLv3 apply to this file:
 *       * Requiring preservation of specified reasonable legal notices or
 *         author attributions in that material or in the Appropriate Legal
 *         Notices displayed by works containing it.
 *       * Prohibiting misrepresentation of the origin of that material,
 *         or requiring that modified versions of such material be marked in
 *         reasonable ways as different from the original version.
 */

/**
 * @file Music PlaySongCommand - Starts playing music  
 * You need to be in a voice channel before you can use this command and Ribbon needs to be allowed to join that channel as well as speak in it  
 * If music is already playing this will add to the queue or otherwise it will join your voice channel and start playing
 * There are 3 ways to queue songs  
 * 1. Youtube Search Query  
 * 2. Youtube URL  
 * 3. Youtube video ID  
 * **Aliases**: `add`, `enqueue`, `start`, `join`
 * @module
 * @category music
 * @name play
 * @example play
 * @param {string} Video One of the options linking to a video to play
 * @returns {MessageEmbed} Title, duration and thumbnail of the video
 */

const path = require('path'),
  Song = require(path.join(__dirname, '../../data/melody/SongStructure.js')), // eslint-disable-line sort-vars
  YouTube = require('simple-youtube-api'), // eslint-disable-line sort-vars
  commando = require('discord.js-commando'), // eslint-disable-line sort-vars
  winston = require('winston'),
  ytdl = require('ytdl-core'),
  {escapeMarkdown} = require('discord.js'),
  {deleteCommandMessages} = require('../../util.js'),
  {oneLine} = require('common-tags'),
  {DEFAULT_VOLUME, GOOGLE_API, MAX_LENGTH, MAX_SONGS, PASSES} = require(path.join(__dirname, '../../data/melody/GlobalData'));

module.exports = class PlaySongCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'play',
      'memberName': 'play',
      'group': 'music',
      'aliases': ['add', 'enqueue', 'start', 'join'],
      'description': 'Adds a song to the queue',
      'format': 'YoutubeURL|YoutubeVideoSearch',
      'examples': ['play {youtube video to play}'],
      'guildOnly': true,
      'throttling': {
        'usages': 2,
        'duration': 3
      },
      'args': [
        {
          'key': 'url',
          'prompt': 'what music would you like to listen to?',
          'type': 'string'
        }
      ]
    });

    this.queue = new Map();
    this.youtube = new YouTube(GOOGLE_API);
  }

  async run (msg, args) {
    const url = args.url.replace(/<(.+)>/g, '$1'),
      queue = this.queue.get(msg.guild.id); // eslint-disable-line sort-vars

    let voiceChannel; // eslint-disable-line init-declarations

    if (!queue) {
      voiceChannel = msg.member.voiceChannel; // eslint-disable-line
      if (!voiceChannel) {
        deleteCommandMessages(msg, this.client);

        return msg.reply('please join a voice channel before issuing this command.');
      }

      const permissions = voiceChannel.permissionsFor(msg.client.user);

      if (!permissions.has('CONNECT')) {
        deleteCommandMessages(msg, this.client);

        return msg.reply('I don\'t have permission to join your voice channel. Fix your server\'s permissions');
      }
      if (!permissions.has('SPEAK')) {
        deleteCommandMessages(msg, this.client);

        return msg.reply('I don\'t have permission to speak in your voice channel. Fix your server\'s permissions');
      }
    } else if (!queue.voiceChannel.members.has(msg.author.id)) {
      deleteCommandMessages(msg, this.client);

      return msg.reply('please join a voice channel before issuing this command.');
    }

    const statusMsg = await msg.reply('obtaining video details...'); // eslint-disable-line one-var

    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      deleteCommandMessages(msg, this.client);


      return statusMsg.edit(`<@${msg.author.id}>, sorry youtube playlists are not supported due to big lists causing queueing loop issues. Please queue the individual tracks`);
    }
    try {
      const video = await this.youtube.getVideo(url);

      deleteCommandMessages(msg, this.client);

      return this.handleVideo(video, queue, voiceChannel, msg, statusMsg);
    } catch (error) {
      try {
        const video = await this.youtube.searchVideos(url, 1)
            .catch(() => statusMsg.edit(`${msg.author}, there were no search results.`)),
          videoByID = await this.youtube.getVideoByID(video[0].id);

        deleteCommandMessages(msg, this.client);

        return this.handleVideo(videoByID, queue, voiceChannel, msg, statusMsg);
      } catch (err) {
        winston.error(err);
        deleteCommandMessages(msg, this.client);

        return statusMsg.edit(`${msg.author}, couldn't obtain the search result video's details.`);
      }
    }

  }

  async handleVideo (video, queue, voiceChannel, msg, statusMsg) {
    if (video.durationSeconds === 0) {
      statusMsg.edit(`${msg.author}, you can't play live streams.`);

      return null;
    }

    if (!queue) {
      // eslint-disable-next-line no-param-reassign
      queue = {
        'textChannel': msg.channel,
        voiceChannel,
        'connection': null,
        'songs': [],
        'volume': this.client.provider.get(msg.guild.id, 'defaultVolume', DEFAULT_VOLUME)
      };
      this.queue.set(msg.guild.id, queue);

      const result = await this.addSong(msg, video),
        resultMessage = {
          'color': 3447003,
          'author': {
            'name': `${msg.author.tag} (${msg.author.id})`,
            'icon_url': msg.author.displayAvatarURL({'format': 'png'})
          },
          'description': result
        };

      if (!result.startsWith('👍')) {
        this.queue.delete(msg.guild.id);
        statusMsg.edit('', {'embed': resultMessage});

        return null;
      }


      statusMsg.edit(`${msg.author}, joining your voice channel...`);
      try {
        const connection = await queue.voiceChannel.join();

        queue.connection = connection;
        this.play(msg.guild, queue.songs[0]);
        statusMsg.delete();

        return null;
      } catch (error) {
        winston.error('Error occurred when joining voice channel.', error);
        this.queue.delete(msg.guild.id);
        statusMsg.edit(`${msg.author}, unable to join your voice channel.`);

        return null;
      }
    } else {
      const result = await this.addSong(msg, video),
        resultMessage = {
          'color': 3447003,
          'author': {
            'name': `${msg.author.tag} (${msg.author.id})`,
            'icon_url': msg.author.displayAvatarURL({'format': 'png'})
          },
          'description': result
        };

      statusMsg.edit('', {'embed': resultMessage});

      return null;
    }
  }

  addSong (msg, video) {
    const queue = this.queue.get(msg.guild.id),
      songNumerator = function (prev, song) {
        if (song.member.id === msg.author.id) {
          prev += 1; // eslint-disable-line no-param-reassign
        }

        return prev;
      };

    if (!this.client.isOwner(msg.author)) {
      const songMaxLength = this.client.provider.get(msg.guild.id, 'maxLength', MAX_LENGTH),
        songMaxSongs = this.client.provider.get(msg.guild.id, 'maxSongs', MAX_SONGS);

      if (songMaxLength > 0 && video.durationSeconds > songMaxLength * 60) {
        return oneLine`
					👎 ${escapeMarkdown(video.title)}
					(${Song.timeString(video.durationSeconds)})
					is too long. No songs longer than ${songMaxLength} minutes!
				`;
      }
      if (queue.songs.some(song => song.id === video.id)) {
        return `👎 ${escapeMarkdown(video.title)} is already queued.`;
      }

      if (songMaxSongs > 0 &&
        queue.songs.reduce(songNumerator, 0) >= songMaxSongs) {
        return `👎 you already have ${songMaxSongs} songs in the queue. Don't hog all the airtime!`;
      }
    }

    winston.info('Adding song to queue.', {
      'song': video.id,
      'guild': msg.guild.id
    });

    const song = new Song(video, msg.member); // eslint-disable-line one-var

    queue.songs.push(song);

    return oneLine`
                👍 ${`[${song}](${`${song.url}`})`}
            `;
  }

  play (guild, song) {
    const queue = this.queue.get(guild.id),
      vote = this.votes.get(guild.id);

    if (vote) {
      clearTimeout(vote);
      this.votes.delete(guild.id);
    }

    if (!song) {
      queue.textChannel.send('We\'ve run out of songs! Better queue up some more tunes.');
      queue.voiceChannel.leave();
      this.queue.delete(guild.id);

      return;
    }
    let streamErrored = false;

    const playing = queue.textChannel.send({ // eslint-disable-line one-var
        'embed': {
          'color': 4317875,
          'author': {
            'name': song.username,
            'icon_url': song.avatar
          },
          'description': `${`[${song}](${`${song.url}`})`}`,
          'image': {'url': song.thumbnail}
        }
      }),
      stream = ytdl(song.url, {'audioonly': true})
        .on('error', (err) => {
          streamErrored = true;
          winston.error('Error occurred when streaming video:', err);
          playing.then(msg => msg.edit(`❌ Couldn't play ${song}. What a drag!`));
          queue.songs.shift();
          this.play(guild, queue.songs[0]);
        }),
      dispatcher = queue.connection.play(stream, { // eslint-disable-line sort-vars
        'passes': PASSES
      })
        .on('end', () => {
          if (streamErrored) {
            return;
          }
          queue.songs.shift();
          this.play(guild, queue.songs[0]);
        })
        .on('error', (err) => {
          winston.error('Error occurred in stream dispatcher:', err);
          queue.textChannel.send(`An error occurred while playing the song: \`${err}\``);
        });

    dispatcher.setVolumeLogarithmic(queue.volume / 5);
    song.dispatcher = dispatcher;
    song.playing = true;
  }

  get votes () {
    if (!this._votes) {
      this._votes = this.client.registry.resolveCommand('music:skip').votes;
    }

    return this._votes;
  }
};