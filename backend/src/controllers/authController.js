const pool = require('../config/database');
const jwt = require('jsonwebtoken');

const sendOTP = async (req, res) => {
  const { phone_number } = req.body;

  if (!phone_number || phone_number.length !== 10) {
    return res.status(400).json({ 
      success: false, 
      message: 'Valid 10-digit phone number required' 
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 5 * 60 * 1000);

  try {
    await pool.query(
      `INSERT INTO otp_verification (phone_number, otp, expires_at) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (phone_number) 
       DO UPDATE SET otp = $2, expires_at = $3`,
      [phone_number, otp, expiry]
    );

    console.log(`OTP for ${phone_number}: ${otp}`);

    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      otp: otp
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP' 
    });
  }
};

const verifyOTP = async (req, res) => {
  const { phone_number, otp, user_type, name } = req.body;

  if (!phone_number || !otp || !user_type) {
    return res.status(400).json({ 
      success: false, 
      message: 'Phone number, OTP, and user type required' 
    });
  }

  try {
    const otpResult = await pool.query(
      'SELECT * FROM otp_verification WHERE phone_number = $1 AND otp = $2 AND expires_at > NOW()',
      [phone_number, otp]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }

    let userResult = await pool.query(
      'SELECT * FROM users WHERE phone_number = $1',
      [phone_number]
    );

    let user;
    if (userResult.rows.length === 0) {
      const newUser = await pool.query(
        'INSERT INTO users (phone_number, name, user_type, is_verified) VALUES ($1, $2, $3, true) RETURNING *',
        [phone_number, name || 'User', user_type]
      );
      user = newUser.rows[0];
    } else {
      user = userResult.rows[0];
    }

    const token = jwt.sign(
      { userId: user.id, userType: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    await pool.query('DELETE FROM otp_verification WHERE phone_number = $1', [phone_number]);

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        phone_number: user.phone_number,
        user_type: user.user_type
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Verification failed' 
    });
  }
};

module.exports = { sendOTP, verifyOTP };