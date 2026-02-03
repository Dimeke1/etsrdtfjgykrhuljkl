// js/auth.js
import { auth } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const isLoginPage = document.body.classList.contains('login-page');
    const errorMsg = document.getElementById('auth-error');

    // 1. Session Management
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User logged in:", user.uid);
            if (isLoginPage) {
                window.location.href = 'index.html';
            }
        } else {
            console.log("No user logged in");
            if (!isLoginPage) {
                window.location.href = 'login.html';
            }
        }
    });

    // 2. Login Page Logic
    if (isLoginPage) {
        const tabs = document.querySelectorAll('.auth-tab');
        const loginForm = document.getElementById('login-form');
        const regForm = document.getElementById('register-form');

        // Tab Switching
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const target = tab.dataset.target;
                if (target === 'login') {
                    loginForm.classList.add('active');
                    regForm.classList.remove('active');
                } else {
                    regForm.classList.add('active');
                    loginForm.classList.remove('active');
                }
                if (errorMsg) errorMsg.classList.add('hidden');
            });
        });

        // Login
        loginForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                await signInWithEmailAndPassword(auth, email, password);
                // Redirect handled by onAuthStateChanged
            } catch (error) {
                showError(translateError(error.code));
            }
        });

        // Register
        regForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;

            try {
                await createUserWithEmailAndPassword(auth, email, password);
            } catch (error) {
                showError(translateError(error.code));
            }
        });

        function showError(msg) {
            if (errorMsg) {
                errorMsg.innerText = msg;
                errorMsg.classList.remove('hidden');
            }
        }
    }

    // 3. Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            signOut(auth).catch(console.error);
        });
    }

    function translateError(code) {
        switch (code) {
            case 'auth/invalid-email': return 'Некорректный Email';
            case 'auth/user-disabled': return 'Пользователь заблокирован';
            case 'auth/user-not-found': return 'Пользователь не найден';
            case 'auth/wrong-password': return 'Неверный пароль';
            case 'auth/email-already-in-use': return 'Email уже используется';
            case 'auth/weak-password': return 'Пароль слишком простой';
            default: return 'Ошибка авторизации';
        }
    }
});