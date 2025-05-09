// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBh3MXUolXMzhofdO9-eEE6IiH2uOH7Slg",
  authDomain: "testfirebasefanview.firebaseapp.com",
  databaseURL: "https://testfirebasefanview-default-rtdb.firebaseio.com",
  projectId: "testfirebasefanview",
  storageBucket: "testfirebasefanview.firebasestorage.app",
  messagingSenderId: "299143604685",
  appId: "1:299143604685:web:4f32e72b0b176fdffb7c84"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);