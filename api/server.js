const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const sessions = require('express-session'); // install express-session
const KnexSessionStore = require('connect-session-knex')(sessions); // to store sessions in the db

const authRouter = require('../auth/auth-router.js');
const usersRouter = require('../users/users-router.js');
const knex = require('../database/dbConfig.js');

const server = express();

const sessionConfig = {
  // session storage options
  name: 'chocolatechip', // default would be sid, change to keep the library we chose a secret
  secret: 'keep it secret, keep it safe', // used for encryption (must be an environment variable)
  saveUninitialized: true, // has implications with GDPR laws.  false requires the user to permit cookies.  use true in development but false in production.  in production, override this setting after getting permission
  resave: false,

  // how to store the sessions
  store: new KnexSessionStore({
    // DO NOT FORGET THE 'NEW' KEYWORD
    knex, // imported from dbConfig.js
    createtable: true,

    // optional config
    clearInterval: 1000 * 60 * 10, // defaults to 6000ms
    sidfieldname: 'sid',
    tablename: 'sessions' // names the table where active sessions are stored
  }),

  // cookie options
  cookie: {
    maxAge: 1000 * 60 * 10, // 10 min in milliseconds
    secure: process.env.NODE_ENV === 'production' ? true : false, // if false, the cookie is sent over http, if true only send over https (use environment variable here too)
    httpOnly: true // if true, JS cannot access the cookie
  }
};

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(sessions(sessionConfig)); // add a req.session object

server.use('/api/auth', authRouter);
server.use('/api/users', usersRouter);

server.get('/', (req, res) => {
  res.json({ api: 'up' });
});

module.exports = server;
