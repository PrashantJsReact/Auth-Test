const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;

const auth = (req, res, next) => {
  console.log(req.cookies);
  // grab token from cookie
  const { token } = req.cookies;

  // if no token, stop there
  if (!token) {
    return res.status(404).json({ err: 'please login first' });
  }

  try {
    // decode that token and get id
    const decode = jwt.verify(token, JWT_SECRET);
    console.log(decode);
    req.user = decode;
    // query to DB for that user id
  } catch (error) {
    console.log(error);
    return res.status(401).json({ err: 'Invalid token' });
  }

  return next();
};

module.exports = auth;
