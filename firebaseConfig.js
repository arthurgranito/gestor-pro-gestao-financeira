// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLqxRzv9OTqM6lMbYcJxiL3edt3kWYZlA",
  authDomain: "gestorpro-e3abc.firebaseapp.com",
  projectId: "gestorpro-e3abc",
  storageBucket: "gestorpro-e3abc.firebasestorage.app",
  messagingSenderId: "244864404092",
  appId: "1:244864404092:web:7dc929ba5d0434994c17f9",
  measurementId: "G-X6LVH9J79G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);