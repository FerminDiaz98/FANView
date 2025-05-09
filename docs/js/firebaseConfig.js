// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
export default app;


document.getElementById("handleGoogle").addEventListener("click", function() {
    console.log("test")
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider)
  });
