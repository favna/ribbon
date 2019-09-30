import { Snowflake } from 'discord.js';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import { NonFunctionKeys } from 'utility-types';

export type TimerData = Pick<Timer, Exclude<NonFunctionKeys<Timer>, undefined>>;

@Entity()
export default class Timer extends BaseEntity {
  @PrimaryColumn()
  public name?: string;

  @PrimaryColumn()
  public guildId?: Snowflake;

  @Column()
  public interval?: number;

  @Column()
  public channelId?: Snowflake;

  @Column({ nullable: false, default: '' })
  public content?: string;

  @Column()
  public lastsend?: string;

  @Column('simple-array', { nullable: false, default: '' })
  public members?: string[];

  public constructor(data?: TimerData) {
    super();

    if (data) {
      this.name = data.name;
      this.guildId = data.guildId;
      this.interval = data.interval;
      this.channelId = data.channelId;
      this.content = data.content;
      this.lastsend = data.lastsend;
      this.members = data.members;
    }
  }
}