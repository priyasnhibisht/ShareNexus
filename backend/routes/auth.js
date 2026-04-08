const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// signup route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, course } = req.body;

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
    });

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

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        course: user.course,
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
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // In Demo Mode, tell the user exactly what is wrong instead of being secretly secure
      return res.status(404).json({ message: 'No account found with that email address.' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5001';
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    // Send email with reset link
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'ShareNexus - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested a password reset for your ShareNexus account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Reset Password</a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetLink}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <p>Best regards,<br>ShareNexus Team</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return res.status(200).json({
        message: 'Password reset email sent successfully. Check your inbox.',
        resetToken,
        resetLink,
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Still return success but with a note about email failure
      return res.status(200).json({
        message: 'Password reset token created, but email sending failed. Use the provided link.',
        resetToken,
        resetLink,
      });
    }

  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// reset password route
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'New password is required' });
    }

    // Find user by token and check if it has not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Success! Your password has been changed.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
