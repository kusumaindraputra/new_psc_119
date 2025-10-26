// Jest setup for PSC 119 backend tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.CORS_ORIGIN = '*';
process.env.UPLOAD_DIR = './uploads_test';

const fs = require('fs');
const path = require('path');
const { sequelize } = require('../src/models');

// Ensure uploads_test dir exists
const uploadDir = process.env.UPLOAD_DIR;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

beforeAll(async () => {
  // Initialize in-memory DB schema
  await sequelize.sync({ force: true });
});

beforeEach(async () => {
  // Clean DB between tests to avoid cross-test pollution
  const models = sequelize.models;
  const modelNames = Object.keys(models);
  // Disable foreign key checks to allow truncation order-agnostic
  await sequelize.query('PRAGMA foreign_keys = OFF');
  for (const name of modelNames) {
    if (models[name].destroy) {
      await models[name].destroy({ where: {}, force: true, truncate: true });
    }
  }
  await sequelize.query('PRAGMA foreign_keys = ON');
});

afterAll(async () => {
  // Close all database connections
  await sequelize.close();
  
  // Give a moment for cleanup
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Optional: clean uploads_test directory
  try {
    const rimraf = dir => {
      if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach((file) => {
          const curPath = path.join(dir, file);
          if (fs.lstatSync(curPath).isDirectory()) {
            rimraf(curPath);
          } else {
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(dir);
      }
    };
    rimraf(uploadDir);
  } catch (_) {
    // ignore cleanup errors in CI
  }
});
