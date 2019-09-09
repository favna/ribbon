import { PermissionString } from 'discord.js';
import { Language, LanguageOptions, LanguageStore } from 'klasa';

export default class EnglishLanguage extends Language {
  constructor(store: LanguageStore, file: string[], directory: string, options?: LanguageOptions) {
    super(store, file, directory, options);
    this.language = {
      CLIENT_MISSING_PERMISSION: (permission: PermissionString, name: string) => `I need the "${permission}" permission for the \`${name}\` command to work.`,
      CONFIGURATION_EQUALS: (prefix: string) => `The prefix for this guild was already \`${prefix}`,

      RESOLVER_INVALID_TASK: (name: string) => `\`${name}\` must be valid schema task JSON.`,
      RESOLVER_INVALID_CHANNELNAME: name => `\`${name}\` must be a valid channel name, id, or tag.`,
      RESOLVER_INVALID_ROLENAME: name => `\`${name}\` must be a valid role name, id, or mention.`,
      RESOLVER_INVALID_USERNAME: name => `\`${name}\` must be a valid user name, id, or mention.`,

      COMMAND_COUNTDOWN_NAME: 'You must provide a countdown name',
      COMMAND_COUNTDOWN_DATE: 'You must provide a date to count down to',
      COMMAND_COUNTDOWN_CHANNEL: 'You must provide a channel to send the countdown to',
      COMMAND_COUNTDOWN_CONTENT: 'You must provide a content for the countdown',
    };
  }
}