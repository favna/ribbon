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

import { CollectorTimeout, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { clientHasManageMessages, deleteCommandMessages, injectNavigationEmotes, navigationReactionFilter } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { DMChannel, MessageEmbed, MessageReaction, ReactionCollector, TextChannel, User } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import Sagiri, { SagiriOptions, Source } from 'sagiri';

type SauceNaoArgs = {
  image: string;
  hasManageMessages: boolean;
  position: number;
};

export default class SauceNaoCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'saucenao',
      aliases: [ 'sn', 'sauce' ],
      group: 'searches',
      memberName: 'saucenao',
      description: 'Gets the source of any given image URL using SauceNAO',
      format: 'Image',
      examples: [ 'saucenao https://i.imgur.com/6FjildG.jpg' ],
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

  @clientHasManageMessages()
  public async run(msg: CommandoMessage, { image, hasManageMessages, position = 0 }: SauceNaoArgs) {
    try {
      const handlerOptions: SagiriOptions = { numRes: 5, getRating: true };
      const sauceHandler = new Sagiri(process.env.SAUCENAO_KEY!, handlerOptions);
      const sauces = await sauceHandler.getSauce(image);
      const color = msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR;

      if (!sauces || !sauces.length) throw new Error('no_matches');
      if (this.channelIsNSFW(msg.channel)) sauces.filter(result => parseInt(result.rating) <= 2);
      if (!sauces || !sauces.length) throw new Error('no_sfw_matches');

      let currentSauce = sauces[position];
      let sauceEmbed = this.prepMessage(
        color, currentSauce, sauces.length, position, hasManageMessages
      );

      deleteCommandMessages(msg, this.client);

      const message = await msg.embed(sauceEmbed) as CommandoMessage;

      if (sauces.length > 1 && hasManageMessages) {
        injectNavigationEmotes(message);
        new ReactionCollector(message, navigationReactionFilter, { time: CollectorTimeout.five })
          .on('collect', (reaction: MessageReaction, user: User) => {
            if (!this.client.botIds.includes(user.id)) {
              if (reaction.emoji.name === '➡') position++;
              else position--;
              if (position >= sauces.length) position = 0;
              if (position < 0) position = sauces.length - 1;
              currentSauce = sauces[position];
              sauceEmbed = this.prepMessage(
                color, currentSauce, sauces.length, position, hasManageMessages
              );
              message.edit(sauceEmbed);
              message.reactions.get(reaction.emoji.name)!.users.remove(user);
            }
          });
      }

      return null;
    } catch (err) {
      deleteCommandMessages(msg, this.client);

      if (/(no_matches|Could not find site matching URL given)/i.test(err.toString())) {
        return msg.reply(`no matches found for \`${image}\``);
      }
      if (/(no_sfw_matches)/i.test(err.toString())) {
        return msg.reply('Woops! I only found NSFW matches and it looks like you\'re not in an NSFW channel');
      }
      if (/(connect ECONNREFUSED|Server-side error occurred)/i.test(err.toString())) {
        return msg.reply(`something went wrong finding matches for \`${image}\`. How about trying manually on https://saucenao.com/?`);
      }

      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`saucenao\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author.tag} (${msg.author.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Image:** ${image}
        **Error Message:** ${err}`);

      return msg.reply(oneLine`
        an unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
        Want to know more about the error?
        Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command`);
    }
  }

  private prepMessage(
    color: string, sauce: Source, saucesLength: number,
    position: number, hasManageMessages: boolean
  ): MessageEmbed {
    return new MessageEmbed()
      .setURL(sauce.url)
      .setTitle(`Match found on: ${sauce.site}`)
      .setImage(sauce.thumbnail.replace(/ /g, '%20'))
      .setColor(color)
      .setFooter(hasManageMessages ? `Result ${position + 1} of ${saucesLength}` : '')
      .setDescription(oneLine`
        I found a match with a ${sauce.similarity}% similarity on ${sauce.site} as seen below.
        Click [here](${sauce.url}) to view the image`);
  }

  private channelIsNSFW(channel: TextChannel | DMChannel) {
    return channel.type === 'text' && (channel as TextChannel).nsfw;
  }
}