'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.renameColumn('Users', 'active', 'is_active');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.renameColumn('Users', 'is_active', 'active');
    }
};