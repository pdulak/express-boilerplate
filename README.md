# express-site-boilerplate

To install dependencies:

```bash
npm install
```

To run:

```bash
node index.js
```

---

## Sequelize

```shell
npx sequelize-cli init
npx sequelize-cli model:generate --name User --attributes uuid:string,name:string,email:string,password:string,active:boolean
npx sequelize-cli db:migrate
```

### To add a new column named is_admin and rename the active column to is_active

Create a new migration file using sequelize-cli to add the is_admin column:

```shell
npx sequelize-cli migration:generate --name add-is-admin-column
```

Update the generated migration file (located in the migrations directory) to add the is_admin column:

```js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'is_admin', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'is_admin');
  }
};
```

Run the migration using sequelize-cli to apply the changes to the database:

```shell
npx sequelize-cli db:migrate
```

Create a new migration file using sequelize-cli to rename the active column to is_active:

```shell
npx sequelize-cli migration:generate --name rename-active-column
```

Update the generated migration file to rename the active column to is_active:

```js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Users', 'active', 'is_active');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Users', 'is_active', 'active');
  }
};
```

Run the migration to rename the active column:

```shell
npx sequelize-cli db:migrate
```

---

## Relations in sequelize

1. create tables as usual:
```shell
npx sequelize-cli model:generate --name Permission --attributes name:string
npx sequelize-cli model:generate --name UserPermission --attributes userId:integer,permissionId:integer
```
1. Adjust models in the `static(associate)` section