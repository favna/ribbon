import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Snowflake } from 'awesome-djs';
import { NonFunctionKeys } from 'utility-types';

export type CountdownData = Pick<Countdown, Exclude<NonFunctionKeys<Countdown>, undefined>>;

@Entity()
export default class Countdown extends BaseEntity {
  @PrimaryGeneratedColumn()
  public countdownId?: number;

  @Column()
  public guildId?: Snowflake;

  @UpdateDateColumn()
  public datetime?: Date;

  @Column()
  public channelId?: Snowflake;

  @Column({ nullable: false, default: '' })
  public content?: string;

  @Column({ nullable: false, default: 'none' })
  public tag?: 'everyone' | 'here' | 'none';

  @UpdateDateColumn()
  public lastsend?: Date;

  public constructor(data?: CountdownData) {
    super();

    if (data) {
      this.countdownId = data.countdownId;
      this.guildId = data.guildId;
      this.datetime = data.datetime;
      this.channelId = data.channelId;
      this.content = data.content;
      this.tag = data.tag;
      this.lastsend = data.lastsend;
    }
  }
}