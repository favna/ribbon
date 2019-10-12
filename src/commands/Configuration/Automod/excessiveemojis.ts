import { GuildSettings } from '@settings/GuildSettings';
import RibbonEmbed from '@extensions/RibbonEmbed';
import { ApplyOptions, logModMessage } from '@utils/Utils';
import { oneLine, stripIndent, stripIndents } from 'common-tags';
import { Command, CommandOptions, KlasaMessage } from 'klasa';

@ApplyOptions<CommandOptions>({
  aliases: [ 'emojifilter', 'spammedemojis', 'manyemojis', 'eef', 'ef' ],
  cooldown: 3,
  cooldownLevel: 'guild',
  description: 'Toggle the excessive emojis filter',
  extendedHelp: stripIndent`
    = Argument Details =
    shouldEnable  ::  Whether the filter should be enabled or not
    threshold     ::  The percentile amount of a message that should be emojis before it is deleted
                      Defaults to 5
    minLength     ::  The minimum length for a message before it is checked for deletion
                      Defaults to 10
  `,
  permissionLevel: 2,
  runIn: [ 'text' ],
  usage: '<shouldEnable:boolean> [threshold:int{1}] [minLength:int{1}]',
  usageDelim: ' ',
})
export default class extends Command {
  async run(msg: KlasaMessage, [ shouldEnable, threshold, minLength ]: [boolean, number, number]) {
    if (shouldEnable) {
      if (!threshold) threshold = 5;
      if (!minLength) minLength = 10;
    }

    msg.guildSettings.set(GuildSettings.automodCaps, { enabled: shouldEnable, threshold, minLength });

    const eeEmbed = new RibbonEmbed(msg.author)
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

    logModMessage(msg, eeEmbed);

    return msg.sendEmbed(eeEmbed);
  }
}