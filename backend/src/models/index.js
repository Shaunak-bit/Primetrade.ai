const sequelize = require('../config/db');
const User = require('./User');
const Task = require('./Task');

// Associations
User.hasMany(Task, {
  foreignKey: 'userId',
  as: 'tasks',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Task.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  sequelize,
  User,
  Task
};
