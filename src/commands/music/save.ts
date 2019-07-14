/**
 * @file Music SaveQueueCommand - DMs the 10 upcoming songs from the queue to the user
 *
 * **Aliases**: `save-songs`, `save-song-list`, `ss`, `savequeue`
 * @module
 * @category music
 * @name save
 */

import { DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages, Song } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage, util } from 'awesome-commando';
import { MessageEmbed, Snowflake } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import { MusicCommand, MusicQueueType } from 'RibbonTypes';

export default class SaveQueueCommand extends Command {
  private songQueue: Map<Snowflake, MusicQueueType>;

  public constructor(client: CommandoClient) {
    super(client, {
      name: 'save',
      aliases: [ 'save-songs', 'save-song-list', 'ss', 'savequeue' ],
      group: 'music',
      memberName: 'save',
      description: 'Saves the queued songs for later',
      examples: [ 'save' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
    });
    this.songQueue = this.queue;
  }

  private get queue() {
    if (!this.songQueue) {
      this.songQueue = (this.client.registry.resolveCommand('music:launch') as MusicCommand).queue;
    }

    return this.songQueue;
  }

  public async run(msg: CommandoMessage) {
    const queue = this.queue.get(msg.guild.id);
    if (!queue) return msg.reply('there isn\'t any music playing right now. You should get on that.');

    const currentSong = queue.songs[0];
    const currentTime = currentSong.dispatcher ? currentSong.dispatcher.streamTime / 1000 : 0;
    const embed = new MessageEmbed();
    const paginated = util.paginate(queue.songs, 1, Math.floor(10));

    embed
      .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
      .setAuthor(`${msg.author!.tag} (${msg.author!.id})`, msg.author!.displayAvatarURL({ format: 'png' }))
      .setImage(currentSong.thumbnail)
      .setDescription(stripIndents`
    __**First 10 songs in the queue**__
    ${paginated.items.map(song => `
    **-** ${song.id
    ? `[${song.name}](https://www.youtube.com/watch?v=${song.id}) (${song.lengthString})`
    : `${song.name} (${song.lengthString})`}`).join('\n')}

    ${paginated.maxPage > 1
    ? `\nUse ${msg.usage()} to view a specific page.\n`
    : ''}


    **Now playing:** ${currentSong.id
    ? `[${currentSong.name}](https://www.youtube.com/watch?v=${currentSong.id})`
    : `${currentSong.name}`}

    ${oneLine`
     **Progress:**${!currentSong.playing ? 'Paused: ' : ''}
     ${Song.timeString(currentTime)} / ${currentSong.lengthString}(${currentSong.timeLeft(currentTime)} left)`}`);

    msg.reply('✔ Check your inbox!');
    deleteCommandMessages(msg, this.client);

    return msg.direct('Your saved queue', { embed });
  }
}