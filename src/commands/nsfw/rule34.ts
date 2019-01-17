/**
 * @file nsfw Rule34Command - Gets a NSFW image from rule34
 *
 * Can only be used in NSFW marked channels!
 *
 * **Aliases**: `r34`
 * @module
 * @category nsfw
 * @name rule34
 * @example rule34 pyrrha_nikos
 * @param {string} Query Something you want to find
 */

import booru from 'booru';
import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class Rule34Command extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'rule34',
            aliases: ['r34'],
            group: 'nsfw',
            memberName: 'rule34',
            description: 'Find NSFW Content on Rule34',
            format: 'NSFWToLookUp',
            examples: ['rule34 Pyrrha Nikos'],
            nsfw: true,
            explicit: true,
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'tags',
                    prompt: 'What do you want to find NSFW for?',
                    type: 'string',
                    parse: (p: string) => p.split(' '),
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { tags }: { tags: string[] }) {
        try {
            startTyping(msg);

            const search = await booru.search('r34', tags, {
                limit: 1,
                random: true,
            });
            const parsed = await booru.commonfy(search);
            const hit = parsed[0].common;
            const r34Embed = new MessageEmbed();
            const imageTags: string[] = [];

            hit.tags.forEach((tag: string) => imageTags.push(`[#${tag}](${hit.file_url})`));

            r34Embed
                .setTitle(`Rule34 image for ${tags.join(', ')}`)
                .setURL(hit.file_url)
                .setColor('#FFB6C1')
                .setDescription(stripIndents`
                    ${imageTags.slice(0, 5).join(' ')}
                    **Score**: ${hit.score}
                `)
                .setImage(hit.file_url);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(r34Embed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(`no juicy images found for \`${tags}\``);
        }
    }
}
