const jwt = require("jsonwebtoken");
const con = require('../config/db');


const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ){
    try{
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const query = "SELECT * FROM users WHERE id = ?";

      con.query(query, [decoded.id], (err, result) => {
        if (err) {
          console.log("Error fetching user: ", err);
          return res.status(500).json({ message: "Internal Server Error" });
        }
        if (result.length === 0) {
          return res.status(404).json({ message: "User not found" });
        }
        req.user = result[0];

      next();
      });
    } catch(error){
      console.log(error);
      res.status(401);
      throw new Error("Not Authorized");
    }
    if (!token) {
      res.status(401);
      throw new Error("Not Authorized, no token");
    }
  }
}
module.exports = { protect }