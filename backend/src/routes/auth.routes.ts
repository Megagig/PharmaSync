import express from 'express';
import { login, register, getCurrentUser, logout } from '../controllers/auth.controller';

const router = express.Router();

// Auth routes
router.post('/login', login);
router.post('/register', register);
router.get('/me', getCurrentUser);
router.post('/logout', logout);

export default router; 