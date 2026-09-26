import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Resolver } from 'node:dns/promises';
dotenv.config({ path: new URL('../.env', import.meta.url).pathname.slice(1) });

const atlasUri = process.env.MONGODB_URI;
const srvBaseMatch = /mongodb\+srv:\/\/[^@]+@([^\/\?]+)/.exec(atlasUri || '');
const srvBase = srvBaseMatch ? srvBaseMatch[1] : null;
const r = new Resolver();
r.setServers(['8.8.8.8', '1.1.1.1', '9.9.9.9']);

const srv = await r.resolveSrv('_mongodb._tcp.' + srvBase);
const txt = (await r.resolveTxt(srvBase))[0].join('');
const qp = new URLSearchParams(txt);
const replicaSet = qp.get('replicaSet');
const authSource = qp.get('authSource') || 'admin';
const credMatch = /mongodb\+srv:\/\/([^:]+):([^@]+)@/.exec(atlasUri);
const user = encodeURIComponent(credMatch[1]);
const pass = encodeURIComponent(credMatch[2]);
const hosts = srv.map((row) => (row.name || row.target) + ':27017').join(',');
const legacy =
  'mongodb://' +
  user +
  ':' +
  pass +
  '@' +
  hosts +
  '/perfectrishta?ssl=true&replicaSet=' +
  replicaSet +
  '&authSource=' +
  authSource +
  '&retryWrites=true&w=majority&tls=true&appName=PerfectRishta';

process.env.MONGODB_URI = legacy;
const { default: app, startServer } = await import('../src/server.js');
await startServer();
console.log('\n=== Backend running, connected to ATLAS via legacy URI ===');
console.log('Server PID:', process.pid);
