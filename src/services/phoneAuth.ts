import { auth, db } from "../firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";
import {
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  getDocs
} from "firebase/firestore";

export const setupRecaptcha = () => {
  const container = document.getElementById("recaptcha-container");
  if (!container) throw new Error("reCAPTCHA container missing");

  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
  }

  // ✅ FIXED ORDER
  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    { size: "invisible" }
  );
};

export const sendOTP = async (phone: string) => {
  try {
    if (!phone.startsWith("+91")) {
      throw new Error("Use +91 format");
    }

    setupRecaptcha();

    const appVerifier = window.recaptchaVerifier;

    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phone,
      appVerifier
    );

    window.confirmationResult = confirmationResult;

    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const verifyOTP = async (otp: string) => {
  try {
    if (!window.confirmationResult) {
      throw new Error("Send OTP first");
    }

    const result = await window.confirmationResult.confirm(otp);
    const user = result.user;

    await saveUser(user.phoneNumber || "", user.uid);

    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const saveUser = async (phone: string, uid: string) => {
  const q = query(collection(db, "users"), where("uid", "==", uid));
  const snap = await getDocs(q);

  if (snap.empty) {
    await addDoc(collection(db, "users"), {
      uid,
      phone,
      createdAt: Timestamp.now()
    });
  }
};

export const resetPhoneAuth = () => {
  window.confirmationResult = null;
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }
};

declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}