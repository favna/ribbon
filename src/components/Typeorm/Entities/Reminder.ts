import { Entity, Column, BaseEntity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Snowflake } from 'awesome-djs';
import { NonFunctionKeys } from 'utility-types';

export type ReminderData = Pick<Reminder, Exclude<NonFunctionKeys<Reminder>, undefined>>;

@Entity()
export default class Reminder extends BaseEntity {
  @PrimaryColumn()
  public userId?: Snowflake;

  @UpdateDateColumn()
  public remindTime?: Date;

  @Column({ nullable: false, default: '' })
  public remindText?: string;

  public constructor(data?: ReminderData) {
    super();

    if (data) {
      this.userId = data.userId;
      this.remindTime = data.remindTime;
      this.remindText = data.remindText;
    }
  }
}