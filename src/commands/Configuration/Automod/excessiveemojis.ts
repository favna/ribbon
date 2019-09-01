import { ApplyOptions, logModMessage } from '@root/components/Utils';
import { GuildSettings } from '@root/RibbonTypes';
import { stripIndents, oneLine } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { Command, CommandOptions, KlasaMessage } from 'klasa';

@ApplyOptions<CommandOptions>({
  aliases: [ 'emojifilter', 'spammedemojis', 'manyemojis', 'ef' ],
  cooldown: 3,
  cooldownLevel: 'guild',
  description: 'Toggle the excessive emojis filter',
  permissionLevel: 2,
  runIn: [ 'text' ],
  usage: '<shouldEnable:boolean> [threshold:int{1}] [minLength:int{1}]',
  usageDelim: ' ',
})
export default class ExcessiveEmojisCommand extends Command {
  async run(msg: KlasaMessage, [ shouldEnable, threshold, minLength ]: [boolean, number, number]) {
    if (shouldEnable) {
      if (!threshold) threshold = 60;
      if (!minLength) minLength = 10;
    }

    msg.guildSettings.set(GuildSettings.automodCaps, { enabled: shouldEnable, threshold, minLength });

    const dtfEmbed = new MessageEmbed()
      .setColor('#439DFF')
      .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
      .setDescription(stripIndents(
        `
          **Action:** Excessive Caps filter has been ${shouldEnable ? 'enabled' : 'disabled'}
          ${shouldEnable ? `**Threshold:** Messages that have at least ${threshold}% caps will be deleted` : ''}
          ${shouldEnable ? `**Minimum length:** Messages of at least ${minLength} are checked for caps` : ''}
          ${msg.guildSettings.get(GuildSettings.automodEnabled) ? '' : oneLine`
              **Notice:** Be sure to enable the general automod toggle with the \`${msg.guildSettings.get(GuildSettings.prefix)}automod\` command!
            `}
        `
      ));

    logModMessage(msg, dtfEmbed);

    return msg.sendEmbed(dtfEmbed);
  }
}