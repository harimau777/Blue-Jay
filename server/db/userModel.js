var Sequelize = require('sequelize');
var db = require('./db');

var User = db.define('users', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: Sequelize.STRING, 
    allowNull: false, 
    unique: true
  }, 
  // firstName: {
  //   type: Sequelize.STRING
  // },
  // lastName: {
  //   type: Sequelize.STRING
  // },
  // email: {
  //   type: Sequelize.STRING, unique: true
  // },
  password: {
    type: Sequelize.STRING
  }
});
// console.log('synced');
// User.sync({force: true})
module.exports = User;