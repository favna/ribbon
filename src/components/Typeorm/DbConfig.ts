import { ConnectionOptions, Connection, createConnection, getConnection } from 'typeorm';
import Warning from './Entities/Warning';
import Casino from './Entities/Casino';
import CasinoTimeout from './Entities/CasinoTimeout';
import Countdown from './Entities/Countdown';
import Pasta from './Entities/Pasta';
import Reminder from './Entities/Reminder';
import Timer from './Entities/Timer';
import path from 'path';
import { prod } from '../Utils';

/** The root path of the project to easily resolve the path to the database files */
export const projectRoot = path.resolve(__dirname, '..', '..', '..');

/**
 * Creates the configuration required to load initialize a database connection
 * @param {ConnectionOptions} options Any additional TypeNorm ConenctionOptions to pass
 * @returns {ConnectionOptions} Options used to connect to a database
 * @private
 */
export const config: ConnectionOptions =
{
  database: path.join(projectRoot, 'src', 'data', 'databases', 'dev_store.sqlite'),
  type: 'sqlite',
  name: 'db_con',
  logging: true,
  synchronize: true,
  entities: [ Casino, CasinoTimeout, Countdown, Pasta, Reminder, Timer, Warning ],

  ...(prod && {
    database: path.join(projectRoot, 'dist', 'data', 'databases', 'prod_store.sqlite'),
    logging: false,
    synchronize: false,
  }),
};

/**
 * Creates or fetches an existing database connection based on the connection name
 * @returns {Promise<Connection>} The database connection
 */
export const connect = async (): Promise<Connection> => {
  let connection: Connection;

  try {
    connection = getConnection(config.name);
  } catch (err) {
    connection = await createConnection(config);
  }

  return connection;
};

export default connect;