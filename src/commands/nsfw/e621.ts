/**
 * @file nsfw E621Command - Gets a NSFW image from e621
 *
 * Can only be used in NSFW marked channels!
 *
 * **Aliases**: `eee`
 * @module
 * @category nsfw
 * @name e621
 * @example e621 pyrrha_nikos
 * @param {StringResolvable} Query Something you want to find
 */

import * as booru from 'booru';
import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class E621Command extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'e621',
            aliases: ['eee'],
            group: 'nsfw',
            memberName: 'e621',
            description: 'Find NSFW Content on e621',
            format: 'NSFWToLookUp',
            examples: ['e621 Pyrrha Nikos'],
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
                },
            ],
        });
    }

    public async run (msg: CommandoMessage, { tags }: { tags: Array<string> }) {
        try {
            startTyping(msg);

            const search = await booru.search('e621', tags, {
                limit: 1,
                random: true,
            });
            const common = await booru.commonfy(search);
            const embed = new MessageEmbed();
            const imageTags = [];

            for (const tag in common[0].common.tags) {
                imageTags.push(`[#${common[0].common.tags[tag]}](${common[0].common.file_url})`);
            }

            embed
                .setTitle(`e621 image for ${tags.join(', ')}`)
                .setURL(common[0].common.file_url)
                .setColor('#FFB6C1')
                .setDescription(stripIndents`${imageTags.slice(0, 5).join(' ')}
                    **Score**: ${common[0].common.score}`)
                .setImage(common[0].common.file_url);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(embed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(`no juicy images found for \`${tags}\``);
        }
    }
}