import { MessageEmbed, MessageEmbedOptions } from 'discord.js';
import { KlasaUser } from 'klasa';
import { DEFAULT_EMBED_COLOR } from '../utils/Constants';

export default class RibbonEmbed extends MessageEmbed {
  constructor(author: KlasaUser, data?: MessageEmbed | MessageEmbedOptions) {
    super(data);

    this.setAuthor(author.tag, author.displayAvatarURL());
    this.setColor(DEFAULT_EMBED_COLOR);
    this.setTimestamp();
  }
}