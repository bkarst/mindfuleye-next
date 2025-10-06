// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyArIpzDkLpSUPYtJkEb7jB07wbRkj7FQkk",
  authDomain: "mindful-eye.firebaseapp.com",
  projectId: "mindful-eye",
  storageBucket: "mindful-eye.firebasestorage.app",
  messagingSenderId: "774990176217",
  appId: "1:774990176217:web:5a0be5fe28e0aea847c3c8",
  measurementId: "G-79MFPW4X4J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only on client side
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export const auth = getAuth(app);
export { analytics };