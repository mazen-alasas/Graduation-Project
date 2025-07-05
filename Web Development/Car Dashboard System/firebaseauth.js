// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, setDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBcaN8Z7LsxGgM-PXkvlLvnSYrBLaaNdVw",
  authDomain: "login-b95cf.firebaseapp.com",
  databaseURL: "https://login-b95cf-default-rtdb.firebaseio.com",
  projectId: "login-b95cf",
  storageBucket: "login-b95cf.firebasestorage.app",
  messagingSenderId: "988201091472",
  appId: "1:988201091472:web:a694121dedb5ae0f887315"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// FCW Status Monitoring
let fcwStatus = 'OFF';
let isAutoLoginEnabled = false;

// Function to update system status indicator
function updateSystemStatus(status, message) {
    const statusElement = document.getElementById('systemStatus');
    const statusText = document.getElementById('statusText');
    const refreshBtn = document.getElementById('refreshStatus');
    
    if (statusElement && statusText) {
        statusElement.className = `system-status ${status}`;
        statusText.textContent = message;
        
        // Show refresh button only when there's an error
        if (refreshBtn) {
            if (status === 'offline') {
                refreshBtn.style.display = 'inline-block';
            } else {
                refreshBtn.style.display = 'none';
            }
        }
    }
}

// Function to monitor FCW status from Firebase
async function monitorFCWStatus() {
    try {
        // Import Firebase Realtime Database
        const { getDatabase, ref, onValue } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");
        
        // Use the same Firebase config but with Realtime Database
        const fcwFirebaseConfig = {
            apiKey: "AIzaSyA3mbNPnuteeqH-eqbFQe3bjtDpxIUgo9c",
            authDomain: "adas-v2v-project.firebaseapp.com",
            databaseURL: "https://adas-v2v-project-default-rtdb.firebaseio.com",
            projectId: "adas-v2v-project",
            storageBucket: "adas-v2v-project.firebasestorage.app",
            messagingSenderId: "473978505621",
            appId: "1:473978505621:web:25a6a8040dae75ce168e9c",
            measurementId: "G-FTQGG4G443"
        };
        
        const fcwApp = initializeApp(fcwFirebaseConfig, 'fcw-app');
        const fcwDatabase = getDatabase(fcwApp);
        const fcwRef = ref(fcwDatabase, "features/FCW/state");
        
        updateSystemStatus('checking', 'جاري التحقق من حالة النظام...');
        
        onValue(fcwRef, (snapshot) => {
            const status = snapshot.val();
            fcwStatus = status || 'OFF';
            
            if (fcwStatus === 'ON') {
                updateSystemStatus('online', 'النظام نشط - تسجيل دخول تلقائي متاح');
                isAutoLoginEnabled = true;
                handleAutoLogin();
            } else {
                updateSystemStatus('offline', 'النظام غير نشط - استخدم طرق التسجيل العادية');
                isAutoLoginEnabled = false;
                
                // Hide info messages when system is offline
                const fcwInfo = document.getElementById('fcwInfo');
                const fcwInfoSignIn = document.getElementById('fcwInfoSignIn');
                
                if (fcwInfo) fcwInfo.style.display = 'none';
                if (fcwInfoSignIn) fcwInfoSignIn.style.display = 'none';
            }
        }, (error) => {
            console.error('Error monitoring FCW status:', error);
            updateSystemStatus('offline', 'خطأ في الاتصال - استخدم طرق التسجيل العادية');
            isAutoLoginEnabled = false;
            
            // Hide info messages when there's an error
            const fcwInfo = document.getElementById('fcwInfo');
            const fcwInfoSignIn = document.getElementById('fcwInfoSignIn');
            
            if (fcwInfo) fcwInfo.style.display = 'none';
            if (fcwInfoSignIn) fcwInfoSignIn.style.display = 'none';
        });
        
    } catch (error) {
        console.error('Error setting up FCW monitoring:', error);
        updateSystemStatus('offline', 'خطأ في الاتصال - استخدم طرق التسجيل العادية');
        isAutoLoginEnabled = false;
    }
}

// Function to handle automatic login when FCW is ON
async function handleAutoLogin() {
    try {
        // Show info message
        const fcwInfo = document.getElementById('fcwInfo');
        const fcwInfoSignIn = document.getElementById('fcwInfoSignIn');
        
        if (fcwInfo) fcwInfo.style.display = 'flex';
        if (fcwInfoSignIn) fcwInfoSignIn.style.display = 'flex';
        
        // Check if user is already logged in
        const currentUser = auth.currentUser;
        if (currentUser) {
            // User is already logged in, redirect to dashboard
            window.location.href = 'dashboard/index.html';
            return;
        }
        
        // Create a temporary user for auto login
        const tempUserData = {
            userId: 'fcw-auto-user',
            firstName: 'FCW',
            lastName: 'User',
            email: 'fcw@auto.login',
            phone: '',
            location: '',
            role: 'FCW User',
            profileImage: 'https://i.scdn.co/image/ab67616d0000b273f907de96b9a4fbc04accc0d5',
            lastActive: new Date().toLocaleString(),
            stats: {
                totalRides: 0,
                miles: 0,
                rating: 5.0
            }
        };
        
        // Save user data to localStorage
        localStorage.setItem('userData', JSON.stringify(tempUserData));
        localStorage.setItem('loggedInUserId', tempUserData.userId);
        localStorage.setItem('fcwAutoLogin', 'true');
        
        console.log('✅ FCW Auto login successful');
        
        // Show success message
        updateSystemStatus('online', 'تم تسجيل الدخول تلقائياً - جاري التوجيه...');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
            window.location.href = 'dashboard/index.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error in auto login:', error);
        updateSystemStatus('offline', 'خطأ في التسجيل التلقائي - استخدم طرق التسجيل العادية');
        isAutoLoginEnabled = false;
    }
}

// Start monitoring FCW status when page loads
document.addEventListener('DOMContentLoaded', () => {
    monitorFCWStatus();
});

// Function to refresh FCW status
window.refreshFCWStatus = function() {
    const refreshBtn = document.getElementById('refreshStatus');
    if (refreshBtn) {
        refreshBtn.style.display = 'none';
    }
    monitorFCWStatus();
};

// Function to show messages
function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  if (!messageDiv) return;

  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;

  // Clear any existing timeout
  if (messageDiv.timeoutId) {
    clearTimeout(messageDiv.timeoutId);
  }

  messageDiv.timeoutId = setTimeout(() => {
    messageDiv.style.opacity = 0;
  }, 5000);
}

// Phone Authentication Variables
let recaptchaVerifier;
let confirmationResult;

// Initialize reCAPTCHA
function initializeRecaptcha() {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      }
    });
  }
}

// Validate phone number format
function validatePhoneNumber(phoneNumber) {
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(cleaned);
}

// Phone Authentication Function
async function loginWithPhone() {
  // Check if FCW auto login is enabled
  if (isAutoLoginEnabled) {
    showMessage('النظام نشط - لا حاجة لتسجيل الدخول اليدوي', 'signInMessage');
    return;
  }

  try {
    const modal = document.getElementById('phoneAuthModal');
    if (modal) {
      modal.style.display = 'flex';
    } else {
      createPhoneAuthModal();
    }
  } catch (error) {
    console.error('Error opening phone auth modal:', error);
    showMessage('Error opening phone authentication', 'signInMessage');
  }
}

// Send verification code
async function sendVerificationCode() {
  const phoneInput = document.getElementById('phoneNumber');
  const phoneNumber = phoneInput.value.trim();
  
  if (!validatePhoneNumber(phoneNumber)) {
    showMessage('Please enter a valid phone number with country code (e.g., +201234567890)', 'phoneAuthMessage');
    return;
  }

  try {
    initializeRecaptcha();
    showMessage('Sending verification code...', 'phoneAuthMessage');
    
    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    
    document.getElementById('phoneStep').style.display = 'none';
    document.getElementById('codeStep').style.display = 'block';
    showMessage('Verification code sent successfully!', 'phoneAuthMessage');
    
  } catch (error) {
    console.error('Error sending verification code:', error);
    let errorMessage = 'Error sending verification code';
    
    if (error.code === 'auth/invalid-phone-number') {
      errorMessage = 'Invalid phone number format';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many requests. Please try again later';
    }
    
    showMessage(errorMessage, 'phoneAuthMessage');
  }
}

// Verify code and complete authentication
async function verifyCode() {
  const codeInput = document.getElementById('verificationCode');
  const code = codeInput.value.trim();
  
  if (!code || code.length !== 6) {
    showMessage('Please enter the 6-digit verification code', 'phoneAuthMessage');
    return;
  }

  try {
    showMessage('Verifying code...', 'phoneAuthMessage');
    
    const result = await confirmationResult.confirm(code);
    const user = result.user;
    
    const userData = {
      phone: user.phoneNumber,
      firstName: 'User',
      lastName: '',
      email: '',
      role: 'User'
    };

    await setDoc(doc(db, "users", user.uid), userData, { merge: true });
    localStorage.setItem('loggedInUserId', user.uid);

    const completeUserData = {
      userId: user.uid,
      firstName: 'User',
      lastName: '',
      email: '',
      phone: user.phoneNumber,
      location: '',
      role: 'User',
      profileImage: 'https://i.scdn.co/image/ab67616d0000b273f907de96b9a4fbc04accc0d5',
      lastActive: new Date().toLocaleString(),
      stats: {
        totalRides: 0,
        miles: 0,
        rating: 5.0
      }
    };

    localStorage.setItem('userData', JSON.stringify(completeUserData));
    console.log('✅ Phone user data saved to localStorage');

    if (typeof SessionManager !== 'undefined') {
      SessionManager.initSession(user.uid);
    }

    document.getElementById('phoneAuthModal').style.display = 'none';
    showMessage('Phone authentication successful!', 'signInMessage');
    
    setTimeout(() => {
      window.location.href = 'dashboard/index.html';
    }, 1500);
    
  } catch (error) {
    console.error('Error verifying code:', error);
    let errorMessage = 'Invalid verification code';
    
    if (error.code === 'auth/invalid-verification-code') {
      errorMessage = 'Invalid verification code. Please try again';
    } else if (error.code === 'auth/code-expired') {
      errorMessage = 'Verification code expired. Please request a new one';
    }
    
    showMessage(errorMessage, 'phoneAuthMessage');
  }
}

// Create Phone Auth Modal
function createPhoneAuthModal() {
  const modal = document.createElement('div');
  modal.id = 'phoneAuthModal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Phone Authentication</h2>
        <span class="close" onclick="closePhoneModal()">&times;</span>
      </div>
      <div class="modal-body">
        <div id="phoneAuthMessage" class="messageDiv" style="display:none;"></div>
        
        <div id="phoneStep">
          <div class="input-group">
            <i class="fas fa-phone"></i>
            <input type="tel" id="phoneNumber" placeholder="+201234567890" required>
            <label for="phoneNumber">Phone Number (with country code)</label>
          </div>
          <button class="btn" onclick="sendVerificationCode()">Send Code</button>
        </div>
        
        <div id="codeStep" style="display:none;">
          <div class="input-group">
            <i class="fas fa-key"></i>
            <input type="text" id="verificationCode" placeholder="123456" maxlength="6" required>
            <label for="verificationCode">Verification Code</label>
          </div>
          <button class="btn" onclick="verifyCode()">Verify Code</button>
          <button class="btn-secondary" onclick="resetPhoneAuth()">Back</button>
        </div>
      </div>
    </div>
    <div id="recaptcha-container"></div>
  `;
  
  document.body.appendChild(modal);
  
  const style = document.createElement('style');
  style.textContent = `
    #phoneAuthModal {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
      justify-content: center;
      align-items: center;
    }
    
    .modal-content {
      background-color: #fff;
      padding: 20px;
      border-radius: 10px;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    
    .close {
      font-size: 24px;
      cursor: pointer;
      color: #999;
    }
    
    .close:hover {
      color: #000;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      margin-left: 10px;
    }
    
    .btn-secondary:hover {
      background-color: #5a6268;
    }
  `;
  
  document.head.appendChild(style);
  modal.style.display = 'flex';
}

// Global functions for modal (needed for onclick attributes)
window.closePhoneModal = function() {
  const modal = document.getElementById('phoneAuthModal');
  if (modal) {
    modal.style.display = 'none';
  }
};

window.resetPhoneAuth = function() {
  document.getElementById('phoneStep').style.display = 'block';
  document.getElementById('codeStep').style.display = 'none';
  document.getElementById('phoneNumber').value = '';
  document.getElementById('verificationCode').value = '';
};

window.sendVerificationCode = sendVerificationCode;
window.verifyCode = verifyCode;

// Cleanup function for event listeners
function cleanupEventListeners() {
  const signUp = document.getElementById('submitSignUp');
  const signIn = document.getElementById('submitSignIn');
  
  if (signUp) {
    signUp.removeEventListener('click', signUpHandler);
  }
  if (signIn) {
    signIn.removeEventListener('click', signInHandler);
  }
}

// Sign-Up Handler
async function signUpHandler(event) {
  event.preventDefault();

  // Check if FCW auto login is enabled
  if (isAutoLoginEnabled) {
    showMessage('النظام نشط - لا حاجة للتسجيل اليدوي', 'signUpMessage');
    return;
  }

  const email = document.getElementById('rEmail').value;
  const password = document.getElementById('rPassword').value;
  const firstName = document.getElementById('fName').value;
  const lastName = document.getElementById('lName').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData = {
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: 'User',
      stats: {
        totalRides: 0,
        miles: 0,
        rating: 5.0
      }
    };

    await setDoc(doc(db, "users", user.uid), userData);
    showMessage('Account Created Successfully', 'signUpMessage');

    localStorage.setItem('loggedInUserId', user.uid);

    const completeUserData = {
      userId: user.uid,
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: '',
      location: '',
      role: 'User',
      profileImage: 'https://i.scdn.co/image/ab67616d0000b273f907de96b9a4fbc04accc0d5',
      lastActive: new Date().toLocaleString(),
      stats: {
        totalRides: 0,
        miles: 0,
        rating: 5.0
      }
    };

    localStorage.setItem('userData', JSON.stringify(completeUserData));
    
    // Single redirect with delay
    setTimeout(() => {
      cleanupEventListeners();
      window.location.href = 'dashboard/index.html';
    }, 1500);
  } catch (error) {
    console.error("Error:", error);
    if (error.code === 'auth/email-already-in-use') {
      showMessage('Email Address Already Exists!', 'signUpMessage');
    } else {
      showMessage('Unable to create user.', 'signUpMessage');
    }
  }
}

// Sign-In Handler
async function signInHandler(event) {
  event.preventDefault();

  // Check if FCW auto login is enabled
  if (isAutoLoginEnabled) {
    showMessage('النظام نشط - لا حاجة لتسجيل الدخول اليدوي', 'signInMessage');
    return;
  }

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    showMessage('Login successful!', 'signInMessage');
    localStorage.setItem('loggedInUserId', user.uid);

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const firestoreData = userDoc.data();
        const userData = {
          userId: user.uid,
          firstName: firestoreData.firstName || firestoreData.displayName?.split(' ')[0] || 'User',
          lastName: firestoreData.lastName || firestoreData.displayName?.split(' ')[1] || '',
          email: firestoreData.email || user.email,
          phone: firestoreData.phone || '',
          location: firestoreData.location || '',
          role: firestoreData.role || 'User',
          profileImage: firestoreData.photoURL || firestoreData.profileImage || 'https://i.scdn.co/image/ab67616d0000b273f907de96b9a4fbc04accc0d5',
          lastActive: new Date().toLocaleString(),
          stats: firestoreData.stats || {
            totalRides: 0,
            miles: 0,
            rating: 5.0
          }
        };

        localStorage.setItem('userData', JSON.stringify(userData));
      }
    } catch (firestoreError) {
      console.warn('⚠️ Could not load user data from Firestore:', firestoreError);
      const defaultUserData = {
        userId: user.uid,
        firstName: 'User',
        lastName: '',
        email: user.email,
        phone: '',
        location: '',
        role: 'User',
        profileImage: 'https://i.scdn.co/image/ab67616d0000b273f907de96b9a4fbc04accc0d5',
        lastActive: new Date().toLocaleString(),
        stats: {
          totalRides: 0,
          miles: 0,
          rating: 5.0
        }
      };
      localStorage.setItem('userData', JSON.stringify(defaultUserData));
    }

    // Single redirect
    cleanupEventListeners();
    window.location.href = 'dashboard/index.html';
  } catch (error) {
    console.error("Error:", error);
    if (error.code === 'auth/invalid-credential') {
      showMessage('Incorrect Email or Password', 'signInMessage');
    } else {
      showMessage('Account does not Exist', 'signInMessage');
    }
  }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
  const signUp = document.getElementById('submitSignUp');
  const signIn = document.getElementById('submitSignIn');
  
  if (signUp) {
    signUp.addEventListener('click', signUpHandler);
  }
  if (signIn) {
    signIn.addEventListener('click', signInHandler);
  }
});

// Google Authentication
async function loginWithGoogle() {
  // Check if FCW auto login is enabled
  if (isAutoLoginEnabled) {
    showMessage('النظام نشط - لا حاجة لتسجيل الدخول اليدوي', 'signInMessage');
    return;
  }

  const googleProvider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userData = {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      firstName: user.displayName?.split(' ')[0] || 'User',
      lastName: user.displayName?.split(' ')[1] || ''
    };

    await setDoc(doc(db, "users", user.uid), userData, { merge: true });
    localStorage.setItem('loggedInUserId', user.uid);

    // Create complete user data for localStorage
    const completeUserData = {
      userId: user.uid,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: user.email,
      phone: '',
      location: '',
      role: 'User',
      profileImage: user.photoURL || 'https://i.scdn.co/image/ab67616d0000b273f907de96b9a4fbc04accc0d5',
      lastActive: new Date().toLocaleString(),
      stats: {
        totalRides: 254,
        miles: 1200,
        rating: 4.9
      }
    };

    localStorage.setItem('userData', JSON.stringify(completeUserData));
    console.log('✅ Google user data saved to localStorage');

    // Initialize session if SessionManager is available
    if (typeof SessionManager !== 'undefined') {
      SessionManager.initSession(user.uid);
    }

    window.location.href = 'dashboard/index.html';
  } catch (error) {
    console.error("Google login error:", error.message);
    showMessage('Error logging in with Google', 'signInMessage');
  }
}

// Add event listeners for both sign-in and sign-up pages
document.addEventListener("DOMContentLoaded", function () {
  const googleLogin = document.getElementById("googleLogin");
  const googleLoginSignIn = document.getElementById("googleLoginsignin");
  const phoneLogin = document.getElementById("facebookLogin"); // Using old Facebook ID for phone
  const phoneLoginSignIn = document.getElementById("facebookLoginsignin"); // Using old Facebook ID for phone

  if (googleLogin) googleLogin.addEventListener("click", loginWithGoogle);
  if (googleLoginSignIn) googleLoginSignIn.addEventListener("click", loginWithGoogle);
  if (phoneLogin) phoneLogin.addEventListener("click", loginWithPhone);
  if (phoneLoginSignIn) phoneLoginSignIn.addEventListener("click", loginWithPhone);
});
