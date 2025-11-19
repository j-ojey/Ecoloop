import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { Item } from '../models/Item.js';
import { signToken } from '../utils/jwt.js';
import { sendPasswordResetEmail } from '../utils/email.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get user statistics
    const itemsListed = await Item.countDocuments({ user: req.user.id });
    const itemsExchanged = await Item.countDocuments({ user: req.user.id, status: 'exchanged' });

    // Get recent activity (mock data for now - you can implement real activity tracking)
    const recentActivity = [
      { description: 'Account created', date: user.createdAt, type: 'account' }
    ];

    res.json({
      ...user.toObject(),
      itemsListed,
      itemsExchanged,
      recentActivity
    });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;

    // Validate input
    if (name && name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }

    if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // Update user
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        ecoPoints: user.ecoPoints
      }
    });
  } catch (e) {
    if (e.code === 11000) {
      res.status(409).json({ message: 'Email already in use' });
    } else {
      res.status(500).json({ message: 'Server error', error: e.message });
    }
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, lat, lng, interests } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    // Enhanced password validation
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    if (!/(?=.*[a-z])/.test(password)) return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
    if (!/(?=.*[A-Z])/.test(password)) return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
    if (!/(?=.*\d)/.test(password)) return res.status(400).json({ message: 'Password must contain at least one number' });
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) return res.status(400).json({ message: 'Password must contain at least one special character' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already used' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, location: { coordinates: lng && lat ? [lng, lat] : undefined }, interests: interests || [] });
      const token = signToken({ id: user._id, role: user.role });
      res.status(201).json({ token, user: { id: user._id, name: user.name, ecoPoints: user.ecoPoints, role: user.role, suspended: user.suspended } });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: 'Incorrect email or password' });
      if (user.suspended) return res.status(403).json({ message: 'Account suspended' });
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Incorrect email or password' });
      const token = signToken({ id: user._id, role: user.role });
      res.json({ token, user: { id: user._id, name: user.name, ecoPoints: user.ecoPoints, role: user.role, suspended: user.suspended } });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token and expiration (1 hour)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: 'Password reset email sent' });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Enhanced password validation
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    if (!/(?=.*[a-z])/.test(password)) return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
    if (!/(?=.*[A-Z])/.test(password)) return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
    if (!/(?=.*\d)/.test(password)) return res.status(400).json({ message: 'Password must contain at least one number' });
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) return res.status(400).json({ message: 'Password must contain at least one special character' });

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    // Update password
    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};
