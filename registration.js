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
    register(u) {
        const users = JSON.parse(localStorage.getItem('lula_users') || '{}');
        if (users[u.email]) throw new Error("Email already registered");
        users[u.email] = { ...u, saved: [] };
        localStorage.setItem('lula_users', JSON.stringify(users));
    }
};

function handleRegister(e) {
    e.preventDefault();
    if (document.getElementById('regPass').value !== document.getElementById('regConfirm').value) return UI.toast("Passwords mismatch", "error");
    try {
        AuthService.register({
            name: document.getElementById('regName').value,
            surname: document.getElementById('regSurname').value,
            email: document.getElementById('regEmail').value,
            phone: document.getElementById('regPhone').value,
            location: document.getElementById('regLocation').value,
            qualification: document.getElementById('regQualification').value,
            pass: document.getElementById('regPass').value,
            saved: []
        });
        UI.toast("Welcome!");
        window.location.href = 'login.html';
    } catch (err) { UI.toast(err.message, "error"); }
}