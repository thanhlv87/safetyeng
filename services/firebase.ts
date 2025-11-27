import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCyaykbJsyKg7G1tWA8CqIa6_auQlSNG18",
  authDomain: "safety-eng.firebaseapp.com",
  projectId: "safety-eng",
  storageBucket: "safety-eng.firebasestorage.app",
  messagingSenderId: "578945090646",
  appId: "1:578945090646:web:d38806477c189921eae7f7",
  measurementId: "G-R8PQVW0TQT"
};

// Initialize Firebase (Check if already initialized to avoid hot-reload errors)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };