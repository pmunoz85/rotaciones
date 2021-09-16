const db = {};
const Sequelize = require('sequelize');

let sequelize;

if (process.env.DATABASE_URL) {
  // PostgreSql Heroku PRODUCTION
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }, 
    /*
    dialect: 'postgres',
    protocol: 'postgres',
    native: true,
    ssl: true,
    port: 5432,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    */
  });
} else {
  // PostgreSql
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
      port: process.env.DB_PORT,
      pool: {
        max: parseInt(process.env.DB_POOL_MAX, 10),
        min: parseInt(process.env.DB_POOL_MIN, 0),
        acquire: parseInt(process.env.DB_POOL_ACQUIRE, 30000),
        idle: parseInt(process.env.DB_POOL_IDLE, 10000),
      },
    }
  );
}

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Tablas
db.Users = require('../models/users')(db.sequelize, db.Sequelize);
db.Tokens = require('../models/tokens')(db.sequelize, db.Sequelize);
db.UserRol = require('../models/user_rol')(db.sequelize, db.Sequelize);
db.Grupos = require('../models/grupos')(db.sequelize, db.Sequelize);
db.GrupoUser = require('../models/grupo_user')(db.sequelize, db.Sequelize);
db.Eventos = require('../models/eventos')(db.sequelize, db.Sequelize);

db.Grupos.belongsToMany(db.Users, {
  through: db.GrupoUser,
});
db.Users.belongsToMany(db.Grupos, {
  through: db.GrupoUser,
});

db.Grupos.hasMany(db.Eventos);
db.Eventos.belongsTo(db.Grupos);

db.Users.hasMany(db.Eventos);
db.Eventos.belongsTo(db.Users);

/*
db.Grupos.hasMany(db.GrupoUser);
db.GrupoUser.belongsTo(db.Grupos);

db.Users.hasMany(db.GrupoUser);
db.GrupoUser.belongsTo(db.Users);
*/

//db.Users.hasMany(db.GrupoUser);
//db.GrupoUser.belongsTo(db.Users);

//db.Grupos.hasMany(db.Eventos);
//db.GrupoUser.belongsTo(db.Eventos);

//db.Users.hasMany(db.Eventos);
//db.GrupoUser.belongsTo(db.Eventos);

module.exports = db;
