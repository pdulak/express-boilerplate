'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.bulkInsert('Permissions', [{
            name: 'Is User',
            code: 'is_user',
            createdAt: new Date(),
            updatedAt: new Date()
        },{
            name: 'Is Admin',
            code: 'is_admin',
            createdAt: new Date(),
            updatedAt: new Date()
        }], {});
    },

    async down (queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Permissions', null, {});
    }
};
