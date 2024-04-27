# express-site-boilerplate

### Instalation and configuration

1. Install dependencies: 
```bash
npm install
```

2. set environmental variables - copy .env-sample to .env and set variables in it. See Dev SMTP server notes below if you want to send emails locally.

3. copy and adjust config - in the `/config/` directory copy `config-sample.json` to `config.json` and adjust database configuration if needed. By default SQLite is in use. 

4. initialize database:

```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all --debug
# OR
npm run initdb
```

5. run:

```bash
node app.js
# OR
npm start
```

---

### Dev SMTP server

For development purposes you can use maildev to send and review emails locally. 

```bash
docker run -p 1080:1080 -p 1025:1025 maildev/maildev
```

Documentation: https://github.com/maildev/maildev

---

### Sequelize-related notes

---
#### Initialize Sequelize in new project

This step is not required in this repo.

```shell
npx sequelize-cli init
```

---
#### Create new DB table

```shell
npx sequelize-cli model:generate --name User --attributes uuid:string,name:string,email:string,password:string,active:boolean
npx sequelize-cli db:migrate
```

---
#### Add a new column named is_admin 

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

---
#### Rename the active column to is_active

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
#### Relations in sequelize

1. create tables as usual:
```shell
npx sequelize-cli model:generate --name Permission --attributes name:string
npx sequelize-cli model:generate --name UserPermission --attributes userId:integer,permissionId:integer
```
2. Adjust migration files to add `references` section
```js
    userId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'User',
            key: 'id'
        }
      },
```
3. Adjust models in the `static(associate)` section
```js
// in child table
UserPermission.belongsTo(models.User);
// in parent table
User.hasMany(models.UserPermission)
```

---
#### Seed table - fill with initial data

1. create seed file `npx sequelize-cli seed:generate --name demo-data`
2. fill the seed file with data - remember about `createdAt` and `updatedAt` fields because they cause validation errors if not filled
3. execute seed `npx sequelize-cli db:seed:all --debug`