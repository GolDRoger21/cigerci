import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCbF9oLqQrvg6FKdNQWjKhYlG07Ayf5YBU",
  authDomain: "cigerci.firebaseapp.com",
  projectId: "cigerci",
  storageBucket: "cigerci.firebasestorage.app",
  messagingSenderId: "472843761614",
  appId: "1:472843761614:web:e46cc1961f3efc730d9d9f",
  measurementId: "G-K5FETPYKYL"
};

// SSR-safe Firebase initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
