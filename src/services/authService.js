const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthService {
  async register(userData) {
    const { name, email, phone, password, role } = userData;

    const existingUser = await User.findOne({
      where: {
        $or: [{ email }, { phone }]
      }
    });

    if (existingUser) {
      const error = new Error('User with this email or phone already exists');
      error.statusCode = 409;
      throw error;
    }

    const user = await User.create({
      name,
      email,
      phone,
      password_hash: password,
      role: role || 'field_officer'
    });

    return user;
  }

  async login(email, password) {
    const user = await User.findOne({ where: { email } });

    if (!user || !user.is_active) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Update last login
    await user.update({ last_login: new Date() });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return { user, token };
  }

  async getUserById(userId) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  async updateUser(userId, updateData) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    await user.update(updateData);
    return user;
  }

  async getAllUsers(filters = {}) {
    const where = {};
    
    if (filters.role) {
      where.role = filters.role;
    }
    
    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active;
    }

    const users = await User.findAll({ where });
    return users;
  }
}

module.exports = new AuthService();
