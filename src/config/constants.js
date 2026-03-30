const config = {
  port: process.env.PORT || 5000,
  db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  },
  db_test: {
    user_test: process.env.DB_USER_TEST,
    host_test: process.env.DB_HOST_TEST,
    database_test: process.env.DB_DATABASE_TEST,
    password_test: process.env.DB_PASSWORD_TEST,
    port_test: process.env.DB_PORT_TEST || 5432,
  },
  jwtSecret: process.env.JWT_SECRET,
};

module.exports = config;
