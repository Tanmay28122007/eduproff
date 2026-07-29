import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import appletConfig from "../../firebase-applet-config.json";

const firebaseConfig = {
  apiKey: appletConfig.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC3-K9E6Nqpz62Yduhs08c1Y2xWUF872Hs",
  authDomain: appletConfig.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "eduproof-c296a.firebaseapp.com",
  projectId: appletConfig.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || "eduproof-c296a",
  storageBucket: appletConfig.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "eduproof-c296a.firebasestorage.app",
  messagingSenderId: appletConfig.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "278888840550",
  appId: appletConfig.appId || import.meta.env.VITE_FIREBASE_APP_ID || "1:278888840550:web:7457a1bdbc8e5a237e9ca7",
  measurementId: appletConfig.measurementId || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-TYX6C0HC0X"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
