function ensureUserLoggedIn() {
    const userId = localStorage.getItem('loggedInUserId');
    if (!userId) {
        console.log('⚠️ No user logged in');
        return null;
    }

    const userData = localStorage.getItem('userData');
    if (!userData) {
        return null;
    }

    return JSON.parse(userData);
}

function updateUserInterface() {
    try {

        const userData = JSON.parse(localStorage.getItem('userData') || '{}');

        if (!userData.firstName) {
            console.log('⚠️ No user data found');
            return;
        }

        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(element => {
            element.textContent = `${userData.firstName} ${userData.lastName}`;
        });

        const userRoleElements = document.querySelectorAll('.user-role');
        userRoleElements.forEach(element => {
            element.textContent = userData.role || 'User';
        });

        const userImageElements = document.querySelectorAll('.profile-image img');
        userImageElements.forEach(element => {
            if (userData.profileImage) {
                element.src = userData.profileImage;
            }
        });

        const profileDetails = document.querySelectorAll('.profile-details .info-group');
        profileDetails.forEach(group => {
            const label = group.querySelector('label');
            const value = group.querySelector('p');

            if (label && value) {
                const fieldName = label.textContent.toLowerCase().trim();

                switch(fieldName) {
                    case 'firstname':
                    case 'first name':
                        value.textContent = userData.firstName || 'Not set';
                        break;
                    case 'lastname':
                    case 'last name':
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
                        value.textContent = userData.lastActive || new Date().toLocaleString('ar-EG');
                        break;
                }
            }
        });

        if (userData.stats) {
            const statElements = document.querySelectorAll('.stat-value');
            if (statElements.length >= 3) {
                statElements[0].textContent = userData.stats.totalRides || '254';
                statElements[1].textContent = userData.stats.miles ? userData.stats.miles + 'k' : '1.2k';
                statElements[2].textContent = userData.stats.rating || '4.9';
            }
        }
    } catch (error) {
        console.error('❌ Error updating user interface:', error);
    }
}

function createEditProfileForm() {
    const existingForm = document.getElementById('edit-profile-overlay');
    if (existingForm) {
        existingForm.remove();
    }

    const formHTML = `
        <div class="edit-profile-overlay" id="edit-profile-overlay">
            <div class="edit-profile-form">
                <div class="form-header">
                    <h3>
                        <i class="fas fa-user-edit"></i> تحرير الملف الشخصي
                    </h3>
                    <button class="close-form-btn" id="close-form-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="edit-profile-form">
                    <div class="form-group">
                        <label for="firstName">الاسم الأول</label>
                        <input type="text" id="firstName" name="firstName" required>
                    </div>
                    <div class="form-group">
                        <label for="lastName">الاسم الأخير</label>
                        <input type="text" id="lastName" name="lastName" required>
                    </div>
                    <div class="form-group">
                        <label for="email">البريد الإلكتروني</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="phone">رقم الهاتف</label>
                        <input type="tel" id="phone" name="phone" required>
                    </div>
                    <div class="form-group">
                        <label for="location">الموقع</label>
                        <input type="text" id="location" name="location" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="cancel-btn" id="cancel-edit-btn">إلغاء</button>
                        <button type="submit" class="save-btn">حفظ التغييرات</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', formHTML);

    const overlay = document.getElementById('edit-profile-overlay');
    if (overlay) {
        overlay.classList.add('show');
    }

    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.firstName) {
        document.getElementById('firstName').value = userData.firstName || '';
        document.getElementById('lastName').value = userData.lastName || '';
        document.getElementById('email').value = userData.email || '';
        document.getElementById('phone').value = userData.phone || '';
        document.getElementById('location').value = userData.location || '';
    }

    const closeBtn = document.getElementById('close-form-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const form = document.getElementById('edit-profile-form');

    function closeForm() {
        overlay.classList.remove('show');
        setTimeout(() => {
            overlay.remove();
        }, 300); 
    }

    closeBtn.addEventListener('click', closeForm);
    cancelBtn.addEventListener('click', closeForm);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeForm();
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            location: document.getElementById('location').value.trim()
        };

        if (!formData.firstName || !formData.lastName || !formData.email) {
            alert('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('يرجى إدخال بريد إلكتروني صحيح');
            return;
        }

        try {
            const currentData = JSON.parse(localStorage.getItem('userData') || '{}');

            const updatedData = {
                ...currentData,
                ...formData,
                lastUpdated: new Date().toISOString(),
                lastActive: new Date().toLocaleString('ar-EG')
            };

            localStorage.setItem('userData', JSON.stringify(updatedData));


            updateUserInterface();

            closeForm();

            showNotification('تم تحديث الملف الشخصي بنجاح!', 'success');

            setTimeout(() => {
                updateUserInterface();
            }, 500);

        } catch (error) {
            console.error('❌ Error saving profile data:', error);
            alert('حدث خطأ أثناء حفظ البيانات');
        }
    });
}

function performLogout() {

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
        });

        sessionStorage.clear();

        showNotification('تم تسجيل الخروج بنجاح', 'success');

        setTimeout(() => {
            window.location.href = '../login.html';
        }, 1500);

    } catch (error) {
        console.error('❌ Error during logout:', error);
        alert('حدث خطأ أثناء تسجيل الخروج');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(notification);

    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });

    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }
    }, 5000);
}

function initializeProfileFix() {
    const userData = ensureUserLoggedIn();
    if (!userData) {
        console.log('⚠️ No user logged in, skipping initialization');
        return;
    }
    updateUserInterface();
    setTimeout(() => {
        const editBtns = document.querySelectorAll('.edit-profile-btn');
        editBtns.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                createEditProfileForm();
            });
        });

        const logoutBtns = document.querySelectorAll('.logout-btn');
        logoutBtns.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚪 Logout button clicked');

                if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                    performLogout();
                }
            });
        });
    }, 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProfileFix);
} else {
    initializeProfileFix();
}

window.ProfileFix = {
    updateUserInterface,
    createEditProfileForm,
    performLogout,
    showNotification,
    ensureUserLoggedIn
};

window.createEditProfileForm = createEditProfileForm;

