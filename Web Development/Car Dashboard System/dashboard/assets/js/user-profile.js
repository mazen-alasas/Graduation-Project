const defaultUserData = {
    firstName: "Lane",
    lastName: "Loons",
    email: "Laneloons@gmail.com",
    phone: "+1 234 567 890",
    location: "Egypt, ElMansoura",
    lastActive: "Today at 12:45 PM",
    role: "System Administrator",
    profileImage: "https://i.scdn.co/image/ab67616d0000b273f907de96b9a4fbc04accc0d5",
    stats: {
        totalRides: 254,
        miles: 1200,
        rating: 4.9
    }
};

const UserProfileManager = {
    getUserData: async function() {
        try {
            const loggedInUserId = localStorage.getItem('loggedInUserId');
            if (loggedInUserId) {
                const localData = localStorage.getItem('userData');
                if (localData) {
                    const parsedData = JSON.parse(localData);
                    if (parsedData.userId === loggedInUserId || !parsedData.userId) {
                        if (!parsedData.userId) {
                            parsedData.userId = loggedInUserId;
                            localStorage.setItem('userData', JSON.stringify(parsedData));
                        }
                        return parsedData;
                    }
                }

                const firebaseData = await this.getFirebaseUserData(loggedInUserId);
                if (firebaseData) {
                    firebaseData.userId = loggedInUserId;
                    localStorage.setItem('userData', JSON.stringify(firebaseData));
                    return firebaseData;
                }
            }

            const defaultData = { ...defaultUserData };
            if (loggedInUserId) {
                defaultData.userId = loggedInUserId;
                localStorage.setItem('userData', JSON.stringify(defaultData));
            }
            return defaultData;
        } catch (error) {
            console.error('Error getting user data:', error);
            return defaultUserData;
        }
    },

    getFirebaseUserData: async function(userId) {
        try {
            if (typeof window.FirebaseUserManager !== 'undefined') {
                const userData = await window.FirebaseUserManager.getUserData(userId);

                if (userData) {
                    return {
                        firstName: userData.firstName || userData.displayName?.split(' ')[0] || 'User',
                        lastName: userData.lastName || userData.displayName?.split(' ')[1] || '',
                        email: userData.email || '',
                        phone: userData.phone || '',
                        location: userData.location || '',
                        role: userData.role || 'User',
                        profileImage: userData.photoURL || userData.profileImage || defaultUserData.profileImage,
                        lastActive: new Date().toLocaleString(),
                        stats: userData.stats || defaultUserData.stats
                    };
                }
            }

            if (typeof firebase !== 'undefined' && firebase.firestore) {
                const db = firebase.firestore();
                const userDoc = await db.collection('users').doc(userId).get();

                if (userDoc.exists) {
                    const userData = userDoc.data();
                    return {
                        firstName: userData.firstName || userData.displayName?.split(' ')[0] || 'User',
                        lastName: userData.lastName || userData.displayName?.split(' ')[1] || '',
                        email: userData.email || '',
                        phone: userData.phone || '',
                        location: userData.location || '',
                        role: userData.role || 'User',
                        profileImage: userData.photoURL || userData.profileImage || defaultUserData.profileImage,
                        lastActive: new Date().toLocaleString(),
                        stats: userData.stats || defaultUserData.stats
                    };
                }
            }
            return null;
        } catch (error) {
            console.error('Error fetching user data from Firebase:', error);
            return null;
        }
    },

    // Save user data to Firebase and localStorage
    saveUserData: async function(userData) {
        try {
            const loggedInUserId = localStorage.getItem('loggedInUserId');

            // إضافة معرف المستخدم ووقت التحديث
            const dataToSave = {
                ...userData,
                userId: loggedInUserId,
                lastUpdated: new Date().toISOString(),
                lastActive: new Date().toLocaleString('ar-EG')
            };

            // حفظ في localStorage كنسخة احتياطية
            localStorage.setItem('userData', JSON.stringify(dataToSave));
            console.log('✅ User data saved to localStorage');

            // حفظ في Firebase إذا كان المستخدم مسجل دخول
            if (loggedInUserId) {
                const firebaseSaved = await this.saveFirebaseUserData(loggedInUserId, dataToSave);
                if (firebaseSaved) {
                    console.log('✅ User data saved to Firebase');
                } else {
                    console.warn('⚠️ Failed to save to Firebase, but localStorage backup is available');
                }
            }

            // إطلاق حدث تحديث البيانات
            const event = new CustomEvent('userDataUpdated', { detail: dataToSave });
            document.dispatchEvent(event);

            return true;
        } catch (error) {
            console.error('Error saving user data:', error);
            return false;
        }
    },

    // Save user data to Firebase
    saveFirebaseUserData: async function(userId, userData) {
        try {
            // استخدام FirebaseUserManager إذا كان متاحاً
            if (typeof window.FirebaseUserManager !== 'undefined') {
                return await window.FirebaseUserManager.saveUserData(userId, userData);
            }

            // Fallback: استخدام Firebase SDK مباشرة
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                const db = firebase.firestore();

                // إضافة معلومات إضافية للحفظ في Firebase
                const firebaseData = {
                    ...userData,
                    lastSyncedAt: new Date().toISOString(),
                    syncSource: 'dashboard'
                };

                // استخدام set مع merge بدلاً من update لتجنب أخطاء عدم وجود المستند
                await db.collection('users').doc(userId).set(firebaseData, { merge: true });
                console.log('✅ User data saved to Firebase successfully for user:', userId);
                return true;
            } else {
                console.warn('⚠️ Firebase not available, using localStorage only');
                return false;
            }
        } catch (error) {
            console.error('❌ Error saving user data to Firebase:', error);
            return false;
        }
    },

    // Save user data to JSON file
    saveUserDataToJSON: async function(userData) {
        try {
            // Get current JSON data
            const jsonData = await this.loadJSONData();

            // Find current user or create new one
            const currentUserId = jsonData.currentUser || 'user_001';
            const userIndex = jsonData.users.findIndex(user => user.id === currentUserId);

            if (userIndex !== -1) {
                // Update existing user
                jsonData.users[userIndex] = {
                    ...jsonData.users[userIndex],
                    ...userData,
                    lastActive: new Date().toISOString()
                };
            } else {
                // Create new user
                const newUser = {
                    id: currentUserId,
                    ...userData,
                    createdAt: new Date().toISOString(),
                    lastActive: new Date().toISOString(),
                    isActive: true,
                    stats: userData.stats || {
                        totalRides: 0,
                        miles: 0,
                        rating: 5.0
                    }
                };
                jsonData.users.push(newUser);
            }

            jsonData.lastUpdated = new Date().toISOString();

            // Save to localStorage as backup (since we can't write files directly from browser)
            localStorage.setItem('userDataJSON', JSON.stringify(jsonData));

            // Also save to secure storage
            this.saveUserData(userData);

            console.log('✅ User data saved to JSON successfully');
            return true;
        } catch (error) {
            console.error('❌ Error saving user data to JSON:', error);
            return false;
        }
    },

    // Load JSON data
    loadJSONData: async function() {
        try {
            // Try to load from localStorage first (as backup)
            const localData = localStorage.getItem('userDataJSON');
            if (localData) {
                return JSON.parse(localData);
            }

            // Try to fetch from JSON file
            const response = await fetch('./user-data.json');
            if (response.ok) {
                return await response.json();
            }

            // Return default structure if file doesn't exist
            return {
                users: [],
                currentUser: 'user_001',
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error loading JSON data:', error);
            return {
                users: [],
                currentUser: 'user_001',
                lastUpdated: new Date().toISOString()
            };
        }
    },

    // Update specific user data fields
    updateUserData: async function(updatedFields) {
        try {
            console.log('🔄 Updating user data with:', updatedFields);

            const currentData = await this.getUserData();
            const newData = {
                ...currentData,
                ...updatedFields,
                lastUpdated: new Date().toISOString(),
                lastActive: new Date().toLocaleString('ar-EG')
            };

            console.log('📝 New data to save:', newData);

            // Save to localStorage first (immediate)
            localStorage.setItem('userData', JSON.stringify(newData));
            console.log('✅ Data saved to localStorage');

            // Save to Firebase
            const firebaseSuccess = await this.saveUserData(newData);
            console.log('🔥 Firebase save result:', firebaseSuccess);

            // Also save to JSON as backup
            try {
                await this.saveUserDataToJSON(newData);
                console.log('📄 Data saved to JSON backup');
            } catch (jsonError) {
                console.warn('⚠️ JSON backup save failed:', jsonError);
            }

            // Verify data was saved correctly
            const verifyData = await this.getUserData();
            console.log('🔍 Verification - saved data:', verifyData);

            return firebaseSuccess;
        } catch (error) {
            console.error('❌ Error updating user data:', error);
            return false;
        }
    },

    // Update user profile image
    updateProfileImage: function(imageUrl) {
        return this.updateUserData({ profileImage: imageUrl });
    },

    // Format user display name
    getDisplayName: async function() {
        const userData = await this.getUserData();
        return `${userData.firstName} ${userData.lastName}`;
    },

    // Calculate profile completion percentage
    calculateProfileCompletion: async function() {
        const userData = await this.getUserData();
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'location'];
        const filledFields = requiredFields.filter(field => userData[field] && userData[field].trim() !== '');
        return Math.round((filledFields.length / requiredFields.length) * 100);
    },

    // Export user data as JSON file for download
    exportUserData: async function() {
        const userData = await this.getUserData();
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `user-profile-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    },

    // Load user data from uploaded JSON file
    importUserData: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);

                    // Validate imported data
                    if (this.validateUserData(importedData)) {
                        this.updateUserData(importedData);
                        resolve(true);
                    } else {
                        reject(new Error('Invalid user data format'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    },

    // Validate user data structure
    validateUserData: function(data) {
        const requiredFields = ['firstName', 'lastName', 'email'];
        return requiredFields.every(field => data.hasOwnProperty(field) && data[field]);
    },

    // Get all users from JSON
    getAllUsers: async function() {
        try {
            const jsonData = await this.loadJSONData();
            return jsonData.users || [];
        } catch (error) {
            console.error('Error getting all users:', error);
            return [];
        }
    },

    // Switch to different user
    switchUser: async function(userId) {
        try {
            const jsonData = await this.loadJSONData();
            const user = jsonData.users.find(u => u.id === userId);

            if (user) {
                jsonData.currentUser = userId;
                localStorage.setItem('userDataJSON', JSON.stringify(jsonData));

                // Update current user data in secure storage
                this.saveUserData(user);

                // Refresh UI
                window.location.reload();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error switching user:', error);
            return false;
        }
    },

    // Delete user
    deleteUser: async function(userId) {
        try {
            const jsonData = await this.loadJSONData();
            const userIndex = jsonData.users.findIndex(u => u.id === userId);

            if (userIndex !== -1) {
                jsonData.users.splice(userIndex, 1);

                // If deleting current user, switch to first available user
                if (jsonData.currentUser === userId && jsonData.users.length > 0) {
                    jsonData.currentUser = jsonData.users[0].id;
                    this.saveUserData(jsonData.users[0]);
                }

                jsonData.lastUpdated = new Date().toISOString();
                localStorage.setItem('userDataJSON', JSON.stringify(jsonData));

                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting user:', error);
            return false;
        }
    },

    // Search users
    searchUsers: async function(query) {
        try {
            const users = await this.getAllUsers();
            const searchTerm = query.toLowerCase();

            return users.filter(user =>
                user.firstName.toLowerCase().includes(searchTerm) ||
                user.lastName.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.role.toLowerCase().includes(searchTerm)
            );
        } catch (error) {
            console.error('Error searching users:', error);
            return [];
        }
    },

    // Get user statistics
    getUserStats: async function() {
        try {
            const users = await this.getAllUsers();
            const stats = {
                totalUsers: users.length,
                activeUsers: users.filter(u => u.isActive).length,
                roles: {},
                recentUsers: users
                    .sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive))
                    .slice(0, 5)
            };

            // Count users by role
            users.forEach(user => {
                stats.roles[user.role] = (stats.roles[user.role] || 0) + 1;
            });

            return stats;
        } catch (error) {
            console.error('Error getting user stats:', error);
            return null;
        }
    }
};

// Edit Profile Form Manager
const EditProfileForm = {
    formElement: null,
    isVisible: false,

    // Initialize the edit profile form
    init: function() {
        this.createForm();
        this.setupEventListeners();
    },

    // Create the edit profile form
    createForm: function() {
        // Check if form already exists
        if (document.getElementById('edit-profile-form')) {
            return;
        }

        const formHTML = `
            <div class="edit-profile-overlay" id="edit-profile-overlay">
                <div class="edit-profile-form">
                    <div class="form-header">
                        <h3>Edit Profile</h3>
                        <button class="close-form-btn" id="close-form-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="edit-profile-form">
                        <div class="form-group">
                            <label for="firstName">First Name</label>
                            <input type="text" id="firstName" name="firstName" required>
                        </div>
                        <div class="form-group">
                            <label for="lastName">Last Name</label>
                            <input type="text" id="lastName" name="lastName" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="phone">Phone</label>
                            <input type="tel" id="phone" name="phone" required>
                        </div>
                        <div class="form-group">
                            <label for="location">Location</label>
                            <input type="text" id="location" name="location" required>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="cancel-btn" id="cancel-edit-btn">Cancel</button>
                            <button type="submit" class="save-btn">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Append form to body
        const formContainer = document.createElement('div');
        formContainer.innerHTML = formHTML;
        document.body.appendChild(formContainer.firstElementChild);

        // Store reference to form
        this.formElement = document.getElementById('edit-profile-form');
    },

    // Set up event listeners for the form
    setupEventListeners: function() {
        const overlay = document.getElementById('edit-profile-overlay');
        const closeBtn = document.getElementById('close-form-btn');
        const cancelBtn = document.getElementById('cancel-edit-btn');
        const form = document.getElementById('edit-profile-form');

        // Close form when clicking close button
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideForm());
        }

        // Close form when clicking cancel button
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideForm());
        }

        // Close form when clicking outside the form
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideForm();
                }
            });
        }

        // Handle form submission
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveFormData();
            });
        }
    },

    // Show the edit profile form
    showForm: function() {
        const overlay = document.getElementById('edit-profile-overlay');
        if (overlay) {
            // Populate form with current user data
            this.populateForm();
            overlay.style.display = 'flex';
            this.isVisible = true;
        }
    },

    // Hide the edit profile form
    hideForm: function() {
        const overlay = document.getElementById('edit-profile-overlay');
        if (overlay) {
            overlay.style.display = 'none';
            this.isVisible = false;
        }
    },

    // Populate form with current user data
    populateForm: async function() {
        const userData = await UserProfileManager.getUserData();

        document.getElementById('firstName').value = userData.firstName || '';
        document.getElementById('lastName').value = userData.lastName || '';
        document.getElementById('email').value = userData.email || '';
        document.getElementById('phone').value = userData.phone || '';
        document.getElementById('location').value = userData.location || '';
    },

    // Save form data
    saveFormData: async function() {
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value
        };

        // Validate form data
        if (!this.validateFormData(formData)) {
            return;
        }

        try {
            console.log('💾 Saving profile data:', formData);

            // Update user data with enhanced saving
            const success = await UserProfileManager.updateUserData(formData);

            if (success) {
                console.log('✅ Profile data saved successfully');

                // Force immediate UI update
                await this.updateProfileUI();

                // Update ProfileLoader if available
                if (typeof ProfileLoader !== 'undefined' && ProfileLoader.updateUserInterface) {
                    await ProfileLoader.updateUserInterface();
                }

                // Trigger custom event for other components
                const event = new CustomEvent('profileUpdated', {
                    detail: formData
                });
                document.dispatchEvent(event);

                // Hide form
                this.hideForm();

                // Show success message
                this.showNotification('تم تحديث الملف الشخصي بنجاح', 'success');

                // Force page refresh of profile data after a short delay
                setTimeout(async () => {
                    if (typeof ProfileLoader !== 'undefined') {
                        await ProfileLoader.updateUserInterface();
                    }
                }, 500);

            } else {
                this.showNotification('Failed to update profile', 'error');
            }
        } catch (error) {
            console.error('❌ Error saving form data:', error);
            this.showNotification('An error occurred while saving data', 'error');
        }
    },

    // Validate form data
    validateFormData: function(formData) {
        // Simple validation
        for (const key in formData) {
            if (!formData[key] || formData[key].trim() === '') {
                this.showNotification(`${key} cannot be empty`, 'error');
                return false;
            }
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return false;
        }

        return true;
    },

    // Update profile UI after saving
    updateProfileUI: async function() {
        try {
            console.log('🔄 Updating profile UI...');

            const userData = await UserProfileManager.getUserData();

            if (!userData) {
                console.warn('⚠️ No user data available for UI update');
                return;
            }

            console.log('📊 Updating UI with data:', userData);

            // Update user name in header and all locations
            const userNameElements = document.querySelectorAll('.user-name');
            userNameElements.forEach(element => {
                element.textContent = `${userData.firstName} ${userData.lastName}`;
                console.log('✅ Updated user name element');
            });

            // Update user role
            const userRoleElements = document.querySelectorAll('.user-role');
            userRoleElements.forEach(element => {
                element.textContent = userData.role || 'User';
            });

            // Update profile info in all user windows
            document.querySelectorAll('.user-window').forEach(window => {
                // Update name
                const nameElement = window.querySelector('.user-name');
                if (nameElement) {
                    nameElement.textContent = `${userData.firstName} ${userData.lastName}`;
                }

                // Update profile details
                const profileDetails = window.querySelectorAll('.profile-details .info-group');
                profileDetails.forEach(group => {
                    const label = group.querySelector('label');
                    if (label) {
                        const field = label.textContent.toLowerCase().trim();
                        const value = group.querySelector('p');

                        if (value) {
                            switch(field) {
                                case 'firstname':
                                case 'first name':
                                    value.textContent = userData.firstName;
                                    break;
                                case 'lastname':
                                case 'last name':
                                    value.textContent = userData.lastName;
                                    break;
                                case 'email':
                                    value.textContent = userData.email;
                                    break;
                                case 'phone':
                                    value.textContent = userData.phone;
                                    break;
                                case 'location':
                                    value.textContent = userData.location;
                                    break;
                            }
                            console.log(`✅ Updated ${field}: ${value.textContent}`);
                        }
                    }
                });

                // Update profile completion
                UserProfileManager.calculateProfileCompletion().then(completionPercentage => {
                    const completionElement = window.querySelector('.progress-header span:last-child');
                    const progressFill = window.querySelector('.progress-fill');

                    if (completionElement) {
                        completionElement.textContent = `${completionPercentage}%`;
                    }

                    if (progressFill) {
                        progressFill.style.width = `${completionPercentage}%`;
                    }
                });
            });

            // Update profile image if available
            if (userData.profileImage) {
                const profileImages = document.querySelectorAll('.profile-image img, #userProfileBtn');
                profileImages.forEach(img => {
                    img.src = userData.profileImage;
                });
            }

            // Update stats if available
            if (userData.stats) {
                const statElements = document.querySelectorAll('.stat-value');
                if (statElements.length >= 3) {
                    statElements[0].textContent = userData.stats.totalRides || '0';
                    statElements[1].textContent = userData.stats.miles || '0';
                    statElements[2].textContent = userData.stats.rating || '5.0';
                }
            }

            console.log('✅ Profile UI updated successfully');
        } catch (error) {
            console.error('❌ Error updating profile UI:', error);
        }
    },

    // Show notification
    showNotification: function(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;

        // Add to document
        document.body.appendChild(notification);

        // Add close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize edit profile form
    EditProfileForm.init();

    // Add event listener to edit profile button
    const editProfileBtns = document.querySelectorAll('.edit-profile-btn');
    editProfileBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            EditProfileForm.showForm();
        });
    });

    // Add event listener to change photo button
    const changePhotoBtns = document.querySelectorAll('.change-photo-btn');
    changePhotoBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // Create a file input element
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';

            // Add to document and trigger click
            document.body.appendChild(fileInput);
            fileInput.click();

            // Handle file selection
            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const reader = new FileReader();

                    reader.onload = function(e) {
                        // Update profile image in UI
                        document.querySelectorAll('.profile-image img').forEach(img => {
                            img.src = e.target.result;
                        });
                        document.querySelectorAll('.user img').forEach(img => {
                            img.src = e.target.result;
                        });

                        // Update user data
                        UserProfileManager.updateProfileImage(e.target.result);
                        EditProfileForm.showNotification('Profile image updated', 'success');
                    };
                    reader.readAsDataURL(file);
                }
                document.body.removeChild(fileInput);
            });
        });
    });
});
