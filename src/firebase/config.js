import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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

// SSR-safe & Multi-tab Offline Persistent Cache Config for Firestore
let db;
if (typeof window !== "undefined") {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} else {
  db = getFirestore(app);
}

// Firebase Authentication — used to gate the admin panel (replaces the old
// shared passcode that was exposed in the client bundle & Firestore rules).
const auth = getAuth(app);

export { app, db, auth };
