/**
 * @file nsfw PahealCommand - Gets a NSFW image from paheal
 *
 * Can only be used in NSFW marked channels!
 *
 * **Aliases**: `pa`, `heal`
 * @module
 * @category nsfw
 * @name paheal
 * @example paheal pyrrha_nikos
 * @param {string} Query Something you want to find
 */

import booru from 'booru';
import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class PahealCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'paheal',
            aliases: ['pa', 'heal'],
            group: 'nsfw',
            memberName: 'paheal',
            description: 'Find NSFW Content on Rule34 - Paheal',
            format: 'NSFWToLookUp',
            examples: ['paheal Pyrrha Nikos'],
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

            const search = await booru.search('paheal', tags, {
                limit: 1,
                random: true,
            });
            const parsed = await booru.commonfy(search);
            const hit = parsed[0].common;
            const pahealEmbed = new MessageEmbed();
            const imageTags: string[] = [];

            hit.tags.forEach((tag: string) => imageTags.push(`[#${tag}](${hit.file_url})`));

            pahealEmbed
                .setTitle(`paheal image for ${tags.join(', ')}`)
                .setURL(hit.file_url)
                .setColor('#FFB6C1')
                .setDescription(stripIndents`
                    ${imageTags.slice(0, 5).join(' ')}
                    **Score**: ${hit.score}
                `)
                .setImage(hit.file_url);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(pahealEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(`no juicy images found for \`${tags}\``);
        }
    }
}
