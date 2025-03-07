const sql = require('mysql2');


const con = sql.createPool({
    host: "nodedb.cn20susgqi9s.ap-south-1.rds.amazonaws.com",
    port: "3306",
    user: "root",
    password: "Admin@123",
    database: "quiz_master"
  });

  module.exports = con; 
