import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import appletConfig from "../../firebase-applet-config.json";

const firebaseConfig = {
  apiKey: (appletConfig as any).apiKey || import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: (appletConfig as any).authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: (appletConfig as any).projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: (appletConfig as any).storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: (appletConfig as any).messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: (appletConfig as any).appId || import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: (appletConfig as any).measurementId || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
