import { auth } from "./firebaseConfig.js"

auth.onAuthStateChanged(function(user) {
  if (user) {
    updateUserProfile(user)
  } else {
    window.location.href="./index.html"
  }
});

function updateUserProfile(user){
    const userName = user.displayName;
    const userEmail = user.email;
    const userProfilePicture = user.photoURL;
  
    document.getElementById("userName").textContent = userName
    document.getElementById("userEmail").textContent = userEmail
    document.getElementById("userProfilePicture").src = userProfilePicture
}