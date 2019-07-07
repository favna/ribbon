/**
 * @file Extra XKCDCommand - Gets a random image from xkcd
 *
 * **Aliases**: `devjoke`, `comicjoke`
 * @module
 * @category extra
 * @name xkcd
 */

import { DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';
import fetch from 'node-fetch';

export default class XKCDCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'xkcd',
      aliases: ['devjoke', 'comicjoke'],
      group: 'extra',
      memberName: 'xkcd',
      description: 'Gets a random image from xkcd',
      examples: ['xkcd'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
    });
  }

  public async run (msg: CommandoMessage) {
    try {
      const count = await fetch('https://xkcd.com/info.0.json');
      const totalImages = await count.json();
      const randomNum = Math.floor(Math.random() * totalImages.num) + 1;
      const res = await fetch(`https://xkcd.com/${randomNum}/info.0.json`);
      const randomImage = await res.json();
      const xkcdEmbed = new MessageEmbed();

      xkcdEmbed
        .setTitle(randomImage.safe_title)
        .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
        .setDescription(randomImage.alt)
        .setImage(randomImage.img)
        .setURL(`https://xkcd.com/${randomNum}/`);

      deleteCommandMessages(msg, this.client);
      return msg.embed(xkcdEmbed);
    } catch (err) {
      return msg.reply('woops, couldn\'t get a random xkcd image. Have a 🎀 instead!');
    }
  }
}
