import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";  
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  getDocs, 
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCDMuiwxLNqH2sbDKIwQnjMc_E27rDPnEI",
  authDomain: "anchan4746.firebaseapp.com",
  projectId: "anchan4746",
  storageBucket: "anchan4746.firebasestorage.app",
  messagingSenderId: "358621818152",
  appId: "1:358621818152:web:2e759be0619d1dd7acb41d",
  measurementId: "G-DKYFD9ZNCL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// UI Elements
// (Note: The login container is now inside .login-wrapper in the redesigned login page.)
const loginContainer = document.querySelector(".login-wrapper");
const chatContainer = document.getElementById("chat-container");
const messagesDiv = document.getElementById("messages");

// Check Authentication State
onAuthStateChanged(auth, user => {
    if (user) {
      loginContainer.classList.add("hidden");
      chatContainer.classList.remove("hidden");
      loadMessages(user.email);
    } else {
      loginContainer.classList.remove("hidden");
      chatContainer.classList.add("hidden");
    }
  });
  

// Login
window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => alert("Logged in successfully!"))
    .catch(error => alert("Login Failed: " + error.message));
};

// Signup
window.signup = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("Account Created! Now Login."))
    .catch(error => alert("Signup Failed: " + error.message));
};

// Sign in with Google
window.loginWithGoogle = async function () {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    alert("Logged in with Google successfully!");
  } catch (error) {
    alert("Google sign in failed: " + error.message);
  }
};

// Forgot Password: Send a password reset email
window.forgotPassword = async function () {
  const email = document.getElementById("email").value;
  if (!email) {
    alert("Please enter your email address first.");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent! Please check your inbox.");
  } catch (error) {
    alert("Error: " + error.message);
  }
};

// Logout
window.logout = function () { 
  signOut(auth).then(() => alert("Logged Out!")); 
};

// Send Message
window.sendMessage = async function () {
  const messageInput = document.getElementById("messageInput");
  const messageText = messageInput.value;
  if (messageText.trim()) {
    const user = auth.currentUser;
    await addDoc(collection(db, "messages"), {
      text: messageText,
      sender: user.email,
      timestamp: serverTimestamp(),
      profilePic: `https://i.pravatar.cc/50?u=${user.email}`
    });
    messageInput.value = "";
  }
};

// Listen for the Enter key on the message input to send the message
const messageInput = document.getElementById("messageInput");
messageInput.addEventListener("keyup", function(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});

// Load Messages with grouping and auto-scroll
function loadMessages(userEmail) {
  const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
  onSnapshot(q, snapshot => {
    messagesDiv.innerHTML = "";

    if (snapshot.empty) {
      const placeholder = document.createElement("div");
      placeholder.classList.add("empty-message");
      placeholder.textContent = "No chats available.";
      messagesDiv.appendChild(placeholder);
    } else {
      let lastGroup = null;
      snapshot.forEach(doc => {
        const data = doc.data();
        const isMyMessage = data.sender === userEmail;
        if (lastGroup && lastGroup.sender === data.sender) {
          const bubble = document.createElement("div");
          bubble.classList.add("bubble");
          bubble.textContent = data.text;
          lastGroup.bubbleContainer.appendChild(bubble);
        } else {
          const groupDiv = document.createElement("div");
          groupDiv.classList.add("message-group", isMyMessage ? "my-group" : "other-group");
          groupDiv.dataset.sender = data.sender;
          const bubbleContainer = document.createElement("div");
          bubbleContainer.classList.add("bubble-container");
          const bubble = document.createElement("div");
          bubble.classList.add("bubble");
          bubble.textContent = data.text;
          bubbleContainer.appendChild(bubble);
          const profileImg = document.createElement("img");
          profileImg.src = data.profilePic;
          profileImg.classList.add("profile-img");
          if (isMyMessage) {
            groupDiv.appendChild(bubbleContainer);
            groupDiv.appendChild(profileImg);
          } else {
            groupDiv.appendChild(profileImg);
            groupDiv.appendChild(bubbleContainer);
          }
          messagesDiv.appendChild(groupDiv);
          lastGroup = { sender: data.sender, bubbleContainer: bubbleContainer };
        }
      });
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// Toggle Dark Mode
window.toggleDarkMode = function () { 
  document.body.classList.toggle("dark-mode"); 
};
