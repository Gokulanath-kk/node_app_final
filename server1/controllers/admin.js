const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');





module.exports = (con) => {



  const router = require("express").Router();

  const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
  };

  router.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;
    console.log(req.body);


    if (!name || !email || !password || !role) {
      return res.status(400).send("All fields are required");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
    con.query(checkEmailQuery, [email], (err, result) => {
      if (err) {
        console.error("Error checking email: ", err);
        return res.status(500).send(err);
      }


      if (result.length > 0) {
        return res.status(409).send('Email Already Exists');
      }


      const insertQuery = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
      con.query(insertQuery, [name, email, hashedPassword, role], (err, result) => {
        if (err) {
          console.error("Error inserting admin data: ", err);
          return res.status(500).send(err);
        }
        const token = generateToken(result.insertId)
        res.status(201).send({
          message: "Admin data inserted successfully", id: result.insertId, name,
          email,
          password,
          role,
          token
        });
      });
    });
  });


  router.get("/adminData/:id", async (req, res) => {
    const adminId = req.params.id;
    const admindata = "select * from users where id = ?";
    con.query(admindata, [adminId], (err, adminresult) => {
      if (err) {
        return res.status(500).json({ message: "the server is err" })
      }

      return res.status(200).json(adminresult)
    })

  })

  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;


      if (!email || !password) {
        return res.status(400).json({ message: "All fields are required." });
      }



      const [adminResult] = await con.promise().query(
        "SELECT * FROM users WHERE email = ? ",
        [email]
      );
      if (adminResult.length === 0) {
        return res.status(404).json({ message: "Admin not found. Please register or provide valid credentials." });
      }

      // Compare the provided password with the stored hashed password
      const isPasswordValid = await bcrypt.compare(password, adminResult[0].password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }

      const token = generateToken(adminResult[0].id);

      res.status(200).json({
        id: adminResult[0].id,
        name: adminResult[0].name,
        email: adminResult[0].email,
        token: token
      });
    } catch (error) {
      console.error("Error during login:", error.message, error.stack);
      res.status(500).json({ message: "Internal server error" });
    }
  });


  router.get('/me', async (req, res) => {
    const query = "SELECT id, name, email FROM users;";
    con.query(query, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching users", error: err });
      }
      res.status(200).json(result);
    });
  });




  return router;
};
