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

import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';
import { search as booru } from 'booru';
import { stripIndents } from 'common-tags';

type PahealArgs = {
    tags: string[];
};

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
                    type: 'stringarray',
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { tags }: PahealArgs) {
        try {
            const booruSearch = await booru('paheal', tags, {
                limit: 1,
                random: true,
            });
            const hit = booruSearch.first;
            const pahealEmbed = new MessageEmbed();
            const imageTags: string[] = [];

            hit.tags.forEach((tag: string) => imageTags.push(`[#${tag}](${hit.fileUrl!})`));

            pahealEmbed
                .setTitle(`paheal image for ${tags.join(', ')}`)
                .setURL(hit.fileUrl!)
                .setColor('#FFB6C1')
                .setDescription(stripIndents`
                    ${imageTags.slice(0, 5).join(' ')}
                    **Score**: ${hit.score}
                `)
                .setImage(hit.fileUrl!);

            deleteCommandMessages(msg, this.client);

            return msg.embed(pahealEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);

            return msg.reply(`no juicy images found for \`${tags}\``);
        }
    }
}
