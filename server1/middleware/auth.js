// const jwt = require('jsonwebtoken');

// const authMiddleware = (roles = []) => (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];

//   if (!token) {
//     return res.status(403).json({ message: 'Access denied. No token provided.' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');

//     if (roles.length > 0 && !roles.includes(decoded.role)) {
//       return res.status(403).json({ message: 'Access denied. Role not authorized.' });
//     }

//     req.user = decoded; 
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: 'Invalid or expired token.' });
//   }
// };

// module.exports = authMiddleware;
