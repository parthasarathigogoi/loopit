import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoD0pER39z2ye63Jx65vHnfjrfuxW5pRY",
  authDomain: "loopit-572b5.firebaseapp.com",
  projectId: "loopit-572b5",
  storageBucket: "loopit-572b5.firebasestorage.app",
  messagingSenderId: "813099703704",
  appId: "1:813099703704:web:91a19d62bc330b5854dfed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Disable persistence to avoid issues with missing database
if (db) {
  db.settings({ experimentalForceLongPolling: true });
}

export const storage = getStorage(app);

export default app;
