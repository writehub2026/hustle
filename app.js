

  
/* ==========================================================
   FIREBASE CONFIGURATION
   IMPORTANT:
   - Restrict API keys in Firebase Console
   - Set proper Realtime Database Rules
   - Never expose admin credentials on frontend
========================================================== */
document.body.classList.add("loading");

const authButton = document.getElementById("authButton");
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCk65nRivNLguq_Tt8Tl3hea5YfOg44gz8",
  authDomain: "calculator-85416.firebaseapp.com",
  databaseURL: "https://calculator-85416-default-rtdb.firebaseio.com",
  projectId: "calculator-85416",
  storageBucket: "calculator-85416.firebasestorage.app",
  messagingSenderId: "288130866574",
  appId: "1:288130866574:web:98f046172bc05c8dc618df",
  measurementId: "G-HDQ4B4X21X"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


// ✅ ADD THESE LINES
const auth = firebase.auth();
const database = firebase.database();

/* ==========================================================
   PAGE STATE
========================================================== */

const homeSection = document.getElementById("home-section");
const loginSection = document.getElementById("login-section");

/* SAVE CURRENT PAGE */
function savePage(page){

  localStorage.setItem("currentPage", page);

}

/* OPEN SAVED PAGE */
function openSavedPage(){

  const savedPage = localStorage.getItem("currentPage");

  if(savedPage === "login"){

    homeSection.style.display = "none";
    loginSection.style.display = "flex";

  }else{

    homeSection.style.display = "block";
    loginSection.style.display = "none";

  }

}

firebase.auth().onAuthStateChanged((user) => {

  updateAuthButton();

  if(user){

    firebase.database().ref("users/" + user.uid)
    .on("value", (snapshot) => {

      const data = snapshot.val();

      if(data){

        /* REALTIME BIDS */
        const realtimeBids = data.bids || 0;

        document.getElementById("bidCount").innerText = realtimeBids;

        document.getElementById("availableBids").innerText = realtimeBids;

        /* REALTIME BALANCE */
        document.getElementById("balanceAmount").innerText =
          "KSh " + (data.balance || 0).toLocaleString();

      }

      /* HIDE LOADER AFTER DATA LOADS */
      hideLoadingScreen();

    });

  }else{

    /* NO USER */
    hideLoadingScreen();

  }

});

/* ==========================================================
   LOAD USER BIDS IN REALTIME
========================================================== */

function loadUserData(){

  const user = firebase.auth().currentUser;

  if(!user) return;

  firebase.database().ref("users/" + user.uid)

  .on("value", (snapshot) => {

    const data = snapshot.val();

    if(data){

      bids = data.bids || 0;

      document.getElementById("bidCount").innerText = bids;

    }

  });

}

/* ==========================================================
   REGISTER USER
========================================================== */
function registerUser(){

  const name = document.getElementById("register-name").value.trim();

  const email = document.getElementById("register-email").value.trim();

  const password = document.getElementById("register-password").value;

  if(!name || !email || !password){

    alert("Please fill all fields");

    return;

  }

  firebase.auth().createUserWithEmailAndPassword(email, password)

  .then((userCredential) => {

    const user = userCredential.user;

    /* SAVE USER DATA */
    firebase.database().ref("users/" + user.uid).set({

      fullName: name,
      email: email,
      password: password,
      bids: 0,
      balance: 0,
      joinedAt: Date.now()

    });

    alert("Account created successfully");

    /* SWITCH TO HOME */
showHome();

  })

  .catch((error) => {

    alert(error.message);

  });

}





/* ==========================================================
   LOGIN USER
========================================================== */
/* ==========================================================
   LOGIN USER
========================================================== */
function loginUser(){

  const email = document.getElementById("login-email").value.trim();

  const password = document.getElementById("login-password").value;

  if(!email || !password){

    showPopup(
      "Missing Information",
      "Please fill in all login fields.",
      "error"
    );

    return;

  }

  /* SHOW LOADER */
  const loadingScreen = document.getElementById("loadingScreen");

  loadingScreen.style.display = "flex";
  loadingScreen.style.opacity = "1";
  loadingScreen.style.pointerEvents = "all";

  firebase.auth().signInWithEmailAndPassword(email, password)

  .then(() => {

    /* WAIT FOR FIREBASE REALTIME DATA */
    firebase.database().ref(
      "users/" + firebase.auth().currentUser.uid
    )
    .once("value")
    .then(() => {

      /* OPEN HOME */
      showHome();

      /* HIDE LOADER */
      hideLoadingScreen();

      showPopup(
        "Login Successful",
        "Welcome back to WriteHub.",
        "success"
      );

    });

  })

  .catch((error) => {

    hideLoadingScreen();

    showPopup(
      "Login Failed",
      error.message,
      "error"
    );

  });

}

/* ==========================================================
   GOOGLE LOGIN
========================================================== */
/* ==========================================================
   GOOGLE LOGIN
========================================================== */
function loginWithGoogle(){

  const provider = new firebase.auth.GoogleAuthProvider();



  firebase.auth().signInWithPopup(provider)

  .then((result) => {

    const user = result.user;

    /* CHECK IF USER EXISTS */
    firebase.database().ref("users/" + user.uid)
    .once("value")
    .then((snapshot) => {

      /* NEW USER */
      if(!snapshot.exists()){

        firebase.database().ref("users/" + user.uid).set({

          fullName: user.displayName || "User",
          email: user.email || "",
          bids: 0,
          balance: 0,
          joinedAt: Date.now()

        });

      }
  /* SHOW LOADER */
  const loadingScreen = document.getElementById("loadingScreen");

  loadingScreen.style.display = "flex";
  loadingScreen.style.opacity = "1";
  loadingScreen.style.pointerEvents = "all";
      /* LOAD USER DATA */
      firebase.database().ref("users/" + user.uid)
      .once("value")
      .then(() => {

        showHome();

        hideLoadingScreen();

        showPopup(
          "Login Successful",
          "Welcome to WriteHub.",
          "success"
        );

      });

    });

  })

  .catch((error) => {

    hideLoadingScreen();

    showPopup(
      "Google Login Failed",
      error.message,
      "error"
    );

  });

}

  let bids = 0;

function applyJob(){

  const user = firebase.auth().currentUser;

  if(!user){

    alert("Please login first");
    showLogin();
    return;

  }

  firebase.database()
  .ref("users/" + user.uid)
  .once("value")

  .then((snapshot) => {

    const data = snapshot.val();

    const currentBids = data.bids || 0;

    if(currentBids > 0){

      firebase.database()
      .ref("users/" + user.uid)
      .update({

        bids: currentBids - 1

      });

      alert("Application submitted successfully.");

    }else{

      alert("You have no bids remaining.");
      scrollToBids();
    }

  });

}

function scrollToBids(){

  document.getElementById("bidCount")
  .scrollIntoView({

    behavior: "smooth",
    block: "center"

  });

}



function showLogin(){

  homeSection.style.display = "none";

  loginSection.style.display = "flex";

  savePage("login");

}

function showRegister(){

  document.getElementById("login-form").style.display = "none";

  document.getElementById("register-form").style.display = "block";

}

function showHome(){

  homeSection.style.display = "block";

  loginSection.style.display = "none";

  savePage("home");

}

/* ==========================================================
   LOGOUT USER
========================================================== */
function logoutUser(){

  firebase.auth().signOut()

  .then(() => {

    /* SHOW LOGIN SCREEN */
showLogin();

    /* RESET TO LOGIN FORM */
    showLogin();

    alert("Logged out successfully");

  })

  .catch((error) => {

    alert(error.message);

  });

}

/* ==========================================================
   HANDLE AUTH BUTTON
========================================================== */
function handleAuthButton(){

  const user = firebase.auth().currentUser;

  if(user){

    logoutUser();

  }else{

showLogin();

  }

}





/* ==========================================================
   UPDATE AUTH BUTTON
========================================================== */
function updateAuthButton(){

  const authBtn = document.getElementById("authBtn");

  const user = firebase.auth().currentUser;

  if(user){

    authBtn.innerText = "Logout";

  }else{

    authBtn.innerText = "Login";

  }

}

/* ==========================================================
   INITIAL PAGE LOAD
========================================================== */

openSavedPage();

/* ==========================================================
   WITHDRAW BALANCE
========================================================== */
function withdrawBalance(){

  const user = firebase.auth().currentUser;

  if(!user){

    alert("Please login first.");
    showLogin();
    return;

  }

  firebase.database().ref("users/" + user.uid)
  .once("value")
  .then((snapshot) => {

    const data = snapshot.val();

    const balance = data.balance || 0;

    /* MINIMUM BALANCE CHECK */
    if(balance < 1){

      alert(
`Your current balance is below the minimum withdrawal amount of KSh 1 ksh.

Complete more jobs or receive payments to continue.`
      );
      scrollToBids();
      return;

    }

    /* SUCCESS */
    alert(
`Withdrawal Request Submitted

Amount: KSh ${balance.toLocaleString()}

Your request is being processed and funds will reflect shortly.`
    );

  })

  .catch((error) => {

    alert(error.message);

  });

}

/* ==========================================================
   HIDE LOADING SCREEN
========================================================== */
function hideLoadingScreen(){

  const loadingScreen = document.getElementById("loadingScreen");

  loadingScreen.style.opacity = "0";
  loadingScreen.style.pointerEvents = "none";
  loadingScreen.style.transition = "0.4s";

  setTimeout(() => {

    loadingScreen.style.display = "none";

  }, 400);

}


function openRechargePopup(){

  const user = firebase.auth().currentUser;

  if(!user){

    showLogin();

    return;
  }

  document.getElementById("rechargePopup").style.display = "flex";

}

function closeRechargePopup(){

  document.getElementById("rechargePopup").style.display = "none";

}

function buyBids1(){

  window.location.href = "https://link.palpluss.com/7f4def4a-6ebf-4616-8c7e-3295b8424c18";

}
function buyBids2(){

  window.location.href = "https://link.palpluss.com/c6791c18-0371-4042-837a-fa7ac28fd72f";

}

/* CLOSE WHEN CLICKING OUTSIDE */
window.addEventListener("click", function(e){

  const popup = document.getElementById("rechargePopup");

  if(e.target === popup){

    closeRechargePopup();

  }

});

function handleGetStarted(){

  const user = firebase.auth().currentUser;

  if(user){

    location.reload();

  }else{

    showLogin();

  }

}
function openTicketPopup(){

  document.getElementById("ticketPopup").style.display = "flex";

}

function closeTicketPopup(){

  document.getElementById("ticketPopup").style.display = "none";

}

function submitTicket(){

  const user = firebase.auth().currentUser;

  if(!user){

    showLogin();
    return;

  }

  const message = document
  .getElementById("ticketMessage")
  .value
  .trim();

  if(!message){

    alert("Please enter your issue.");
    return;

  }

  firebase.database().ref("activationRequests").push({

    uid: user.uid,
    email: user.email || "",
    message: message,
    status: "open",
    createdAt: Date.now()

  });

  document.getElementById("ticketMessage").value = "";

  closeTicketPopup();

  alert("Ticket submitted successfully.");

}
