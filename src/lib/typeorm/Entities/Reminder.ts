import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { NonFunctionKeys } from 'utility-types';

export type ReminderData = Pick<Reminder, Exclude<NonFunctionKeys<Reminder>, undefined>>;

@Entity()
export default class Reminder extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column()
  public userId?: string;

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