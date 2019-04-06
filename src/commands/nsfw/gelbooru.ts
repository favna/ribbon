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
 * @param {string} Query Something you want to find
 */

import { deleteCommandMessages, startTyping, stopTyping } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';
import { search as booru } from 'booru';
import { stripIndents } from 'common-tags';

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
                    type: 'stringarray',
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { tags }: { tags: string[] }) {
        try {
            startTyping(msg);

            const booruSearch = await booru('gelbooru', tags, {
                limit: 1,
                random: true,
            });
            const hit = booruSearch.first;
            const gelEmbed = new MessageEmbed();
            const imageTags: string[] = [];

            hit.tags.forEach((tag: string) => imageTags.push(`[#${tag}](${hit.fileUrl!})`));

            gelEmbed
                .setTitle(`gelbooru image for ${tags.join(', ')}`)
                .setURL(hit.fileUrl!)
                .setColor('#FFB6C1')
                .setDescription(stripIndents`
                    ${imageTags.slice(0, 5).join(' ')}
                    **Score**: ${hit.score}
                `)
                .setImage(hit.fileUrl!);

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
