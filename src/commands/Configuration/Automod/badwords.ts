import { GuildSettings } from '@settings/GuildSettings';
import RibbonEmbed from '@structures/RibbonEmbed';
import { ApplyOptions, logModMessage } from '@utils/Utils';
import { oneLine, stripIndent, stripIndents } from 'common-tags';
import { Command, CommandOptions, KlasaMessage } from 'klasa';

@ApplyOptions<CommandOptions>({
  aliases: [ 'badwordsfilter', 'bwf' ],
  cooldown: 3,
  cooldownLevel: 'guild',
  description: 'Toggle the bad words filter',
  extendedHelp: stripIndent`
    Please note that when adding new words to your server\'s filter you overwrite all your currently set words!

    = Argument Details =
    shouldEnable  ::  Whether the filter should be enabled or not
    words         ::  The words to assign as the "bad words".
                      Defaults to "fuck"
  `,
  permissionLevel: 2,
  runIn: [ 'text' ],
  usage: '<shouldEnable:boolean> [words:str] [...]',
  usageDelim: ' ',
})
export default class BadwordsCommand extends Command {
  async run(msg: KlasaMessage, [ shouldEnable, words ]: [boolean, string[]]) {
    if (shouldEnable && !words.length) words = [ ' fuck' ];

    msg.guildSettings.set(GuildSettings.automodBadwords, { enabled: shouldEnable, words });

    const bwfEmbed = new RibbonEmbed(msg.author!)
      .setDescription(stripIndents(
        `
          **Action:** Bad words filter has been ${shouldEnable ? 'enabled' : 'disabled'}
          ${shouldEnable ? `**Words:** Bad words have been set to ${words.map((word: string) => `\`${word}\``).join(', ')}` : ''}
          ${msg.guildSettings.get(GuildSettings.automodEnabled) ? '' : oneLine`
              **Notice:** Be sure to enable the general automod toggle with the \`${msg.guildSettings.get(GuildSettings.prefix)}automod\` command!
            `}
        `
      ));

    logModMessage(msg, bwfEmbed);

    return msg.sendEmbed(bwfEmbed);
  }
}