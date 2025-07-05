const SessionManager = {
    STORAGE_KEYS: {
        USER_ID: 'loggedInUserId',
        USER_DATA: 'userData',
        PROFILE_IMAGE: 'userProfileImage',
        USER_DATA_JSON: 'userDataJSON',
        SESSION_START: 'sessionStartTime',
        LAST_ACTIVITY: 'lastActivityTime'
    },

    initSession: function(userId) {
        try {
            const now = new Date().toISOString();
            
            localStorage.setItem(this.STORAGE_KEYS.USER_ID, userId);
            
            localStorage.setItem(this.STORAGE_KEYS.SESSION_START, now);
            
            this.updateLastActivity();
            
            return true;
        } catch (error) {
            return false;
        }
    },

    updateLastActivity: function() {
        try {
            const now = new Date().toISOString();
            localStorage.setItem(this.STORAGE_KEYS.LAST_ACTIVITY, now);
            
            const userData = this.getUserData();
            if (userData) {
                userData.lastActive = new Date().toLocaleString('ar-EG');
                this.saveUserData(userData);
            }
        } catch (error) {
            console.error('❌ Error updating last activity:', error);
        }
    },

    validateSession: function() {
        try {
            const userId = localStorage.getItem(this.STORAGE_KEYS.USER_ID);
            const sessionStart = localStorage.getItem(this.STORAGE_KEYS.SESSION_START);
            const lastActivity = localStorage.getItem(this.STORAGE_KEYS.LAST_ACTIVITY);

            if (!userId) {
                console.warn('⚠️ No user ID found in session');
                return false;
            }

            if (!sessionStart) {
                this.initSession(userId);
                return true;
            }

            const sessionAge = Date.now() - new Date(sessionStart).getTime();
            const maxSessionAge = 24 * 60 * 60 * 1000; 

            if (sessionAge > maxSessionAge) {
                this.clearSession();
                return false;
            }

            this.updateLastActivity();
            
            return true;
        } catch (error) {
            return false;
        }
    },

    saveUserData: function(userData) {
        try {
            const userId = localStorage.getItem(this.STORAGE_KEYS.USER_ID);
            
            if (!userId) {
                return false;
            }

            const dataToSave = {
                ...userData,
                userId: userId,
                lastUpdated: new Date().toISOString(),
                lastActive: new Date().toLocaleString('ar-EG'),
                sessionId: this.generateSessionId()
            };

            localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(dataToSave));
            
            return true;
        } catch (error) {
            return false;
        }
    },

    getUserData: function() {
        try {
            const userData = localStorage.getItem(this.STORAGE_KEYS.USER_DATA);
            const userId = localStorage.getItem(this.STORAGE_KEYS.USER_ID);

            if (!userData) {
                return null;
            }

            const parsedData = JSON.parse(userData);

            if (parsedData.userId && parsedData.userId !== userId) {
                localStorage.removeItem(this.STORAGE_KEYS.USER_DATA);
                return null;
            }

            if (!parsedData.userId && userId) {
                parsedData.userId = userId;
                this.saveUserData(parsedData);
            }

            return parsedData;
        } catch (error) {
            localStorage.removeItem(this.STORAGE_KEYS.USER_DATA);
            return null;
        }
    },

    saveProfileImage: function(imageUrl) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.PROFILE_IMAGE, imageUrl);
            
            const userData = this.getUserData();
            if (userData) {
                userData.profileImage = imageUrl;
                this.saveUserData(userData);
            }
            
            return true;
        } catch (error) {
            return false;
        }
    },

    getProfileImage: function() {
        try {
            const userData = this.getUserData();
            if (userData && userData.profileImage) {
                return userData.profileImage;
            }

            return localStorage.getItem(this.STORAGE_KEYS.PROFILE_IMAGE);
        } catch (error) {
            return null;
        }
    },

    clearSession: function() {
        try {
                        Object.values(this.STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });

            sessionStorage.clear();
            
            return true;
        } catch (error) {
            return false;
        }
    },

    generateSessionId: function() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    getSessionInfo: function() {
        try {
            return {
                userId: localStorage.getItem(this.STORAGE_KEYS.USER_ID),
                sessionStart: localStorage.getItem(this.STORAGE_KEYS.SESSION_START),
                lastActivity: localStorage.getItem(this.STORAGE_KEYS.LAST_ACTIVITY),
                isValid: this.validateSession()
            };
        } catch (error) {
            return null;
        }
    },

    startActivityMonitoring: function() {
        const events = ['click', 'keypress', 'scroll', 'mousemove'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.updateLastActivity();
            }, { passive: true });
        });

        setInterval(() => {
            if (!this.validateSession()) {
                window.location.href = '../login.html';
            }
        }, 5 * 60 * 1000); 
    },

    init: function() {        
        if (this.validateSession()) {
            this.startActivityMonitoring();
            return true;
        } else {
            return false;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        SessionManager.init();
    }, 100);
});
window.SessionManager = SessionManager;
