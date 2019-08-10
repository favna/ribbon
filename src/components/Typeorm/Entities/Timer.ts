import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Snowflake } from 'awesome-djs';
import { OptionalKeys } from 'utility-types';

export type TimerData = Pick<Timer, OptionalKeys<Timer>>;

@Entity()
export default class Timer extends BaseEntity {
  @PrimaryGeneratedColumn()
  public timerId?: number;

  @Column()
  public guildId?: Snowflake;

  @Column()
  public interval?: number;

  @Column()
  public channelId?: Snowflake;

  @Column({ nullable: false, default: '' })
  public content?: string;

  @CreateDateColumn()
  public lastsend?: Date;

  @Column('simple-array', { nullable: false, default: '' })
  public members?: string[];

  public constructor(data?: TimerData) {
    super();

    if (data) {
      this.guildId = data.guildId;
      this.interval = data.interval;
      this.channelId = data.channelId;
      this.content = data.content;
      this.lastsend = data.lastsend;
      this.members = data.members;
    }
  }
}