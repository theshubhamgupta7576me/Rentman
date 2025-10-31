import express from 'express';
import { registerUser, loginUser } from '../services/authService';

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  const result = await registerUser(req.body);
  res.status(result.success ? 201 : 400).json(result);
});

// Login endpoint
router.post('/login', async (req, res) => {
  const result = await loginUser(req.body);
  res.status(result.success ? 200 : 401).json(result);
});

export default router;

