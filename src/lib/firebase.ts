import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBT4GT3Z0TVQApV2YOzgtSg-WoNGkDgx0U",
  authDomain: "to-do-list-instashop.firebaseapp.com",
  projectId: "to-do-list-instashop",
  storageBucket: "to-do-list-instashop.firebasestorage.app",
  messagingSenderId: "100515856282",
  appId: "1:100515856282:web:a4a2be64205c7e20318423"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
