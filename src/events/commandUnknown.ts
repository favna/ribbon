import { isArray, isStrings } from '@components/Utils';
import { oneLine } from 'common-tags';
import dym, { ReturnTypeEnums } from 'didyoumean2';
import { Event, KlasaMessage } from 'klasa';
import { GuildSettings } from '@root/RibbonTypes';

export default class CommandUnknownEvent extends Event {
  run(msg: KlasaMessage, cmd: string, prefix: RegExp, prefixLength: number) {
    if (msg.guild && msg.guildSettings.get(GuildSettings.unknownMessages) as GuildSettings.unknownMessages) {
      const commandsAndAliases = this.client.commands
        .map(command => command.name)
        .concat(this.client.commands
          .map(command => command.aliases)
          .flat()
        );

      const maybe = dym(msg.cleanContent.split(' ')[0], commandsAndAliases, { deburr: true, returnType: ReturnTypeEnums.ALL_SORTED_MATCHES });

      if (isArray(maybe) && isStrings(maybe)) {
        const returnStr = [
          oneLine`Unknown command. Use \`${msg.guildSettings.get(GuildSettings.prefix)}help\`
                  or <@${this.client.user!.id}> help to view the command list.`,
          '',
          oneLine`Server staff (those who can manage other's messages) can disable these replies by
                  using\`${msg.guildSettings.get(GuildSettings.prefix)}unknownmessages disable\``
        ];

        if (maybe.length) returnStr[1] = `Maybe you meant one of the following: ${maybe.map(val => `\`${val}\``).join(', ')}?`;

        return msg.sendMessage(returnStr.filter(Boolean).join('\n'));
      }

      return msg.sendMessage(oneLine(
        `
          Unknown command. Use \`${msg.guildSettings.get(GuildSettings.prefix)}help\`
          or <@${this.client.user!.id}> help to view the command list.
        `
      ));
    }

    return undefined;
  }
}