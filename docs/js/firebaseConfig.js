// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js"; //realtime db
// import { getFirestore } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js"; //firestore db

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

const fanviewConfig ={
  apiKey: "AIzaSyBuGvpdzs-5b61k4dKEhMkhG2V3lkmHbWA",
  authDomain: "fanview-f356a.firebaseapp.com",
  databaseURL: "https://fanview-f356a-default-rtdb.firebaseio.com",
  projectId: "fanview-f356a",
  storageBucket: "fanview-f356a.firebasestorage.app",
  messagingSenderId: "1065518583838",
  appId: "1:1065518583838:web:c3e685d2a761b6c4505e0f",
  measurementId: "G-TF6ZMRH4J1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const rtdb = getDatabase(); //realtime db
// export const fsdb = getFirestore(); //firestore db