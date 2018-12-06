/**
 * @file nsfw GelbooruCommand - Gets a NSFW image from gelbooru
 *
 * Can only be used in NSFW marked channels!
 *
 * **Aliases**: `gel`, `booru`
 * @module
 * @category nsfw
 * @name gelbooru
 * @example gelbooru pyrrha_nikos
 * @param {StringResolvable} Query Something you want to find
 */

import * as booru from 'booru';
import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class GelbooruCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'gelbooru',
            aliases: ['gel', 'booru'],
            group: 'nsfw',
            memberName: 'gelbooru',
            description: 'Find NSFW Content on gelbooru',
            format: 'NSFWToLookUp',
            examples: ['gelbooru Pyrrha Nikos'],
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

            const search = await booru.search('gelbooru', tags, {
                limit: 1,
                random: true,
            });
            const parsed = await booru.commonfy(search);
            const hit = parsed[0].common;
            const gelEmbed = new MessageEmbed();
            const imageTags: string[] = [];

            hit.tags.forEach((tag: string) => imageTags.push(`[#${tag}](${hit.file_url})`));

            gelEmbed
                .setTitle(`gelbooru image for ${tags.join(', ')}`)
                .setURL(hit.file_url)
                .setColor('#FFB6C1')
                .setDescription(stripIndents`
                    ${imageTags.slice(0, 5).join(' ')}
    				**Score**: ${hit.score}
                `)
                .setImage(hit.file_url);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(gelEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(`no juicy images found for \`${tags}\``);
        }
    }
}
