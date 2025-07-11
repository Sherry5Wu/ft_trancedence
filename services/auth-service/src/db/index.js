const { Sequelize } = require('sequelize');
const User = require('./models/user');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH,
});

const UserModel = User(sequelize);

module.exports = {
  sequelize,
  User: UserModel,
};
