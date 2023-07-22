const jwt = require('jsonwebtoken');

const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = process.env;
const { generateAccessToken } = require('../utils');

const auth = (req, res, next) => {
  // grab refresh and access token from session
  const { accessToken, refreshToken } = req.session;
  console.log('Access Token : ', accessToken);
  console.log('Refresh Token : ', refreshToken);

  // if no token, stop there
  if (!(accessToken && refreshToken)) {
    return res.status(404).json({ err: 'Unauthorized access' });
  }

  try {
    // decode that token and get id
    const decodedAccessToken = jwt.verify(accessToken, JWT_ACCESS_SECRET);
    console.log('Access Token Info', decodedAccessToken);

    req.user = decodedAccessToken;
  } catch (error) {
    console.log(error.name);
    // if token expired then reassign the token and attach to the user
    if (error.name === 'TokenExpiredError') {
      try {
        // verify refresh token is valid or not
        const decodeRefreshToken = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

        const userInfo = {
          id: decodeRefreshToken.id,
          email: decodeRefreshToken.email,
        };

        // if refresh token is valid create new access token
        const newAccessToken = generateAccessToken(userInfo);
        console.log('New Access Token', newAccessToken);

        req.session.accessToken = newAccessToken;

        req.user = userInfo;
      } catch (error) {
        console.log(error);
        req.session.destroy();
        return res
          .status(401)
          .json({ message: 'Invalid or expired refresh token.' });
      }
    } else {
      //! todo error handle
      return res.status(500).json({ error: 'Failed to authenticate token.' });
    }
  }

  return next();
};

module.exports = auth;
