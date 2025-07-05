const ProfileLoader = {
    updateUserInterface: async function() {
        try {

            const loggedInUserId = localStorage.getItem('loggedInUserId');
            if (!loggedInUserId) {
                return;
            }

            const userData = await UserProfileManager.getUserData();

            if (!userData) {
                return;
            }



            this.updateUserName(userData);

            this.updateProfileDetails(userData);

            this.updateProfileImage(userData);

            this.updateStats(userData);

            await this.updateProfileCompletion();

            await UserProfileManager.saveUserData(userData);


        } catch (error) {
            console.error('❌ Error updating user interface:', error);
        }
    },

    updateUserName: function(userData) {
        const fullName = `${userData.firstName} ${userData.lastName}`;

        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(element => {
            element.textContent = fullName;
        });

        const profileNameElements = document.querySelectorAll('.profile-name, .user-display-name');
        profileNameElements.forEach(element => {
            element.textContent = fullName;
        });
    },

    updateProfileDetails: function(userData) {
        const profileDetails = document.querySelectorAll('.profile-details .info-group');

        profileDetails.forEach(group => {
            const label = group.querySelector('label');
            const value = group.querySelector('p');

            if (label && value) {
                const fieldName = label.textContent.toLowerCase().trim();

                switch(fieldName) {
                    case 'firstname':
                        value.textContent = userData.firstName || 'Not set';
                        break;
                    case 'lastname':
                        value.textContent = userData.lastName || 'Not set';
                        break;
                    case 'email':
                        value.textContent = userData.email || 'Not set';
                        break;
                    case 'phone':
                        value.textContent = userData.phone || 'Not set';
                        break;
                    case 'location':
                        value.textContent = userData.location || 'Not set';
                        break;
                    case 'last active':
                        value.textContent = userData.lastActive || 'Unknown';
                        break;
                }
            }
        });

        const roleElements = document.querySelectorAll('.user-role');
        roleElements.forEach(element => {
            element.textContent = userData.role || 'User';
        });
    },

    updateProfileImage: function(userData) {
        if (userData.profileImage) {
            const profileImages = document.querySelectorAll('.profile-image img, #userProfileBtn');
            profileImages.forEach(img => {
                img.src = userData.profileImage;
            });
        }
    },

    updateProfileCompletion: async function() {
        try {
            const completionPercentage = await UserProfileManager.calculateProfileCompletion();

            const completionElements = document.querySelectorAll('.progress-header span:last-child, .completion-percentage');
            completionElements.forEach(element => {
                element.textContent = `${completionPercentage}%`;
            });

            const progressFills = document.querySelectorAll('.progress-fill');
            progressFills.forEach(fill => {
                fill.style.width = `${completionPercentage}%`;
            });

        } catch (error) {
            console.error('Error updating profile completion:', error);
        }
    },

    updateStats: function(userData) {
        if (userData.stats) {
            const totalRidesElements = document.querySelectorAll('.stat-value');
            if (totalRidesElements[0]) {
                totalRidesElements[0].textContent = userData.stats.totalRides || 0;
            }

            if (totalRidesElements[1]) {
                const miles = userData.stats.miles || 0;
                totalRidesElements[1].textContent = miles > 1000 ? `${(miles/1000).toFixed(1)}k` : miles;
            }

            if (totalRidesElements[2]) {
                totalRidesElements[2].textContent = userData.stats.rating || 5.0;
            }
        }
    },

    checkLoginStatus: function() {
        const loggedInUserId = localStorage.getItem('loggedInUserId');

        if (!loggedInUserId) {
            console.warn('⚠️ No logged in user found');
            // window.location.href = '../login.html';
            return false;
        }

        return true;
    },

    init: async function() {
        console.log('🚀 Initializing ProfileLoader...');

        if (!this.checkLoginStatus()) {
            return;
        }

        if (typeof UserProfileManager === 'undefined') {
            setTimeout(() => this.init(), 1000);
            return;
        }

        await this.updateUserInterface();

        this.setupEventListeners();

        this.setupPeriodicCheck();

    },

    setupEventListeners: function() {
        document.addEventListener('userDataUpdated', () => {
            this.updateUserInterface();
        });

        document.addEventListener('profileImageUpdated', () => {
            this.updateUserInterface();
        });

        document.addEventListener('userLoggedIn', () => {
            setTimeout(() => {
                this.updateUserInterface();
            }, 500);
        });

        document.addEventListener('profileUpdated', (e) => {
            console.log('👤 Profile updated event received, refreshing UI...', e.detail);
            setTimeout(() => {
                this.updateUserInterface();
            }, 100);
        });

        window.addEventListener('storage', (e) => {
            if (e.key === 'userData' || e.key === 'loggedInUserId') {
                setTimeout(() => {
                    this.updateUserInterface();
                }, 100);
            }
        });
    },

    triggerDataUpdate: function() {
        const event = new CustomEvent('userDataUpdated');
        document.dispatchEvent(event);
    },

    setupPeriodicCheck: function() {
        setInterval(() => {
            const loggedInUserId = localStorage.getItem('loggedInUserId');
            const userData = localStorage.getItem('userData');

            if (loggedInUserId && userData) {
                try {
                    const parsedData = JSON.parse(userData);
                    if (parsedData.userId === loggedInUserId) {
                        const userNameElement = document.querySelector('.user-name');
                        if (userNameElement && userNameElement.textContent === 'LaneLoons') {
                            this.updateUserInterface();
                        }
                    }
                } catch (error) {
                    console.warn('⚠️ Error parsing user data during periodic check:', error);
                }
            }
        }, 5000);

        setTimeout(() => {
            this.updateUserInterface();
        }, 1000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        ProfileLoader.init();
    }, 500);
});

window.ProfileLoader = ProfileLoader;
