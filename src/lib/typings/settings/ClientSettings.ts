import { ScheduledTaskJSON } from 'klasa';

export namespace ClientSettings {
  export type UserBlacklist = ReadonlyArray<string>;
  export type GuildBlacklist = ReadonlyArray<string>;
  export type Schedules = ReadonlyArray<ScheduledTaskJSON>;

  export const UserBlacklist = 'userBlacklist';
  export const GuildBlacklist = 'guildBlacklist';
  export const Schedules = 'schedules';
}