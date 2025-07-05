import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, set, onValue, onChildAdded, off } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyA3mbNPnuteeqH-eqbFQe3bjtDpxIUgo9c",
    authDomain: "adas-v2v-project.firebaseapp.com",
    databaseURL: "https://adas-v2v-project-default-rtdb.firebaseio.com",
    projectId: "adas-v2v-project",
    storageBucket: "adas-v2v-project.firebasestorage.app",
    messagingSenderId: "473978505621",
    appId: "1:473978505621:web:25a6a8040dae75ce168e9c",
    measurementId: "G-FTQGG4G443"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let featuresListener = null;
let driverEventsListener = null;
let faceRecognitionListener = null;
let featuresAlertsListener = null;

// --- Alert Functions ---
function showAlert(title, message) {
    const alertBox = document.getElementById("alertBox");
    const alertMessage = document.getElementById("alertMessage");
    const alertSound = document.getElementById("alertSound");

    if (!alertBox || !alertMessage || !alertSound) {
        console.error("Alert elements not found!");
        return;
    }

    // Handle cases where only one argument (message) is passed
    if (message === undefined) {
        message = title;
        title = "System Alert";
    }

    alertMessage.innerText = message;
    // You can set a title if you add an element for it in the HTML
    // For example: alertBox.querySelector('.alert-title').innerText = title;

    const soundMessages = [
        "Warning: Driver is sleeping!",
        "Warning: No face detected!",
        "Unauthorized driver detected"
    ];

    alertBox.style.display = "block";

    if (soundMessages.includes(message.trim())) {
        alertSound.play().catch(e => console.warn("Alert sound could not be played:", e));
    }

    setTimeout(hideAlert, 10000);
}

function hideAlert() {
    const alertBox = document.getElementById("alertBox");
    const alertSound = document.getElementById("alertSound");
    if (alertBox) {
        alertBox.style.display = "none";
    }
    if (alertSound) {
        alertSound.pause();
        alertSound.currentTime = 0;
    }
}
// Make hideAlert globally accessible for the onclick attribute in the HTML
window.hideAlert = hideAlert;


// --- Feature Toggle Functions ---
function updateButtonState(buttonId, state) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    button.innerHTML = state;
    button.style.backgroundColor = state === "ON" ? "green" : "gray";
    
    if (state === "ON") {
        button.classList.remove('off');
        button.classList.add('on');
    } else {
        button.classList.remove('on');
        button.classList.add('off');
    }
    
    updateStatusIndicator(button, state);
}

function loadButtonStates() {
    if (featuresListener) {
        off(ref(database, "features"), featuresListener);
    }
    
    const dbRef = ref(database, "features");
    
    featuresListener = onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            Object.keys(data).forEach(featureId => {
                const feature = data[featureId];
                if (feature && typeof feature.state !== 'undefined') {
                    updateButtonState(featureId, feature.state);
                }
            });
        }
    });
}

async function toggleButton(button, event) {
    event.stopPropagation();
    const featureId = button.id;
    const newState = button.innerHTML === "ON" ? "OFF" : "ON";
    const dbRef = ref(database, `features/${featureId}`);
    
    try {
        await set(dbRef, {
            state: newState,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error updating feature:", error);
    }
}

function updateStatusIndicator(button, state) {
    const featureCard = button.closest('.feature');
    const statusIndicator = featureCard.querySelector('.status');

    if (statusIndicator) {
        statusIndicator.classList.remove('green', 'black', 'red', 'orange');
        statusIndicator.classList.add(state === "ON" ? 'green' : 'black');
    }
}

function toggleAllFeatures() {
    const allButtons = document.querySelectorAll('.toggle-btn');
    const toggleAllBtn = document.getElementById('toggle-all-btn');
    const newState = toggleAllBtn.innerHTML === "ON" ? "OFF" : "ON";
    toggleAllBtn.innerHTML = newState;

    allButtons.forEach(async (button) => {
        const featureId = button.id;
        const dbRef = ref(database, `features/${featureId}`);
        try {
            // Note: This will not update the message, only the state.
            await set(ref(database, `features/${featureId}/state`), newState);
            await set(ref(database, `features/${featureId}/timestamp`), new Date().toISOString());
        } catch (error) {
            console.error("Error updating feature:", error);
        }
    });
}

// --- Info Box Functions ---
function showInfo(featureId, description) {
    const featureInfo = document.getElementById('feature-info');
    const featureTitle = document.getElementById('feature-title');
    const featureDescription = document.getElementById('feature-description');

    featureTitle.textContent = featureId;
    featureDescription.innerHTML = description;

    document.body.style.overflow = 'hidden';
    featureInfo.classList.remove('hidden');
    featureInfo.classList.add('show');
}

function hideInfo() {
    const featureInfo = document.getElementById('feature-info');
    document.body.style.overflow = 'auto';
    featureInfo.classList.remove('show');
    featureInfo.classList.add('hidden');
}

// --- Global Function Assignments ---
window.toggleButton = toggleButton;
window.toggleAllFeatures = toggleAllFeatures;
window.showInfo = showInfo;
window.hideInfo = hideInfo;

// --- Event Listeners ---
function setupFirebaseListeners() {
    // Listener for button states
    loadButtonStates();

    // Listener for alerts from features (e.g., DMS message)
    const featuresRef = ref(database, "features");
    let lastMessages = {};
    featuresAlertsListener = onValue(featuresRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            Object.keys(data).forEach(featureId => {
                const feature = data[featureId];
                if (feature && feature.state === "ON" && feature.message && feature.message !== lastMessages[featureId]) {
                    showAlert(featureId, feature.message);
                    lastMessages[featureId] = feature.message;
                }
            });
        }
    });

    // Listener for driver events
    const driverEventsRef = ref(database, "driverEvents");
    driverEventsListener = onChildAdded(driverEventsRef, (snapshot) => {
        const eventData = snapshot.val();
        if (eventData) {
            showAlert(eventData.status, eventData.message);
            console.log("🔥 New Driver Event Received: ", eventData);
        }
    });
    
    // Listener for face recognition events
    const faceRecognitionRef = ref(database, "faceRecognition");
    faceRecognitionListener = onChildAdded(faceRecognitionRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
            const message = `${userData.name} has been recognized!`;
            showAlert("Face Recognition", message);
            console.log("🔥 Face Recognized: ", userData);
        }
    });
}

function cleanupListeners() {
    if (featuresListener) off(ref(database, "features"), 'value', featuresListener);
    if (featuresAlertsListener) off(ref(database, "features"), 'value', featuresAlertsListener);
    if (driverEventsListener) off(ref(database, "driverEvents"), 'child_added', driverEventsListener);
    if (faceRecognitionListener) off(ref(database, "faceRecognition"), 'child_added', faceRecognitionListener);
}

document.addEventListener('DOMContentLoaded', setupFirebaseListeners);
window.addEventListener('beforeunload', cleanupListeners);