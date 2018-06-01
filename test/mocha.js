/**
 * @file Ribbon Tests - Test Ribbon with Mocha
 * @author Jeroen Claassens (favna) <sharkie.jeroen@gmail.com>
 * @copyright © 2017-2018 Favna  
 */

/* eslint-disable no-undef, no-unused-vars, sort-vars, no-mixed-requires, global-require*/
const Database = require('better-sqlite3'),
  assert = require('assert'),
  should = require('chai').should(),
  path = require('path'),
  {expect} = require('chai'),
  {Client, SyncSQLiteProvider} = require('discord.js-commando');

beforeEach('Injecting dotenv', () => {
  require('dotenv').config({path: path.join(__dirname, '../src/.env')});
});

describe('Check dotenv', () => {
  it('ribbon token should be set', () => {
    const token = process.env.ribbontoken;

    expect(token).to.be.ok;
  });
  it('google api token should be set', () => {
    const token = process.env.googleapikey;

    expect(token).to.be.ok;
  });
});

describe('Connect & Disconnect bot', () => {
  it('should connect then disconnect', () => {
    const client = new Client({
        commandPrefix: 's!!',
        owner: '112001393140723712',
        selfbot: false,
        unknownCommandResponse: false
      }),
      db = new Database(path.join(__dirname, '../src/data/databases/settings.sqlite3'));

    client.setProvider(
      new SyncSQLiteProvider(db)
    );
    let readyTracker = false;

    client.registry.registerDefaults();
    client.login(process.env.stripetoken);

    client.on('ready', () => {
      readyTracker = true;
      client.destroy();
      process.exit(); // eslint-disable-line no-process-exit
      expect(readyTracker).to.be.ok;
    });
  });
});