/**
 * @file Searches SauceNaoCommand - Gets the source of any given image URL using SauceNAO
 *
 * **Aliases**: `sn`, `sauce`
 * @module
 * @category searches
 * @name saucenao
 * @example saucenao https://i.imgur.com/6FjildG.jpg
 * @param {string} ImageURL Image to get the source for
 */

import { DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { DMChannel, MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import { Handler, HandlerOptions } from 'sagiri';

type SauceNaoArgs = {
    image: string;
};

export default class SauceNaoCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'saucenao',
            aliases: ['sn', 'sauce'],
            group: 'searches',
            memberName: 'saucenao',
            description: 'Gets the source of any given image URL using SauceNAO',
            format: 'Image',
            examples: ['saucenao https://i.imgur.com/6FjildG.jpg'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'image',
                    prompt: 'For what image do you want to find the source?',
                    type: 'saucable',
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { image }: SauceNaoArgs) {
        try {
            const sauceEmbed = new MessageEmbed();
            const handlerOptions: HandlerOptions = { numRes: 5, getRating: true };
            const sauceHandler = new Handler(process.env.SAUCENAO_KEY as string, handlerOptions);
            const sauces = await sauceHandler.getSauce(image);

            if (!sauces || !sauces.length) throw new Error('no_matches');
            if (this.channelIsNSFW(msg.channel)) sauces.filter(result => result.rating <= 2);
            if (!sauces || !sauces.length) throw new Error('no_sfw_matches');

            const sauce = sauces[0];

            sauceEmbed
                .setURL(sauce.url)
                .setTitle(`Best match found on: ${sauce.site}`)
                .setImage(sauce.thumbnail)
                .setColor(DEFAULT_EMBED_COLOR)
                .setDescription(oneLine`I found a match with a ${sauce.similarity}% similarity on ${sauce.site} as seen below.
                                        Click [here](${sauce.url}) to view the image, or check out some other matches:`)
                .addField('Second potential match', `[on ${sauces[1].site}](${sauces[1].url})`)
                .addField('Third potential match', `[on ${sauces[2].site}](${sauces[2].url})`)
                .addField('Fourth potential match', `[on ${sauces[3].site}](${sauces[3].url})`)
                .addField('Fifth potential match', `[on ${sauces[4].site}](${sauces[4].url})`);

            deleteCommandMessages(msg, this.client);

            return msg.embed(sauceEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);

            if (/(no_matches|Could not find site matching URL given)/i.test(err.toString())) return msg.reply(`no matches found for \`${image}\``);
            if (/(no_sfw_matches)/i.test(err.toString())) {
                return msg.reply(oneLine`Woops! I only found NSFW matches and it looks like you're not in an NSFW channel`);
            }
            if (/(connect ECONNREFUSED|Server-side error occurred)/i.test(err.toString())) {
                return msg.reply(oneLine`something went wrong finding matches for \`${image}\`. How about trying manually on https://saucenao.com/?`);
            }

            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

            channel.send(stripIndents`
              <@${this.client.owners[0].id}> Error occurred in \`saucenao\` command!
              **Server:** ${msg.guild.name} (${msg.guild.id})
              **Author:** ${msg.author!.tag} (${msg.author!.id})
              **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
              **Image:** ${image}
              **Error Message:** ${err}
          `);

            return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }

    private channelIsNSFW (channel: TextChannel | DMChannel) {
        return channel.type === 'text' && (channel as TextChannel).nsfw;
    }
}
