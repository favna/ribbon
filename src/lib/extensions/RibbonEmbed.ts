import { MessageEmbed, MessageEmbedOptions, User } from 'discord.js';
import { DEFAULT_EMBED_COLOR } from '../utils/Constants';

export default class extends MessageEmbed {
  constructor(author: User, data?: MessageEmbed | MessageEmbedOptions) {
    super(data);

    this.setAuthor(author.tag, author.displayAvatarURL());
    this.setColor(DEFAULT_EMBED_COLOR);
    this.setTimestamp();
  }
}