require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const connectToMongoDB = require('./config/db.config');
const User = require('./api/v1/models/user');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const auth = require('./api/v1/middlewares/auth');

const app = express();

//* this will help us to read req.body if coming request is in urlencoded or json format
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// understand and interact with cookie
app.use(cookieParser());

// database connection
(async () => await connectToMongoDB())();

const { BCRYPT_SALT, JWT_SECRET } = process.env;

app.get('/', (req, res, next) => {
  console.log(req.body);
  res.send('<h1>Hello Prashant I am fine and enjoying!</h1>');
});

app.post('/register', async (req, res, next) => {
  try {
    //* get all data from body
    const { firstName, lastName, email, password } = req.body;

    //* all the data should exists - email
    if (!(firstName && lastName && email && password)) {
      return res.status(400).json({ msg: 'All fields are mandatory!' });
    }

    //* check if user already exists
    const existingUer = await User.findOne({ email });
    if (existingUer) {
      return res
        .status(401)
        .json({ msg: 'User already exists with this email' });
    }

    // encrypt the password
    const encPassword = await bcrypt.hash(password, Number(BCRYPT_SALT));

    // save the user in DB
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: encPassword,
    });

    // generate a toke for user and send it
    const token = jwt.sign({ id: user._id, email }, JWT_SECRET, {
      expiresIn: '15m',
    });

    user.token = token;
    user.password = undefined; // for not sending to the client

    return res.status(201).json(user);
  } catch (error) {
    console.log(error);
  }
});

app.post('/login', async (req, res, next) => {
  try {
    // get all data from frontend
    const { email, password } = req.body;
    if (!(email && password)) {
      return res.status(400).json({ err: 'email and password is mandatory!' });
    }

    // find user in DB
    const user = await User.findOne({ email });
    // match the password
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        {
          id: user._id,
          email,
        },
        JWT_SECRET,
        {
          expiresIn: '15m',
        }
      );

      // send a token
      user.token = token;
      user.password = undefined;

      // cookie section
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      return res.status(200).cookie('token', token, options).json({
        token,
        success: true,
        user,
      });
    }

    return res.status(400).json({ err: 'email or password is not correct!' });
  } catch (error) {
    console.log(error);
  }
});

app.get('/dashboard', auth, (req, res) => {
  console.log(req.user);
  return res.status(200).json({
    msg: 'Welcome to dashboard!',
  });
});
module.exports = app;
