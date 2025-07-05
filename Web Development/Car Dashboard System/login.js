document.addEventListener('DOMContentLoaded', () => {

    const signUpButton = document.getElementById('signUpButton');
    const signInButton = document.getElementById('signInButton');
    const signUpDiv = document.getElementById('signup');
    const signInDiv = document.getElementById('signIn');

    // Cleanup function for event listeners
    function cleanupEventListeners() {
        if (signUpButton) signUpButton.removeEventListener('click', handleSignUpClick);
        if (signInButton) signInButton.removeEventListener('click', handleSignInClick);

        document.querySelectorAll('.toggle-password').forEach(icon => {
            icon.removeEventListener('click', handlePasswordToggle);
        });

        document.querySelectorAll('.icons i').forEach(icon => {
            icon.removeEventListener('mouseenter', handleIconHover);
            icon.removeEventListener('mouseleave', handleIconLeave);
        });

        document.querySelectorAll('.input-group input').forEach(input => {
            input.removeEventListener('focus', handleInputFocus);
            input.removeEventListener('blur', handleInputBlur);
        });
    }

    // تأثيرات التبديل بين النماذج
    function handleSignUpClick() {
        signInDiv.style.display = 'none';
        signUpDiv.style.display = 'block';
        signUpDiv.style.animation = 'containerFade 0.5s ease-out';
    }

    function handleSignInClick() {
        signUpDiv.style.display = 'none';
        signInDiv.style.display = 'block';
        signInDiv.style.animation = 'containerFade 0.5s ease-out';
    }

    // إظهار/إخفاء كلمة المرور
    function handlePasswordToggle() {
        const input = document.querySelector(this.getAttribute('toggle'));
        if (input.type === 'password') {
            input.type = 'text';
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        } else {
            input.type = 'password';
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        }
    }

    // التحقق من صحة المدخلات
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePassword(password) {
        return password.length >= 6;
    }

    function showMessage(element, message, type) {
        if (element.timeoutId) {
            clearTimeout(element.timeoutId);
        }

        element.textContent = message;
        element.className = `messageDiv ${type}`;
        element.style.display = 'block';

        element.timeoutId = setTimeout(() => {
            element.style.display = 'none';
        }, 3000);
    }

    // تأثيرات حركية للأزرار الاجتماعية
    function handleIconHover() {
        this.style.transform = 'translateY(-3px)';
    }

    function handleIconLeave() {
        this.style.transform = 'translateY(0)';
    }


    function handleInputFocus() {
        this.parentElement.classList.add('focused');
    }

    function handleInputBlur() {
        if (!this.value) {
            this.parentElement.classList.remove('focused');
        }
    }


    if (signUpButton) {
        signUpButton.addEventListener('click', handleSignUpClick);
    }

    if (signInButton) {
        signInButton.addEventListener('click', handleSignInClick);
    }

    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', handlePasswordToggle);
    });

    document.querySelectorAll('.icons i').forEach(icon => {
        icon.addEventListener('mouseenter', handleIconHover);
        icon.addEventListener('mouseleave', handleIconLeave);
    });

    document.querySelectorAll('.input-group input').forEach(input => {
        input.addEventListener('focus', handleInputFocus);
        input.addEventListener('blur', handleInputBlur);
    });


    window.addEventListener('unload', cleanupEventListeners);

});

