let db;
let currentUser = null;
let isListenerActive = false;

const firebaseConfig = {
    apiKey: "AIzaSyBqfb4wHtzSLnN01LSvoOsjzbD9ebfV3f0",
    authDomain: "chat-d3938.firebaseapp.com",
    projectId: "chat-d3938",
    storageBucket: "chat-d3938.firebasestorage.app",
    messagingSenderId: "72969194",
    appId: "1:72969194:web:f7484566d85055ff8f6093",
    measurementId: "G-477JVS7S9K"
};

function login() {
    const username = document.getElementById('usernameInput').value.trim();
    if (username) {
        currentUser = username;
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('chatContainer').style.display = 'block';
        document.getElementById('welcomeMessage').textContent = `مرحباً ${username}`;

        if (db && !isListenerActive) {
            setupMessageListener();
        } else if (!db) {
            alert("جاري الاتصال بقاعدة البيانات...");
            initializeFirebase();
        }
    } else {
        alert("الرجاء إدخال اسم المستخدم");
    }
}

async function initializeFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        db = firebase.firestore();
        await db.enablePersistence().catch((err) => {
            if (err.code == 'failed-precondition') {
                console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
            } else if (err.code == 'unimplemented') {
                console.warn('The current browser does not support persistence.');
            }
        });

        console.log("تم تهيئة Firebase بنجاح");
        if (currentUser && !isListenerActive) {
            setupMessageListener();
        }
        return true;
    } catch (error) {
        alert("حدث خطأ في الاتصال: " + error.message);
        return false;
    }
}

function setupMessageListener() {
    if (!db || isListenerActive) return;

    isListenerActive = true;

    db.collection('messages')
        .orderBy('timestamp')
        .onSnapshot(
            snapshot => {
                const chatBox = document.getElementById('chatBox');
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const message = change.doc.data();
                        const messageId = change.doc.id;
                        const messageDiv = document.createElement('div');
                        const isCurrentUser = message.user === currentUser;

                        messageDiv.className = `message ${isCurrentUser ? 'sent' : 'received'}`;
                        messageDiv.dataset.id = messageId;

                        let messageContent = `
                            <div class="username">${message.user}</div>
                            <div class="text">${message.text}</div>
                        `;

                        if (isCurrentUser) {
                            messageContent += `<button class="delete-btn" onclick="confirmDelete('${messageId}')" title="حذف الرسالة">×</button>`;
                        }

                        messageDiv.innerHTML = messageContent;
                        chatBox.appendChild(messageDiv);
                        chatBox.scrollTop = chatBox.scrollHeight;
                    } else if (change.type === 'removed') {
                        const messageId = change.doc.id;
                        const messageElement = document.querySelector(`.message[data-id="${messageId}"]`);
                        if (messageElement) {
                            messageElement.remove();
                        }
                    }
                });
            },
            error => {
                console.error("خطأ في الاستماع للرسائل:", error);
                isListenerActive = false;
            }
        );
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();

    if (!db) {
        alert("جاري الاتصال بقاعدة البيانات، حاول مرة أخرى");
        return;
    }

    if (message && currentUser) {
        db.collection('messages').add({
            text: message,
            user: currentUser,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log("تم إرسال الرسالة بنجاح");
            messageInput.value = '';
        })
        .catch(error => {
            console.error("خطأ في إرسال الرسالة:", error);
            alert("حدث خطأ في إرسال الرسالة");
        });
    }
}



function confirmDelete(messageId) {
    const confirmResult = confirm("هل أنت متأكد من حذف هذه الرسالة؟");
    if (confirmResult) {
        deleteMessage(messageId);
    }
}

function deleteMessage(messageId) {
    if (!db) {
        alert("جاري الاتصال بقاعدة البيانات، حاول مرة أخرى");
        return;
    }

    db.collection('messages').doc(messageId).get()
        .then(doc => {
            if (doc.exists && doc.data().user === currentUser) {
                return db.collection('messages').doc(messageId).delete();
            } else if (!doc.exists) {
                alert("الرسالة غير موجودة");
                return Promise.reject("الرسالة غير موجودة");
            } else {
                alert("لا يمكنك حذف رسائل المستخدمين الآخرين");
                return Promise.reject("لا يمكنك حذف رسائل المستخدمين الآخرين");
            }
        })
        .then(() => {
            console.log("تم حذف الرسالة بنجاح");
            alert("تم حذف الرسالة بنجاح");
        })
        .catch(error => {
            console.error("خطأ في حذف الرسالة:", error);
        });
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeFirebase();
    } catch (error) {
        console.error("خطأ في تحميل Firebase:", error);
        alert("يرجى تحديث الصفحة والمحاولة مرة أخرى");
    }
});
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
