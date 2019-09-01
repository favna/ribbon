import { ApplyOptions, logModMessage } from '@root/components/Utils';
import { GuildSettings } from '@root/RibbonTypes';
import { stripIndents, oneLine } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { Command, CommandOptions, KlasaMessage } from 'klasa';

@ApplyOptions<CommandOptions>({
  aliases: [ 'badwordsfilter', 'bwf' ],
  cooldown: 3,
  cooldownLevel: 'guild',
  description: 'Toggle the bad words filter',
  extendedHelp: 'Please note that when adding new words to your server\'s filter you overwrite all your currently set words!',
  permissionLevel: 2,
  runIn: [ 'text' ],
  usage: '<shouldEnable:boolean> [words:str] [...]',
  usageDelim: ' ',
})
export default class BadwordsCommand extends Command {
  async run(msg: KlasaMessage, [ shouldEnable, words ]: [boolean, string[]]) {
    if (shouldEnable && !words.length) words = [ ' fuck' ];

    msg.guildSettings.set(GuildSettings.automodBadwords, { enabled: shouldEnable, words });

    const bwfEmbed = new MessageEmbed()
      .setColor('#439DFF')
      .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
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