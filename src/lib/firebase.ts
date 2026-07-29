import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC3-K9E6Nqpz62Yduhs08c1Y2xWUF872Hs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "eduproof-c296a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "eduproof-c296a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "eduproof-c296a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "278888840550",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:278888840550:web:7457a1bdbc8e5a237e9ca7",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-TYX6C0HC0X"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
