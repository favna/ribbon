import { GuildSettings } from '@settings/GuildSettings';
import { Finalizer, KlasaMessage } from 'klasa';

export default class extends Finalizer {
  async run(msg: KlasaMessage) {
    if (msg.guild && msg.guildSettings.get(GuildSettings.deleteCommand) && msg.deletable) await msg.delete();
  }
}