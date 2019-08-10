import { Entity, Column, BaseEntity, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { Snowflake } from 'awesome-djs';
import { OptionalKeys } from 'utility-types';

export type ReminderData = Pick<Reminder, OptionalKeys<Reminder>>;

@Entity()
export default class Reminder extends BaseEntity {
  @PrimaryColumn()
  public userId?: Snowflake;

  @CreateDateColumn()
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