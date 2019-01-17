
import { config } from 'dotenv';
import path from 'path';

config({
    path: path.join(__dirname, '../src/.env'),
    encoding: 'utf8',
    debug: false,
});
