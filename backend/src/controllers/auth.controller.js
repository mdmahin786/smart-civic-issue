import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    console.log('Register request body:', req.body);

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Set admin role if email contains "admin" or if passed in body
    let assignedRole = role || 'citizen';
    if (email.toLowerCase().includes('admin')) {
      assignedRole = 'admin';
    }

    const user = await User.create({ name, email, password, phone, role: assignedRole });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          reputationScore: user.reputationScore,
          badges: user.badges,
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, ...user._doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.notificationsEnabled = req.body.notificationsEnabled !== undefined ? req.body.notificationsEnabled : user.notificationsEnabled;
      
      const updatedUser = await user.save();
      res.json({
        success: true,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        notificationsEnabled: updatedUser.notificationsEnabled,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: 'citizen' })
      .select('name reputationScore badges profilePic')
      .sort({ reputationScore: -1 })
      .limit(10);
    res.json({ success: true, leaderboard: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
