'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.addColumn('Permissions', 'code', {
            type: Sequelize.STRING,
            defaultValue: false
        });
    },

    async down (queryInterface, Sequelize) {
        await queryInterface.removeColumn('Permissions', 'code');
    }
};
