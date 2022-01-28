import express from 'express';
import audioController from './controller';
import { AudioService } from './service';
import { FileSystemStorage } from './storage';
import { Pool } from 'pg';

const port = process.env.PORT || 3000;
const pool = new Pool({
  host: process.env.POSTGRES_HOSTNAME || 'localhost',
  user: process.env.POSTGRES_USERNAME || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: process.env.POSTGRES_PORT || 5432,
  // Copied from the example pg pool docs:
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const file_strage = new FileSystemStorage(process.env.FILE_STORAGE || './data');

const app = new AudioService(pool, file_strage);

const web_app = express();
web_app.use(express.urlencoded({ type: undefined, verify: (req, _, buf) => {
  // @ts-ignore
  req.rawbody = buf;
}}));
web_app.use('/', audioController(app));
web_app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
