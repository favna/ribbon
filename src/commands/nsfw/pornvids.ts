/**
 * @file nsfw PornVidsCommand - Gets a NSFW video from pornhub
 *
 * Can only be used in NSFW marked channels!
 *
 * **Aliases**: `porn`, `nsfwvids`
 * @module
 * @category nsfw
 * @name pornvids
 * @example pornvids babe
 * @param {string} Query Something you want to find
 */

import { deleteCommandMessages } from '@components/Utils';
import { stringify } from '@favware/querystring';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';
import fetch from 'node-fetch';

type PornVidsArgs = {
    porn: string;
};

export default class PornVidsCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'pornvids',
            aliases: ['porn', 'nsfwvids'],
            group: 'nsfw',
            memberName: 'pornvids',
            description: 'Search porn videos',
            format: 'NSFWToLookUp',
            examples: ['pornvids babe'],
            nsfw: true,
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'porn',
                    prompt: 'What pornography do you want to find?',
                    type: 'string',
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { porn }: PornVidsArgs) {
        try {
            const pornEmbed = new MessageEmbed();
            const res = await fetch(`https://www.pornhub.com/webmasters/search?${stringify({ search: porn })}`);
            const vid = await res.json();
            const vidRandom = Math.floor(Math.random() * vid.videos.length);

            pornEmbed
                .setURL(vid.videos[vidRandom].url)
                .setTitle(vid.videos[vidRandom].title)
                .setImage(vid.videos[vidRandom].default_thumb)
                .setColor('#FFB6C1')
                .addField(
                    'Porn video URL',
                    `[Click Here](${vid.videos[vidRandom].url})`,
                    true
                )
                .addField(
                    'Porn video duration',
                    `${vid.videos[vidRandom].duration} minutes`,
                    true
                );

            deleteCommandMessages(msg, this.client);

            return msg.embed(pornEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);

            return msg.reply(`nothing found for \`${porn}\``);
        }
    }
}
