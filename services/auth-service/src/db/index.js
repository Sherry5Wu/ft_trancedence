import { Sequelize } from 'sequelize';
import User from './models/user.js';

// This instance use to manage the connection to auth database and perform queries.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  // The file path for the SQLite database is read from the environment variable DB_PATH.
  storage: process.env.DB_PATH,
  logging: false,
});

// Initiaize models, and let sequelize know the table structure
const UserModel = User(sequelize);

// Sync models
const initDB = async () => {
  try {
    // sequelize.authenticate(): checks if the app can connect to the SQLite database
    await sequelize.authenticate();
    console.log('Connection to SQLite has been established successfully!');
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database: ', error);
  }
};

export { sequelize, UserModel as User,  initDB };
