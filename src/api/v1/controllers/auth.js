const signUpController = async (req, res, next) => {
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
};

const loginController = async (req, res, next) => {
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
};

const resetPasswordRequestController = async (req, res, next) => {};

const resetPasswordController = async (req, res, next) => {};

module.exports = {
  signUpController,
  loginController,
  resetPasswordRequestController,
  resetPasswordController,
};
