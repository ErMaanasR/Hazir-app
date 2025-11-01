const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    req.user = user;
    next();
  });
};

const requireEmployer = (req, res, next) => {
  if (req.user.userType !== 'employer') {
    return res.status(403).json({ 
      success: false, 
      message: 'Employer access required' 
    });
  }
  next();
};

const requireEmployee = (req, res, next) => {
  if (req.user.userType !== 'employee') {
    return res.status(403).json({ 
      success: false, 
      message: 'Employee access required' 
    });
  }
  next();
};

module.exports = { 
  authenticateToken, 
  requireEmployer, 
  requireEmployee 
};