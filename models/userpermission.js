'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserPermission extends Model {
    static associate(models) {
      UserPermission.hasOne(models.User, {
        foreignKey: 'userId'
      });
      
      UserPermission.hasOne(models.Permission, {
        foreignKey: 'permissionId'
      })
    }
  }
  UserPermission.init({
    userId: DataTypes.INTEGER,
    permissionId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserPermission',
  });
  return UserPermission;
};