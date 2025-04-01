const sequelize = require('./config/db');
require('./models');

async function sync() {
  try {
    await sequelize.sync({ force: true });
    console.log('Tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

sync();