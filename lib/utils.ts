import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import moment from "moment";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateOTP() {

  // Declare a digits variable
  // which stores all digits
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 8; i++ ) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

export function expiryOTP() {
  const otpExpiry = new Date();
  otpExpiry.setMinutes(otpExpiry.getMinutes() + 15);
  return otpExpiry;
}

export function isNotExpiredOTP(date: Date | undefined) {
  if(!date) return;
  const now = moment(new Date());
  return moment.duration(now.diff(date)).asMinutes() < 15;
}