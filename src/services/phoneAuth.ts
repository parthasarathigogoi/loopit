import { auth } from '../firebase';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { collection, addDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

let confirmationResult: ConfirmationResult | null = null;

export const initializeRecaptcha = () => {
  try {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: (token: any) => {
            console.log('reCAPTCHA verified');
          },
        }
      );
    }
    return window.recaptchaVerifier;
  } catch (error: any) {
    console.error('Error initializing reCAPTCHA:', error);
    throw new Error('Failed to initialize reCAPTCHA. Please refresh and try again.');
  }
};

export const sendOTP = async (phoneNumber: string) => {
  try {
    // Validate phone number format
    if (!phoneNumber.startsWith('+')) {
      throw new Error('Phone number must start with +');
    }
    if (phoneNumber.length < 10) {
      throw new Error('Invalid phone number');
    }

    // Initialize reCAPTCHA
    const appVerifier = initializeRecaptcha();

    // Send OTP
    confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      appVerifier
    );

    console.log('OTP sent successfully');
    return { success: true, message: 'OTP sent to your phone' };
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    
    if (error.code === 'auth/invalid-phone-number') {
      throw new Error('Invalid phone number. Please use +91 format.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please try again later.');
    } else if (error.message?.includes('reCAPTCHA')) {
      throw new Error('reCAPTCHA verification failed. Please refresh the page.');
    } else {
      throw new Error(error.message || 'Failed to send OTP');
    }
  }
};

export const verifyOTP = async (otp: string) => {
  try {
    if (!confirmationResult) {
      throw new Error('OTP not sent yet. Please send OTP first.');
    }

    if (otp.length !== 6) {
      throw new Error('OTP must be 6 digits');
    }

    // Verify OTP
    const result = await confirmationResult.confirm(otp);
    const user = result.user;

    // Save user to Firestore
    await saveUserToFirestore(user.phoneNumber || '', user.uid);

    console.log('User verified successfully:', user);
    return { success: true, user };
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    
    if (error.code === 'auth/invalid-verification-code') {
      throw new Error('Invalid OTP. Please try again.');
    } else if (error.code === 'auth/code-expired') {
      throw new Error('OTP has expired. Please request a new one.');
    } else {
      throw new Error(error.message || 'Failed to verify OTP');
    }
  }
};

export const saveUserToFirestore = async (phoneNumber: string, uid: string) => {
  try {
    // Check if user already exists
    const q = query(collection(db, 'users'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // User doesn't exist, create new user
      await addDoc(collection(db, 'users'), {
        uid,
        phoneNumber,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log('User saved to Firestore');
    } else {
      console.log('User already exists in Firestore');
    }
  } catch (error: any) {
    console.error('Error saving user to Firestore:', error);
    // Don't throw error - user is already authenticated
    // Firestore save is optional
  }
};

export const resetPhoneAuth = () => {
  confirmationResult = null;
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }
};

// Type definition for window
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null;
  }
}
