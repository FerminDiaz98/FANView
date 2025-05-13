import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";
import { auth } from "./firebaseConfig.js"
const provider = new GoogleAuthProvider();
// const user = auth.currentUser;

const googleLogin = document.getElementById("handleGoogle");
googleLogin.addEventListener("click", function() {
  signInWithPopup(auth, provider).then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    const user = result.user;
    // IdP data available using getAdditionalUserInfo(result)
    window.location.href="./dashboard.html"
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    const credential = GoogleAuthProvider.credentialFromError(error);
  });
});