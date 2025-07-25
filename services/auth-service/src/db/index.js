/**
 * Three functions:
 *  - Initialize the database
 *  - Register models
 *  - Provide an interface for the rest of the website
 *    - sequelize: for DB-level operations or transactons;
 *    - User: for CRUD operations like User.findone() or User.create();
 *    - initDB(): a utility function to ensure the DB is ready when the app starts;
 *
 * index.js = database bootstrap + model registry + app-wide interface for DB operations.
 * It ensures that when your app starts, your models (like User) are linked to the DB,
 * and other parts of your app can easily use them.
 */

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

    // sequelize.sync()-> Syncs all defined models(like User) withe the database; By default,
    // it creates tables if they don't exit.
    // { alter: true }: It tells Sequelize to automatically alter existing tables to
    // match your model definition.
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database: ', error);
  }
};

export { sequelize, UserModel as User,  initDB };
