import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import env from './env.config';
import { IUser } from '../interfaces/user.interface';

export const generateToken = (user: IUser): string => {
  // Create the payload
  const payload = {
    id: (user._id as any).toString(),
    email: user.email,
    role: user.role,
  };

  // Use Buffer to create a compatible secret key
  const secretKey = Buffer.from(env.JWT_SECRET, 'utf-8');

  // Create the options with proper typing
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as any,
  };

  // Sign the token with the Buffer secret
  return jwt.sign(payload, secretKey, options);
};

export const verifyToken = (token: string): any => {
  // Use Buffer to create a compatible secret key
  const secretKey = Buffer.from(env.JWT_SECRET, 'utf-8');
  return jwt.verify(token, secretKey);
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
