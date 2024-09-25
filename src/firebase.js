import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Importer Firestore
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB5KTcCZH0H77b4HlE5Vk98NXsER5fp8cY",
  authDomain: "blog-julie-jvs.firebaseapp.com",
  projectId: "blog-julie-jvs",
  storageBucket: "blog-julie-jvs.appspot.com",
  messagingSenderId: "1020469993720",
  appId: "1:1020469993720:web:d705aeb559b110b1cf5b0d",
  measurementId: "G-HLGNW3XGK6"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser l'authentification
const auth = getAuth(app);
const db = getFirestore(app);
export const storage = getStorage(app);

export { auth, db };