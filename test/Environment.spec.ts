/* tslint:disable:no-unused-expression*/
/* tslint:disable:no-implicit-dependencies*/

import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';

suite('Check dotenv', () => {
  test('ribbon token should be set', () => {
    const token = process.env.BOT_TOKEN;

    expect(token).to.be.ok;
  });
  test('google api token should be set', () => {
    const token = process.env.GOOGLE_API_KEY;

    expect(token).to.be.ok;
  });
});