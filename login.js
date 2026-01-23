// UI Utility functions
const UI = {
    toast(m, type = 'info') {
        const c = document.getElementById('toastContainer');
        const e = document.createElement('div');
        e.className = `px-6 py-3 rounded-xl text-xs font-bold text-white shadow-2xl transition-all duration-300 transform translate-y-0 ${type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`;
        e.textContent = m;
        c.appendChild(e);
        setTimeout(() => {
            e.style.opacity = '0';
            e.style.transform = 'translateY(-10px)';
            setTimeout(() => e.remove(), 300);
        }, 3000);
    }
};

// Authentication service
const AuthService = {
    login(e, p) {
        const users = JSON.parse(localStorage.getItem('lula_users') || '{}');
        if (users[e] && users[e].pass === p) {
            localStorage.setItem('lula_session', e);
            return users[e];
        }
        throw new Error("Invalid credentials");
    }
};

function handleLogin(e) {
    e.preventDefault();
    try {
        AuthService.login(document.getElementById('loginEmail').value, document.getElementById('loginPass').value);
        window.location.href = 'dashboard.html';
    } catch (err) { UI.toast(err.message, "error"); }
}