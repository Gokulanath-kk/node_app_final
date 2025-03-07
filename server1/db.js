const sql = require('mysql2');


const con = sql.createPool({
    host: "node-database-xplore.cle6q2c8ewg3.eu-north-1.rds.amazonaws.com",
    port: "3306",
    user: "root",
    password: "root",
    database: "quiz_master"
  });

  module.exports = con; 
