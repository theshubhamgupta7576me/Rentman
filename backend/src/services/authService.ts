import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet } from '../config/database';
import { User, RegisterRequest, LoginRequest, AuthResponse } from '../types';
import { JWT_SECRET } from '../middleware/auth';

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  try {
    // Validate input
    if (!data.password) {
      return { success: false, message: 'Password is required' };
    }

    if (data.password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    if (!data.email && !data.phoneNumber) {
      return { success: false, message: 'Either email or phone number is required' };
    }

    if (data.confirmPassword && data.password !== data.confirmPassword) {
      return { success: false, message: 'Passwords do not match' };
    }

    // Check if user already exists
    if (data.email) {
      const existingEmail = await dbGet('SELECT * FROM users WHERE email = ?', [data.email]);
      if (existingEmail) {
        return { success: false, message: 'Email already registered' };
      }
    }

    if (data.phoneNumber) {
      const existingPhone = await dbGet('SELECT * FROM users WHERE phoneNumber = ?', [data.phoneNumber]);
      if (existingPhone) {
        return { success: false, message: 'Phone number already registered' };
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const userId = uuidv4();
    const createdAt = new Date().toISOString();

    await dbRun(
      'INSERT INTO users (id, email, phoneNumber, password, createdAt) VALUES (?, ?, ?, ?, ?)',
      [userId, data.email || null, data.phoneNumber || null, hashedPassword, createdAt]
    );

    // Create default settings
    await dbRun(
      'INSERT INTO settings (userId, defaultUnitPrice) VALUES (?, ?)',
      [userId, 8]
    );

    // Generate token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

    return {
      success: true,
      user: {
        id: userId,
        email: data.email,
        phoneNumber: data.phoneNumber,
      },
      token,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed' };
  }
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  try {
    if (!data.password) {
      return { success: false, message: 'Password is required' };
    }

    // Find user by email or phone number
    let user: any;
    if (data.email) {
      user = await dbGet('SELECT * FROM users WHERE email = ?', [data.email]);
    } else if (data.phoneNumber) {
      user = await dbGet('SELECT * FROM users WHERE phoneNumber = ?', [data.phoneNumber]);
    } else {
      return { success: false, message: 'Either email or phone number is required' };
    }

    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
      token,
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed' };
  }
}

