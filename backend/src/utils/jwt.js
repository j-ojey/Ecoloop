import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const signToken = (payload, expiresIn = '24h') =>
  jwt.sign(payload, config.jwtSecret, { expiresIn });

export const verifyToken = (token) => jwt.verify(token, config.jwtSecret);
