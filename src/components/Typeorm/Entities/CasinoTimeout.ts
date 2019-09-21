import { Snowflake } from 'awesome-djs';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import { NonFunctionKeys } from 'utility-types';

export type CasinoTimeoutData = Pick<CasinoTimeout, Exclude<NonFunctionKeys<CasinoTimeout>, undefined>>;

@Entity()
export default class CasinoTimeout extends BaseEntity {
  @PrimaryColumn()
  public guildId?: Snowflake;

  @Column()
  public timeout?: string;

  public constructor(data?: CasinoTimeoutData) {
    super();

    if (data) {
      this.guildId = data.guildId;
      this.timeout = data.timeout;
    }
  }
}