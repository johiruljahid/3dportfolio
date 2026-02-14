
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDTNpq-NDGgRAa1QIhsKZZ6k6eVWRJEHrM",
  authDomain: "portfolio-9343e.firebaseapp.com",
  projectId: "portfolio-9343e",
  storageBucket: "portfolio-9343e.firebasestorage.app",
  messagingSenderId: "310369196607",
  appId: "1:310369196607:web:accf3c01f830e4216f368a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
