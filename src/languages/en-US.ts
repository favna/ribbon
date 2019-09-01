import { Language, LanguageStore, LanguageOptions } from 'klasa';
import { PermissionString } from 'discord.js';

export default class EnglishLanguage extends Language {
  constructor(store: LanguageStore, file: string[], directory: string, options?: LanguageOptions) {
    super(store, file, directory, options);
    this.language = {
      CLIENT_MISSING_PERMISSION: (permission: PermissionString, name: string) => `I need the "${permission}" permission for the ${name} command to work.`,
      CONFIGURATION_EQUALS: (prefix: string) => `The prefix for this guild was already \`${prefix}`,
      RESOLVER_INVALID_TASK: (name: string) => `${name} must be valid schema task JSON.`,
    };
  }
}