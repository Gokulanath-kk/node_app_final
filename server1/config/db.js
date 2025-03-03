const sql = require('mysql2');

// Define the connection pool
const con = sql.createPool({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "root",
  database: "quiz_master"
});

// Export the connection
module.exports = con;
