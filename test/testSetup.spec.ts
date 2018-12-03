/* tslint:disable:no-implicit-dependencies*/

import { config } from 'dotenv';
import { suite } from 'mocha-typescript';
import * as path from 'path';

suite('Load in Environment Variables', () => {
  config({
      path: path.join(__dirname, '../src/.env'),
      encoding: 'utf8',
      debug: false,
  });
});