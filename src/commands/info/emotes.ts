/**
 * @file Info EmotesCommand - Lists all emotes from the server
 *
 * **Aliases**: `listemo`, `emolist`, `listemoji`, `emote`, `emojis`, `emoji`
 * @module
 * @category info
 * @name emotes
 */

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';
import { DEFAULT_EMBED_COLOR, deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class EmotesCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'emotes',
            aliases: ['listemo', 'emolist', 'listemoji', 'emote', 'emojis', 'emoji'],
            group: 'info',
            memberName: 'emotes',
            description: 'Gets all available custom emotes from the server',
            examples: ['emotes'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
        });
    }

    public run (msg: CommandoMessage) {
        startTyping(msg);
        const embed = new MessageEmbed();
        const animEmotes: string[] = [];
        const staticEmotes: string[] = [];

        let description = '';

        msg.guild.emojis.forEach(emote => {
            emote.animated
                ? animEmotes.push(`<a:${emote.name}:${emote.id}>`)
                : staticEmotes.push(`<:${emote.name}:${emote.id}>`);
        });

        embed
            .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
            .setAuthor(`${staticEmotes.length + animEmotes.length} ${msg.guild.name} Emotes`, msg.guild.iconURL({ format: 'png' }))
            .setTimestamp();

        description += staticEmotes.length !== 0 ? `__**${staticEmotes.length} Static Emotes**__\n${staticEmotes.join('')}` : '';
        description += animEmotes.length !== 0 ? `\n\n__**${animEmotes.length} Animated Emotes**__\n${animEmotes.join('')}` : '';

        embed.setDescription(description);

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(embed);
    }
}
