/**
 * @file Ribbon Applet - initiates an instance of Ribbon
 * @author Jeroen Claassens (favna) <sharkie.jeroen@gmail.com>
 * @copyright © 2017-2018 Favna
 */

import { config } from 'dotenv';
import * as path from 'path';
import Ribbon from './Ribbon';

config({
    path: path.join(__dirname, '.env'),
    encoding: 'utf8',
    debug: false,
});

const start = () => new Ribbon(process.env.NODE_ENV === 'development' ? process.env.TEST_TOKEN : process.env.BOT_TOKEN).init();

start();
