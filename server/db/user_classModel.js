var Sequelize = require('sequelize');
var db = require('./db.js');
var User = require('./userModel');
var Class = require('./classModel');

// var user_class = db.define('users', {
//   id: {
//     type: Sequelize.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   user_id: {
//     type: Sequelize.INTEGER,
//     unique: false
//   },
//   class_id: {
//     type: Sequelize.INTEGER
//     unique: false
//   }
// })

User.belongsToMany(Class, {
  through: 'user_class',
  foreignKey: 'user_id'
});

Class.belongsToMany(User, {
  through: 'user_class',
  foreignKey: 'class_id'
});
// console.log('synced');
// user_class.sync({force: true})
// module.exports = user_class;