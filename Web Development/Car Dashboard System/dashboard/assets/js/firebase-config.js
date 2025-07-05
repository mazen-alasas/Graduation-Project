const firebaseConfig = {
    apiKey: "AIzaSyAx8R0_1mKoVnGakiu2Nu4NYcePkyu-V4E",
    authDomain: "test-88bf7.firebaseapp.com",
    databaseURL: "https://test-88bf7-default-rtdb.firebaseio.com",
    projectId: "test-88bf7",
    storageBucket: "test-88bf7.firebasestorage.app",
    messagingSenderId: "466608079906",
    appId: "1:466608079906:web:c92a991b1d56bf2e8ab67b",
    measurementId: "G-9BNYW52NHL"
  };


let app, database, firestore;
let isFirebaseConnected = false;

try {
    if (typeof firebase !== 'undefined') {
        app = firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        firestore = firebase.firestore();

        database.ref('.info/connected').on('value', (snapshot) => {
            if (snapshot.val() === true) {
                isFirebaseConnected = true;
                console.log('✅ Firebase connected successfully');

                startFirebaseSpeedReading();
            } else {
                console.warn('⚠️ Firebase disconnected');
                isFirebaseConnected = false;
            }
        });
    } else {
        console.warn('⚠️ Firebase SDK not loaded');
        isFirebaseConnected = false;
    }
} catch (error) {
    console.warn('⚠️ Firebase connection failed:', error);
    isFirebaseConnected = false;
}



let speedListeners = [];

function addSpeedListener(callback) {
    speedListeners.push(callback);
}

function removeSpeedListener(callback) {
    const index = speedListeners.indexOf(callback);
    if (index > -1) {
        speedListeners.splice(index, 1);
    }
}

function notifySpeedListeners(speed) {
    speedListeners.forEach(callback => {
        try {
            callback(speed);
        } catch (error) {
            console.error('Error in speed listener:', error);
        }
    });

    if (typeof window.DistanceTimeTracker !== 'undefined') {
        window.DistanceTimeTracker.onSpeedChange(speed);
    }
}

function startFirebaseSpeedReading() {
    console.log('📚 بدء قراءة السرعة من Firebase - عرض فقط');
    console.log('🎯 المسار المستخدم: BSMdata/Current/speed');
    console.log('🔧 مشروع Firebase: test-88bf7');

    if (!isFirebaseConnected) {
        console.warn('⚠️ Firebase غير متصل - عرض 0');
        if (typeof window.speedometer !== 'undefined') {
            window.speedometer.setSpeed(0);
        }
        return;
    }

    database.ref('BSMdata/Current/speed').off();

    database.ref('BSMdata/Current/speed').once('value')
        .then(snapshot => {
            const speed = snapshot.val();
            console.log(`🔍 قراءة أولية من BSMdata/Current/speed:`, speed);
            if (speed !== null && typeof speed === 'number') {
                console.log(`📊 ✅ قراءة السرعة من Firebase: ${speed} km/h`);
                if (typeof window.speedometer !== 'undefined') {
                    window.speedometer.setSpeed(speed);
                }
            } else {
                console.log('📊 ⚠️ لا توجد قيمة سرعة في BSMdata/Current/speed - عرض 0');
                if (typeof window.speedometer !== 'undefined') {
                    window.speedometer.setSpeed(0);
                }
            }
        })
        .catch(error => {
            console.error('❌ خطأ في قراءة السرعة من BSMdata/Current/speed:', error);
            if (typeof window.speedometer !== 'undefined') {
                window.speedometer.setSpeed(0);
            }
        });

    database.ref('BSMdata/Current/speed').on('value', (snapshot) => {
        const speed = snapshot.val();
        console.log(`🔄 تحديث مباشر من BSMdata/Current/speed:`, speed);
        if (speed !== null && typeof speed === 'number') {
            console.log(`🔄 ✅ تغيير السرعة في Firebase: ${speed} km/h`);
            if (typeof window.speedometer !== 'undefined') {
                window.speedometer.setSpeed(speed);
            }
        } else {
            console.log('🔄 ⚠️ قيمة غير صحيحة في BSMdata/Current/speed:', speed);
        }
    });

    console.log('✅ تم تفعيل مراقبة BSMdata/Current/speed');
}



const FirebaseSpeedManager = {
    getCurrentSpeed: function() {
        return new Promise((resolve, reject) => {
            if (!isFirebaseConnected) {
                console.warn('⚠️ Firebase غير متصل، عرض 0');
                resolve(0);
                return;
            }

            console.log('🔍 FirebaseSpeedManager: قراءة السرعة من BSMdata/Current/speed');
            database.ref('BSMdata/Current/speed').once('value')
                .then(snapshot => {
                    const speed = snapshot.val();
                    console.log('🔍 FirebaseSpeedManager: قيمة السرعة المقروءة:', speed);
                    if (speed !== null && typeof speed === 'number') {
                        resolve(speed);
                    } else {
                        resolve(0);
                    }
                })
                .catch(error => {
                    console.error('❌ FirebaseSpeedManager: خطأ في قراءة السرعة من BSMdata/Current/speed:', error);
                    reject(error);
                });
        });
    },



    listenToSpeedChanges: function(callback) {
        if (!isFirebaseConnected) {
            addSpeedListener(callback);
            return;
        }

        console.log('👂 FirebaseSpeedManager: بدء الاستماع لـ BSMdata/Current/speed');
        database.ref('BSMdata/Current/speed').on('value', (snapshot) => {
            const speed = snapshot.val();
            console.log('👂 FirebaseSpeedManager: تحديث من BSMdata/Current/speed:', speed);
            if (speed !== null && typeof speed === 'number') {
                callback(speed);
            }
        });
    },

    stopListeningToSpeed: function() {
        if (isFirebaseConnected) {
            console.log('🛑 FirebaseSpeedManager: إيقاف الاستماع لـ BSMdata/Current/speed');
            database.ref('BSMdata/Current/speed').off();
        }
    },



    isConnected: function() {
        return isFirebaseConnected;
    },

    start: function() {
        if (!isFirebaseConnected) {
            console.warn('⚠️ Firebase غير متصل، عداد السرعة سيعرض 0');
            return;
        }

        startFirebaseSpeedReading();

        console.log('🚗 Firebase Speed Manager بدأ - قراءة فقط');
    },

    stop: function() {
        this.stopListeningToSpeed();
        console.log('🛑 Firebase Speed Manager توقف');
    }


};

const FirebaseUserManager = {
    getUserData: async function(userId) {
        try {
            if (!isFirebaseConnected || !firestore) {
                return null;
            }

            const userDoc = await firestore.collection('users').doc(userId).get();
            if (userDoc.exists) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            console.error('Error getting user data from Firebase:', error);
            return null;
        }
    },

    saveUserData: async function(userId, userData) {
        try {
            if (!isFirebaseConnected || !firestore) {
                return false;
            }

            await firestore.collection('users').doc(userId).update({
                ...userData,
                lastUpdated: new Date().toISOString()
            });

            console.log('✅ User data saved to Firebase');
            return true;
        } catch (error) {
            console.error('❌ Error saving user data to Firebase:', error);
            return false;
        }
    },

    isConnected: function() {
        return isFirebaseConnected && firestore;
    }
};

window.FirebaseSpeedManager = FirebaseSpeedManager;
window.FirebaseUserManager = FirebaseUserManager;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 بدء تهيئة Firebase Speed Manager...');
    setTimeout(() => {
        console.log('📊 بدء Firebase Speed Manager - قراءة من BSMdata/Current/speed');
        FirebaseSpeedManager.start();
    }, 1000);
});

window.addEventListener('beforeunload', () => {
    FirebaseSpeedManager.stop();
});


