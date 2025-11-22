// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDYQqXXs0FUdoruuk3Lgbou3SpOMFKZXn4",
  authDomain: "cafeteriauide.firebaseapp.com",
  projectId: "cafeteriauide",
  storageBucket: "cafeteriauide.firebasestorage.app",
  messagingSenderId: "890244852123",
  appId: "1:890244852123:web:f0d4fe5a34923d1964993e",
  measurementId: "G-GHBMJH2MMM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);