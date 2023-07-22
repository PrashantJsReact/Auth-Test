require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const connectToMongoDB = require('./config/db.config');
const { authRoutes } = require('./api/v1/routes');

const { isSessionActiveAndValid } = require('./api/v1/middlewares');

const app = express();

//* this will help us to read req.body if coming request is in urlencoded or json format
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//* understand and interact with cookie
app.use(cookieParser());

// setting HTTP response headers.
app.use(helmet());

// compress all responses
app.use(compression());

const apiLimiter = rateLimit({
  windowMs: 1000, // 1 minutes
  max: 2, // Limit each IP to 2 requests per `window` (here, per 1 minutes)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  trustProxy: true, // Trust the X-Forwarded-For header (if you're behind a proxy/load balancer)
});

// Apply the rate limiter to all requests
app.use(apiLimiter);

//* database connection
(async () => await connectToMongoDB())();

//* creating session and storing into DB
const { SESSION_SECRET, DB_NAME } = process.env;
app.use(
  session({
    secret: SESSION_SECRET,
    saveUninitialized: false, // don't create session until something stored
    resave: false, // don't save session if unmodified
    httpOnly: true, // client can not modify
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
      dbName: DB_NAME,
      collectionName: 'sessions',
      ttl: 15 * 60, // todo 15 min
    }),
  })
);

app.get('/', isSessionActiveAndValid, (req, res, next) => {
  res.send('<h1>Hello Prashant I am fine and enjoying!</h1>');
});

// auth route for register, login and forgot password
app.use('/api/auth', authRoutes);

app.get('/api/dashboard', isSessionActiveAndValid, (req, res) => {
  console.log(req.user);
  return res.status(200).json({
    msg: 'Welcome to dashboard!',
  });
});

// Handle syntax error
app.use((error, req, res, next) => {
  console.log(error);
  res
    .status(500)
    .json({ error: 'Invalid request!, Please check api documentation' });
});

module.exports = app;
