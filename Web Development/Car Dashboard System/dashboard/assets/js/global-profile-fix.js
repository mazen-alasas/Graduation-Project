function ensureProfileFixLoaded() {
    if (typeof window.ProfileFix !== 'undefined') {
        console.log('✅ ProfileFix already loaded');
        return;
    }

    console.log('📦 Loading ProfileFix dynamically...');

    const script = document.createElement('script');
    script.src = 'assets/js/profile-fix.js';
    script.onload = function() {
        console.log('✅ ProfileFix loaded dynamically');
        initializeGlobalProfileFix();
    };
    script.onerror = function() {
        console.error('❌ Failed to load ProfileFix');
    };
    document.head.appendChild(script);
}

function initializeGlobalProfileFix() {
    console.log('🚀 Initializing Global Profile Fix...');

    setTimeout(() => {
        setupGlobalEventListeners();
    }, 1000);
}

function setupGlobalEventListeners() {
    console.log('🔧 Setting up global event listeners...');

    const editButtons = document.querySelectorAll('.edit-profile-btn, [data-action="edit-profile"]');

    editButtons.forEach((btn, index) => {
        console.log(`🔍 Found edit button ${index + 1}:`, btn);

        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('📝 Global edit profile button clicked');

            if (typeof window.ProfileFix !== 'undefined' && window.ProfileFix.createEditProfileForm) {
                console.log('✅ Using ProfileFix.createEditProfileForm');
                window.ProfileFix.createEditProfileForm();
            } else if (typeof window.createEditProfileForm !== 'undefined') {
                console.log('✅ Using global createEditProfileForm');
                window.createEditProfileForm();
            } else {
                console.log('❌ No edit form function available');
                alert('Edit Profile functionality is not available on this page.');
            }
        });
    });

    const logoutButtons = document.querySelectorAll('.logout-btn, [data-action="logout"]');

    logoutButtons.forEach((btn, index) => {
        console.log(`🔍 Found logout button ${index + 1}:`, btn);

        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚪 Global logout button clicked');

            if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                if (typeof window.ProfileFix !== 'undefined' && window.ProfileFix.performLogout) {
                    console.log('✅ Using ProfileFix.performLogout');
                    window.ProfileFix.performLogout();
                } else {
                    console.log('⚠️ ProfileFix not available, using fallback logout');
                    performFallbackLogout();
                }
            }
        });
    });

    console.log(`✅ Global event listeners set up for ${editButtons.length} edit buttons and ${logoutButtons.length} logout buttons`);
}


function performFallbackLogout() {
    console.log('🚪 Performing fallback logout...');

    try {

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
        console.log('✅ User data cleared successfully');


        setTimeout(() => {
            window.location.href = '../login.html';
        }, 1000);

    } catch (error) {
        console.error('❌ Error during fallback logout:', error);
        alert('حدث خطأ أثناء تسجيل الخروج');
    }
}

function updateGlobalUserInterface() {
    console.log('🔄 Updating global user interface...');

    try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');

        if (!userData.firstName) {
            console.log('⚠️ No user data found for global update');
            return;
        }

        const userNameElements = document.querySelectorAll('.user-name, .profile-name, .user-display-name');
        userNameElements.forEach(element => {
            element.textContent = `${userData.firstName} ${userData.lastName}`;
        });

        const userRoleElements = document.querySelectorAll('.user-role');
        userRoleElements.forEach(element => {
            element.textContent = userData.role || 'User';
        });

        const userImageElements = document.querySelectorAll('.profile-image img, #userProfileBtn');
        userImageElements.forEach(element => {
            if (userData.profileImage) {
                element.src = userData.profileImage;
            }
        });

        console.log('✅ Global user interface updated successfully');

    } catch (error) {
        console.error('❌ Error updating global user interface:', error);
    }
}

function setupStorageListener() {
    window.addEventListener('storage', (e) => {
        if (e.key === 'userData') {
            console.log('🔄 User data changed, updating global interface...');
            setTimeout(() => {
                updateGlobalUserInterface();
            }, 100);
        }
    });

    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments);
        if (key === 'userData') {
            console.log('🔄 User data updated locally, updating global interface...');
            setTimeout(() => {
                updateGlobalUserInterface();
            }, 100);
        }
    };
}

function initializeGlobalSystem() {
    console.log('🌐 Initializing Global Profile System...');

    ensureProfileFixLoaded();

    setupStorageListener();

    updateGlobalUserInterface();

    setTimeout(() => {
        setupGlobalEventListeners();
    }, 1500);

    console.log('✅ Global Profile System initialized');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGlobalSystem);
} else {
    initializeGlobalSystem();
}

window.GlobalProfileFix = {
    updateGlobalUserInterface,
    setupGlobalEventListeners,
    performFallbackLogout
};

console.log('✅ Global Profile Fix Script Ready');
