const mongoose = require('mongoose');

const { MONGODB_URI, USER, USER_PASSWORD, DB_NAME } = process.env;

const connectToMongoDB = async () => {
  await mongoose
    .connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      user: USER,
      pass: USER_PASSWORD,
      dbName: DB_NAME,
    })
    .then((res) => {
      console.log(`Connected to the ${res.connection.name}`);
    })
    .catch((error) => {
      console.log('Database Connection FAILED!');
      console.log(error);
      process.exit(1);
    });
};

module.exports = connectToMongoDB;
