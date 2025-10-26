const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const db = {};

// Import models
db.User = require('./User')(sequelize);
db.Report = require('./Report')(sequelize);
db.Assignment = require('./Assignment')(sequelize);
db.ReportLog = require('./ReportLog')(sequelize);
db.MasterCategory = require('./MasterCategory')(sequelize);
db.MasterUnit = require('./MasterUnit')(sequelize);
db.MasterVehicle = require('./MasterVehicle')(sequelize);

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
