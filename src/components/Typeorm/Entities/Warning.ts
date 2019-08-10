import { Entity, Column, BaseEntity, PrimaryColumn } from 'typeorm';
import { Snowflake } from 'awesome-djs';
import { NonFunctionKeys } from 'utility-types';

export type WarningData = Pick<Warning, Exclude<NonFunctionKeys<Warning>, undefined>>;

@Entity()
export default class Warning extends BaseEntity {
  @PrimaryColumn()
  public userId?: Snowflake;

  @PrimaryColumn()
  public guildId?: Snowflake;

  @Column()
  public tag?: string;

  @Column({ nullable: false, default: 0 })
  public points?: number;

  public constructor(data?: WarningData) {
    super();

    if (data) {
      this.userId = data.userId;
      this.guildId = data.guildId;
      this.tag = data.tag;
      this.points = data.points;
    }
  }
}