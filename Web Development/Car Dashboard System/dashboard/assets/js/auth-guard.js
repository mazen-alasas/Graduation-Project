
const AuthGuard = {
   
    checkAuthStatus: function() {
        const loggedInUserId = localStorage.getItem('loggedInUserId');

        if (!loggedInUserId) {
            console.warn('⚠️ No authenticated user found');
            this.redirectToLogin();
            return false;
        }

        console.log('✅ User authenticated:', loggedInUserId);
        return true;
    },

   
    // redirectToLogin: function() {
    //     // إظهار رسالة للمستخدم
    //     const message = document.createElement('div');
    //     message.style.cssText = `
    //         position: fixed;
    //         top: 50%;
    //         left: 50%;
    //         transform: translate(-50%, -50%);
    //         background: #f44336;
    //         color: white;
    //         padding: 20px;
    //         border-radius: 8px;
    //         z-index: 10000;
    //         text-align: center;
    //         font-family: Arial, sans-serif;
    //     `;
    //     message.innerHTML = `
    //         <h3>غير مصرح بالوصول</h3>
    //         <p>يجب تسجيل الدخول أولاً للوصول لهذه الصفحة</p>
    //         <p>سيتم إعادة توجيهك خلال 3 ثواني...</p>
    //     `;

    //     document.body.appendChild(message);

    //     setTimeout(() => {
    //         window.location.href = '../login.html';
    //     }, 3000);
    // },

  
    init: function() {
  
        if (!this.checkAuthStatus()) {
            return false;
        }

        window.addEventListener('storage', (e) => {
            if (e.key === 'loggedInUserId' && !e.newValue) {
                this.redirectToLogin();
            }
        });

        return true;
    },

    logout: async function() {
        console.log('🚪 Logging out user...');

        try {
            const loggedInUserId = localStorage.getItem('loggedInUserId');

            if (loggedInUserId && typeof UserProfileManager !== 'undefined') {
                console.log('💾 Ensuring user data is saved to Firebase before logout...');

                const userData = await UserProfileManager.getUserData();
                if (userData) {
                    await UserProfileManager.saveUserData(userData);
                    console.log('✅ User data saved to Firebase before logout');
                }
            }

            const keysToRemove = [
                'loggedInUserId',
                'userData',
                'userProfileImage',
                'userDataJSON',
                'sessionStartTime',
                'lastActivityTime'
            ];

            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log(`🗑️ Removed ${key} from localStorage`);
            });

            sessionStorage.clear();

            console.log('✅ Local user data cleared successfully (Firebase data preserved)');

        } catch (error) {
            console.error('❌ Error during logout process:', error);

            const keysToRemove = [
                'loggedInUserId',
                'userData',
                'userProfileImage',
                'userDataJSON',
                'sessionStartTime',
                'lastActivityTime'
            ];

            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            sessionStorage.clear();
        }

        window.location.href = '../login.html';
    },

    validateSession: function() {
        const loggedInUserId = localStorage.getItem('loggedInUserId');
        const userData = localStorage.getItem('userData');

        if (!loggedInUserId) {
            console.warn('⚠️ No user ID found in session');
            return false;
        }

        if (!userData) {
            console.warn('⚠️ No user data found in session');
            return true; 
        }

        try {
            const parsedData = JSON.parse(userData);
            if (parsedData.userId && parsedData.userId !== loggedInUserId) {
                console.warn('⚠️ User data mismatch, clearing session');
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('❌ Error parsing user data:', error);
            localStorage.removeItem('userData');
        }

        return true;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AuthGuard.init();
});

window.AuthGuard = AuthGuard;
