import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';
import { Snowflake } from 'discord.js';
import { NonFunctionKeys } from 'utility-types';

export type ReminderData = Pick<Reminder, Exclude<NonFunctionKeys<Reminder>, undefined>>;

@Entity()
export default class Reminder extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column()
  public userId?: Snowflake;

  @Column()
  public date?: string;

  @Column({ nullable: false, default: '' })
  public content?: string;

  public constructor(data?: ReminderData) {
    super();

    if (data) {
      this.id = data.id;
      this.userId = data.userId;
      this.date = data.date;
      this.content = data.content;
    }
  }
}