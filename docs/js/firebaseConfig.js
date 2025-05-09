// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

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
const provider = new GoogleAuthProvider();
// export default app;


document.getElementById("handleGoogle").addEventListener("click", function() {
  console.log("test")
   signInWithPopup(auth, provider).then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    // IdP data available using getAdditionalUserInfo(result)
    console.log(user)
    window.location.href="/dashboard.html"
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    const email = error.customData.email;
    const credential = GoogleAuthProvider.credentialFromError(error);
  });
});

//  function update()