/**
 * @file Music PlaySongCommand - Starts playing music  
 * You need to be in a voice channel before you can use this command and Ribbon needs to be allowed to join that channel as well as speak in it  
 * If music is already playing this will add to the queue or otherwise it will join your voice channel and start playing
 * There are 4 ways to queue songs  
 * 1. YouTube Search Query  
 * 2. YouTube video URL  
 * 3. YouTube playlist URL
 * 4. YouTube video ID  
 * **Aliases**: `add`, `enqueue`, `start`, `join`
 * @module
 * @category music
 * @name play
 * @example play
 * @param {StringResolvable} Video One of the options linking to a video to play
 * @returns {MessageEmbed} Title, duration and thumbnail of the video
 */

const YouTube = require('simple-youtube-api'),
  moment = require('moment'),
  ytdl = require('ytdl-core'),
  {Command} = require('discord.js-commando'),
  {escapeMarkdown} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, Song, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class PlaySongCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'play',
      memberName: 'play',
      group: 'music',
      aliases: ['add', 'enqueue', 'start', 'join'],
      description: 'Adds a song to the queue',
      format: 'YoutubeURL|YoutubeVideoSearch',
      examples: ['play {youtube video to play}'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'url',
          prompt: 'what music would you like to listen to?',
          type: 'string',
          parse: p => p.replace(/<(.+)>/g, '$1')
        }
      ]
    });

    this.queue = new Map();
    this.youtube = new YouTube(process.env.googleapikey);
  }

  /* eslint-disable max-statements*/
  async run (msg, {url}) {
    startTyping(msg);
    const queue = this.queue.get(msg.guild.id);

    let voiceChannel; // eslint-disable-line init-declarations

    if (!queue) {
      voiceChannel = msg.member.voice.channel; // eslint-disable-line
      if (!voiceChannel) {
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.reply('please join a voice channel before issuing this command.');
      }

      const permissions = voiceChannel.permissionsFor(msg.client.user);

      if (!permissions.has('CONNECT')) {
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.reply('I don\'t have permission to join your voice channel. Fix your server\'s permissions');
      }
      if (!permissions.has('SPEAK')) {
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.reply('I don\'t have permission to speak in your voice channel. Fix your server\'s permissions');
      }
    } else if (!queue.voiceChannel.members.has(msg.author.id)) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('please join a voice channel before issuing this command.');
    }

    const statusMsg = await msg.reply('obtaining video details...'); // eslint-disable-line one-var

    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      await statusMsg.edit('obtaining playlist videos... (this can take a while for long lists)');
      const playlist = await this.youtube.getPlaylist(url),
        videos = await playlist.getVideos();

      let video2 = null;

      if (!queue) {
        const listQueue = {
          textChannel: msg.channel,
          voiceChannel,
          connection: null,
          songs: [],
          volume: msg.guild.settings.get('defaultVolume', process.env.DEFAULT_VOLUME)
        };

        this.queue.set(msg.guild.id, listQueue);

        statusMsg.edit(`${msg.author}, joining your voice channel...`);
        try {
          const connection = await listQueue.voiceChannel.join();

          listQueue.connection = connection;
        } catch (error) {
          this.queue.delete(msg.guild.id);
          statusMsg.edit(`${msg.author}, unable to join your voice channel.`);
          stopTyping(msg);

          return null;
        }
      }

      for (const video of Object.values(videos)) {
        try {
          video2 = await this.youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
        } catch (err) {
          null;
        }
        await this.handlePlaylist(video2, playlist, queue, voiceChannel, msg, statusMsg); // eslint-disable-line no-await-in-loop
      }

      if (!this.queue.get(msg.guild.id, queue).playing) this.play(msg.guild, this.queue.get(msg.guild.id, queue).songs[0]);

      return null;
    }
    try {
      const video = await this.youtube.getVideo(url);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return this.handleVideo(video, queue, voiceChannel, msg, statusMsg);
    } catch (error) {
      try {
        const video = await this.youtube.searchVideos(url, 1);

        if (!video[0] || !video) {
          return statusMsg.edit(`${msg.author}, there were no search results.`);
        }
        const videoByID = await this.youtube.getVideoByID(video[0].id); // eslint-disable-line one-var

        deleteCommandMessages(msg, this.client);

        return this.handleVideo(videoByID, queue, voiceChannel, msg, statusMsg);
      } catch (err) {
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return statusMsg.edit(`${msg.author}, couldn't obtain the search result video's details.`);
      }
    }

  }

  async handleVideo (video, queue, voiceChannel, msg, statusMsg) {
    if (moment.duration(video.raw.contentDetails.duration, moment.ISO_8601).asSeconds() === 0) {
      statusMsg.edit(`${msg.author}, you can't play live streams.`);
      stopTyping(msg);

      return null;
    }

    if (!queue) {
      // eslint-disable-next-line no-param-reassign
      queue = {
        textChannel: msg.channel,
        voiceChannel,
        connection: null,
        songs: [],
        volume: msg.guild.settings.get('defaultVolume', process.env.DEFAULT_VOLUME)
      };
      this.queue.set(msg.guild.id, queue);

      const result = await this.addSong(msg, video),
        resultMessage = {
          color: 3447003,
          author: {
            name: `${msg.author.tag} (${msg.author.id})`,
            iconURL: msg.author.displayAvatarURL({format: 'png'})
          },
          description: result
        };

      if (!result.startsWith('👍')) {
        this.queue.delete(msg.guild.id);
        statusMsg.edit('', {embed: resultMessage});
        stopTyping(msg);

        return null;
      }

      statusMsg.edit(`${msg.author}, joining your voice channel...`);
      try {
        const connection = await queue.voiceChannel.join();

        queue.connection = connection;
        this.play(msg.guild, queue.songs[0]);
        statusMsg.delete();
        stopTyping(msg);

        return null;
      } catch (error) {
        this.queue.delete(msg.guild.id);
        statusMsg.edit(`${msg.author}, unable to join your voice channel.`);
        stopTyping(msg);

        return null;
      }
    } else {
      const result = await this.addSong(msg, video),
        resultMessage = {
          color: 3447003,
          author: {
            name: `${msg.author.tag} (${msg.author.id})`,
            iconURL: msg.author.displayAvatarURL({format: 'png'})
          },
          description: result
        };

      statusMsg.edit('', {embed: resultMessage});
      stopTyping(msg);

      return null;
    }
  }

  async handlePlaylist (video, playlist, queue, voiceChannel, msg, statusMsg) {
    if (moment.duration(video.raw.contentDetails.duration, moment.ISO_8601).asSeconds() === 0) {
      statusMsg.edit(`${msg.author}, looks like that playlist has a livestream and I cannot play livestreams`);
      stopTyping(msg);

      return null;
    }
    const result = await this.addSong(msg, video),
      resultMessage = {
        color: 3447003,
        author: {
          name: `${msg.author.tag} (${msg.author.id})`,
          iconURL: msg.author.displayAvatarURL({format: 'png'})
        },
        description: result
      };

    if (!result.startsWith('👍')) {
      this.queue.delete(msg.guild.id);
      statusMsg.edit('', {embed: resultMessage});
      stopTyping(msg);

      return null;
    }

    statusMsg.edit('', {
      embed: {
        color: 3447003,
        author: {
          name: `${msg.author.tag} (${msg.author.id})`,
          icon_url: msg.author.displayAvatarURL({format: 'png'}) // eslint-disable-line camelcase
        },
        description: stripIndents`
          Adding playlist [${playlist.title}](https://www.youtube.com/playlist?list=${playlist.id}) to the queue!
          Check what's been added with: \`${msg.guild.commandPrefix}queue\`!
        `
      }
    });
    stopTyping(msg);

    return null;
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
      const songMaxLength = msg.guild.settings.get('maxLength', process.env.MAX_LENGTH),
        songMaxSongs = msg.guild.settings.get('maxSongs', process.env.MAX_SONGS);

      if (songMaxLength > 0 && moment.duration(video.raw.contentDetails.duration, moment.ISO_8601).asSeconds() > songMaxLength * 60) {
        return oneLine`
					👎 ${escapeMarkdown(video.title)}
					(${Song.timeString(moment.duration(video.raw.contentDetails.duration, moment.ISO_8601).asSeconds())})
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
      if (queue) {
        queue.textChannel.send('We\'ve run out of songs! Better queue up some more tunes.');
        queue.voiceChannel.leave();
        this.queue.delete(guild.id);
      }

      return;
    }
    let streamErrored = false;

    const playing = queue.textChannel.send({ // eslint-disable-line one-var
        embed: {
          color: 4317875,
          author: {
            name: song.username,
            iconURL: song.avatar
          },
          description: `${`[${song}](${`${song.url}`})`}`,
          image: {url: song.thumbnail}
        }
      }),
      stream = ytdl(song.url, {
        quality: 'highestaudio',
        filter: 'audioonly',
        highWaterMark: 12
      })
        .on('error', () => {
          streamErrored = true;
          playing.then(msg => msg.edit(`❌ Couldn't play ${song}. What a drag!`));
          queue.songs.shift();
          this.play(guild, queue.songs[0]);
        }),
      dispatcher = queue.connection.play(stream, {
        passes: process.env.PASSES,
        fec: true
      })
        .on('end', () => {
          if (streamErrored) {
            return;
          }
          queue.songs.shift();
          this.play(guild, queue.songs[0]);
        })
        .on('error', (err) => {
          queue.textChannel.send(`An error occurred while playing the song: \`${err}\``);
        });

    dispatcher.setVolumeLogarithmic(queue.volume / 5);
    song.dispatcher = dispatcher;
    song.playing = true;
    queue.playing = true;
  }

  get votes () {
    if (!this._votes) {
      this._votes = this.client.registry.resolveCommand('music:skip').votes;
    }

    return this._votes;
  }
};