import { z } from 'zod';
import { REGEX } from '@/constants/regex.constants';

export const requiredNameSchema = (max = 100) =>
  z.string().min(1, 'This field is required').max(max);

export const optionalNameSchema = (max = 100) => z.string().max(max).optional();

export const indianPhoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(REGEX.phoneIn, 'Enter a valid 10-digit mobile number');

export const optionalIndianPhoneSchema = z
  .string()
  .regex(REGEX.phoneIn, 'Enter a valid 10-digit mobile number')
  .optional()
  .or(z.literal(''));

export const dialCodeSchema = z
  .string()
  .min(1, 'Dial code is required')
  .regex(REGEX.dialCodeStrict, 'Invalid dial code');

export const optionalDialCodeSchema = z
  .string()
  .regex(REGEX.dialCodeStrict, 'Invalid dial code')
  .optional()
  .or(z.literal(''));

export const optionalEmailSchema = z
  .string()
  .regex(REGEX.email, 'Invalid email')
  .optional()
  .or(z.literal(''));

export const optionalAadhaarSchema = z
  .string()
  .regex(REGEX.aadhaar, 'Aadhaar must be exactly 12 digits')
  .optional()
  .or(z.literal(''));
