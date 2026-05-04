import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAw4IJLFnPdA_HnQw5tvSSxgabmdQANwQc",
  authDomain: "habibi-airways-4432.firebaseapp.com",
  projectId: "habibi-airways-4432",
  storageBucket: "habibi-airways-4432.firebasestorage.app",
  messagingSenderId: "539135320722",
  appId: "1:539135320722:web:cd43f5a04d78d1e1543c4b",
  measurementId: "G-6EDCS61B84"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider, analytics };
export default app;