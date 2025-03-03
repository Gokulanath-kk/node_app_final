const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

module.exports = (con) => {
  // router.post(
  //   '/login',
  //   [
  //     check('email', 'Valid email is required').isEmail(),
  //     check('password', 'Password is required').exists(),
  //   ],
  //   (req, res) => {
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       return res.status(400).json({ errors: errors.array() });
  //     }

  //     const { email, password } = req.body;
  //     console.log(req.body , "Data");
      

  //     con.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
  //       if (err) return res.status(500).json({ message: 'Database error.' });

  //       if (results.length === 0) {
  //         return res.status(401).json({ message: 'Invalid email or password.' });
  //       }

  //       const user = results[0];
  //       const isMatch = await bcrypt.compare(password, user.password);

  //       if (!isMatch) {
  //         return res.status(401).json({ message: 'Invalid email or password.' });
  //       }

  //       const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  //       res.status(200).json({
  //         message: 'Login successful.',
  //         token,
  //         role: user.role,
  //       });
  //     });
  //   }
  // );




 
 router.post("/login", (req, res) => {
  const { email, password } = req.body;

  
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

 
  const query = "SELECT * FROM users WHERE email = ? AND password = ?";
  con.execute(query, [email, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "An error occurred while processing your request." });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    
    const { password, ...userWithoutPassword } = results[0];
    res.status(200).json(userWithoutPassword);
  });
});

  
  router.get('/admin-data', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
        return res.status(403).json({ message: 'Access denied.' });
      }

      res.status(200).json({ message: 'Admin data accessed successfully.', role: decoded.role });
    } catch (err) {
      res.status(401).json({ message: 'Invalid or expired token.' });
    }
  });

  return router;
};
