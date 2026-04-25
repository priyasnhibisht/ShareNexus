const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');
const User = require('../models/User');
const auth = require('../middleware/auth');

// lazy init — only create the client when actually needed so the server
// can still start even if RESEND_API_KEY is not set
let resend = null;
function getResend() {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set in your .env file');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

// signup route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, course, phone } = req.body;

    if (!name || !email || !password || !course) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // check if user already exists before saving
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // hash the password, cant store plain text
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      course: course.trim(),
      phone: phone ? phone.trim() : '',
    });

    const token = jwt.sign(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          course: user.course,
          phone: user.phone,
        },
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        course: user.course,
        phone: user.phone,
        coins: user.coins,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    // if something goes wrong just send 500
    return res.status(500).json({ message: 'Server error' });
  }
});

// login endpoint, returns a token if credentials match
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          course: user.course,
        },
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        course: user.course,
        coins: user.coins,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// forgot password route
router.post('/forgot-password', async (req, res) => {
  try {
    console.log('1. Forgot password hit for:', req.body.email);
    
    const user = await User.findOne({ email: req.body.email });
    console.log('2. User found:', !!user);
    if (!user) return res.status(404).json({ message: 'Email not found' });
    
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();
    console.log('3. Token saved to DB');
    
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    console.log('4. Reset link:', resetLink);
    
    await getResend().emails.send({
      from: 'ShareNexus <onboarding@resend.dev>',
      to: user.email,
      subject: 'Reset Your ShareNexus Password',
      html: `<h2>Password Reset</h2><p>Click to reset your password (expires in 1 hour):</p><a href="${resetLink}">${resetLink}</a>`
    });
    console.log('5. Email sent successfully');
    
    res.json({ message: 'Reset link sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// reset password route
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Find user by token and check if it has not expired
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return res.status(200).json({ message: 'Success! Your password has been changed.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// get current user's coins
router.get('/coins', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ coins: user.coins });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
