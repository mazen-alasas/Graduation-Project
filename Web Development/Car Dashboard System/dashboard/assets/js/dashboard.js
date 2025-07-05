
function updateDateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const formattedDate = `${days[now.getDay()]} | ${now.getDate()} ${months[now.getMonth()]}, ${now.getFullYear()}`;

    document.getElementById('time').textContent = formattedTime;
    document.getElementById('date').textContent = formattedDate;
}

setInterval(updateDateTime, 1000);
updateDateTime();

function initDriveModes() {
    const modes = document.querySelectorAll('.mode');

    modes.forEach(mode => {
        mode.addEventListener('click', () => {
            modes.forEach(m => m.classList.remove('active'));
            mode.classList.add('active');
        });
    });
}

const SecuritySystem = {
    encryptData: function(data) {
        try {
            return btoa(JSON.stringify(data));
        } catch (error) {
            console.error('Encryption error:', error);
            return null;
        }
    },

    decryptData: function(encryptedData) {
        try {
            return JSON.parse(atob(encryptedData));
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    },

    validateSession: function() {
        const sessionToken = localStorage.getItem('sessionToken');
        if (!sessionToken) {
            return false;
        }
        const session = this.decryptData(sessionToken);
        return session && session.expiry > Date.now();
    },

    secureStorage: {
        set: function(key, value) {
            const encryptedValue = SecuritySystem.encryptData(value);
            if (encryptedValue) {
                localStorage.setItem(key, encryptedValue);
                return true;
            }
            return false;
        },
        get: function(key) {
            const encryptedValue = localStorage.getItem(key);
            if (encryptedValue) {
                return SecuritySystem.decryptData(encryptedValue);
            }
            return null;
        }
    },

    activityMonitor: {
        suspicious: 0,
        maxAttempts: 3,

        logActivity: function(activity) {
            console.log(`Activity logged: ${activity} at ${new Date().toISOString()}`);
        },

        checkSuspiciousActivity: function() {
            if (this.suspicious >= this.maxAttempts) {
                this.lockSystem();
                return true;
            }
            return false;
        },

        lockSystem: function() {
            console.warn('System locked due to suspicious activity');
            setTimeout(() => {
                this.suspicious = 0;
                console.log('System unlocked');
            }, 30000); 
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (!SecuritySystem.validateSession()) {

    }

    const protectModel = () => {
        renderer.domElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        document.querySelectorAll('img').forEach(img => {
            img.draggable = false;
        });
    };

    const monitorManipulation = () => {
        let lastTime = Date.now();

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey && e.key === 'u') || 
                (e.ctrlKey && e.key === 's')) { 
                e.preventDefault();
                SecuritySystem.activityMonitor.suspicious++;
                SecuritySystem.activityMonitor.checkSuspiciousActivity();
            }
        });

        setInterval(() => {
            const diff = Date.now() - lastTime;
            if (diff > 200) { 
                SecuritySystem.activityMonitor.suspicious++;
                SecuritySystem.activityMonitor.checkSuspiciousActivity();
            }
            lastTime = Date.now();
        }, 100);
    };

    protectModel();
    monitorManipulation();
});

function saveUserPreferences(preferences) {
    return SecuritySystem.secureStorage.set('userPreferences', preferences);
}

function getUserPreferences() {
    return SecuritySystem.secureStorage.get('userPreferences');
}

const DataIntegrityCheck = {
    validateData: function(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }
        return true;
    },

    sanitizeInput: function(input) {
        if (typeof input === 'string') {
            return input.replace(/<[^>]*>/g, '');
        }
        return input;
    }
};


document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
        const formData = new FormData(form);
        for (let [key, value] of formData.entries()) {

            const sanitizedValue = DataIntegrityCheck.sanitizeInput(value);
            if (!DataIntegrityCheck.validateData({ [key]: sanitizedValue })) {
                e.preventDefault();
                showErrorNotification('Invalid data. Please try again.');
                return;
            }
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);


    initDriveModes();
});


