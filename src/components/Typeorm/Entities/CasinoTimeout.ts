import { Entity, BaseEntity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Snowflake } from 'awesome-djs';
import { NonFunctionKeys } from 'utility-types';

export type CasinoTimeoutData = Pick<CasinoTimeout, Exclude<NonFunctionKeys<CasinoTimeout>, undefined>>;

@Entity()
export default class CasinoTimeout extends BaseEntity {
  @PrimaryColumn()
  public guildId?: Snowflake;

  @UpdateDateColumn()
  public timeout?: Date;

  public constructor(data?: CasinoTimeoutData) {
    super();

    if (data) {
      this.guildId = data.guildId;
      this.timeout = data.timeout;
    }
  }
}