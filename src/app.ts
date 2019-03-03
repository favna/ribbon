/**
 * @file Ribbon Applet - initiates an instance of Ribbon
 * @author Jeroen Claassens (favna) <support@favna.xyz>
 * @copyright © 2017-2018 Favna
 */

import { config } from 'dotenv';
import path from 'path';
import Ribbon from './Ribbon';

config({
    path: path.join(__dirname, '.env'),
    encoding: 'utf8',
    debug: false,
});

const start = () => new Ribbon((process.env.NODE_ENV as string) === 'development' ? (process.env.TEST_TOKEN as string) : (process.env.BOT_TOKEN as string)).init();

start();
