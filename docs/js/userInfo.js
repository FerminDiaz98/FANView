import { auth } from "./firebaseConfig.js"

auth.onAuthStateChanged(function(user) {
  if (user) {
    updateUserProfile(user)
    checkUserRole(user)
  } else {
    window.location.href="./index.html"
  }
});

function updateUserProfile(user){
    const userName = user.displayName;
    const userEmail = user.email;
    const userProfilePicture = user.photoURL;

    if(document.getElementById("userName") != undefined){
      document.getElementById("userName").textContent = userName}
    if(document.getElementById("userEmail") != undefined){
      document.getElementById("userEmail").textContent = userEmail}
    if(document.getElementById("userProfilePicture") != undefined){
      document.getElementById("userProfilePicture").src = userProfilePicture} 
}

function checkUserRole(user){
  user.getIdTokenResult()
  .then((idTokenResult) => {
     if (!!idTokenResult.claims.admin) {
        // console.log("admin");
        // Revisa si existe un elemento con id admin o supervisor, y si existe, lo habilita
        if(document.getElementById("admin")!=undefined){
          document.getElementById("admin").disabled = false}
        if(document.getElementById("supervisor")!=undefined){
          document.getElementById("supervisor").disabled = false}
     }
     else if (!!idTokenResult.claims.supervisor){
        // console.log("supervisor")
        // Revisa si existe un elemento con id admin o supervisor, y si existe, lo habilita
        if(document.getElementById("supervisor")!=undefined){
          document.getElementById("supervisor").disabled = false}
        
        //Si esta dentro de un html con tag 'adminonly', te manda al login
        if(document.querySelector('meta[name="keywords"]').content == 'adminonly'){
          window.location.href="./index.html"}
     }
     else {
        //Si esta dentro de un html con tag 'adminonly' o 'supervisoronly', te manda al login
        if(document.querySelector('meta[name="keywords"]').content == 'adminonly'){
          window.location.href="./index.html"}
        if(document.querySelector('meta[name="keywords"]').content == 'supervisoronly'){
          window.location.href="./index.html"}
     }
  })
  .catch((error) => {
    console.log(error);
  });
}