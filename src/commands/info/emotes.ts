/**
 * @file Info EmotesCommand - Lists all emotes from the server
 *
 * **Aliases**: `listemo`, `emolist`, `listemoji`, `emote`, `emojis`, `emoji`
 * @module
 * @category info
 * @name emotes
 */

import { DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages, removeNullAndUndefined } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';

export default class EmotesCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'emotes',
      aliases: [ 'listemo', 'emolist', 'listemoji', 'emote', 'emojis', 'emoji' ],
      group: 'info',
      memberName: 'emotes',
      description: 'Gets all available custom emotes from the server',
      examples: [ 'emotes' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
    });
  }

  private static chunker(array: string[], size: number): string[][] {
    const chunkedArray: string[][] = [ [] ];

    do {
      chunkedArray.push(array.splice(0, size));
    } while (array.length > 0);
    chunkedArray.shift();

    return chunkedArray;
  }

  public async run(msg: CommandoMessage) {
    const emotesEmbed = new MessageEmbed();
    const animEmotes = msg.guild.emojis.map(emote => emote.animated ? `<a:${emote.name}:${emote.id}>` : undefined).filter(removeNullAndUndefined);
    const staticEmotes = msg.guild.emojis.map(emote => emote.animated ? undefined : `<a:${emote.name}:${emote.id}>`).filter(removeNullAndUndefined);
    let description = '';

    emotesEmbed
      .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
      .setAuthor(`${staticEmotes.length + animEmotes.length} ${msg.guild.name} Emotes`, msg.guild.iconURL({ format: 'png' })!)
      .setTimestamp();

    if (staticEmotes.length >= 40 || animEmotes.length >= 40) {
      const chunkedStaticEmotes = EmotesCommand.chunker(staticEmotes, 50);
      const chunkedAnimatedEmotes = EmotesCommand.chunker(animEmotes, 50);
      emotesEmbed.setDescription('Woaw you got so many emotes I\'ll have to split them across a few messages!');

      Promise.all([ msg.embed(emotesEmbed), msg.say('**__Static Emotes__**') ]);
      for (const chunk of chunkedStaticEmotes) {
        await msg.say(chunk.join(' '));
      }

      await msg.say('**__Animated Emotes__**');
      for (const chunk of chunkedAnimatedEmotes) {
        await msg.say(chunk.join(' '));
      }

      return null;
    }

    description += staticEmotes.length !== 0 ? `__**${staticEmotes.length} Static Emotes**__\n${staticEmotes.join('')}` : '';
    description += animEmotes.length !== 0 ? `\n\n__**${animEmotes.length} Animated Emotes**__\n${animEmotes.join('')}` : '';

    emotesEmbed.setDescription(description);

    deleteCommandMessages(msg, this.client);

    return msg.embed(emotesEmbed);
  }
}