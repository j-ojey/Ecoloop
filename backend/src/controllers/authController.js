import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, lat, lng } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already used' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, location: { coordinates: lng && lat ? [lng, lat] : undefined } });
    const token = signToken({ id: user._id, role: user.role });
    res.status(201).json({ token, user: { id: user._id, name: user.name, ecoPoints: user.ecoPoints } });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken({ id: user._id, role: user.role });
    res.json({ token, user: { id: user._id, name: user.name, ecoPoints: user.ecoPoints } });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};
