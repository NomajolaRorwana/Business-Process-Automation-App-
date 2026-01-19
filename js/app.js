// Configuration for Adzuna and Logo.dev APIs
const CONFIG = { 
    ID: "c6689383", 
    KEY: "772276e6d1dc6be3f77e63991993057f", 
    LOGO_KEY: "pk_JZPNjUdtQ7ujKNFGAPsYZQ",
    URL: "https://api.adzuna.com/v1/api/jobs/za/search/1" 
};

const ZA_CURRENCY = new Intl.NumberFormat('en-ZA', { 
    style: 'currency', 
    currency: 'ZAR', 
    maximumFractionDigits: 0 
});

// Helpers for Dates
function formatDate(isoString) {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getClosingDate(postedDateStr) {
    const date = new Date(postedDateStr);
    date.setDate(date.getDate() + 30);
    return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

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
    },
    showSkeletons() {
        const area = document.getElementById('resultsArea');
        area.innerHTML = Array(3).fill(0).map(() => `
            <div class="glass p-6 rounded-3xl border border-white/5 space-y-4">
                <div class="h-6 w-2/3 skeleton rounded-lg"></div>
                <div class="h-12 w-full skeleton rounded-lg"></div>
            </div>
        `).join('');
    }
};

// Authentication service
const AuthService = {
    register(u) {
        const users = JSON.parse(localStorage.getItem('lula_users') || '{}');
        if (users[u.email]) throw new Error("Email already registered");
        users[u.email] = { ...u, saved: [] };
        localStorage.setItem('lula_users', JSON.stringify(users));
    },
    login(e, p) {
        const users = JSON.parse(localStorage.getItem('lula_users') || '{}');
        if (users[e] && users[e].pass === p) {
            localStorage.setItem('lula_session', e);
            return users[e];
        }
        throw new Error("Invalid credentials");
    },
    logout() {
        localStorage.removeItem('lula_session');
        location.reload();
    },
    getCurrentUser() {
        const email = localStorage.getItem('lula_session');
        if (!email) return null;
        const users = JSON.parse(localStorage.getItem('lula_users') || '{}');
        return users[email] || null;
    },
    updateUser(newData) {
        const email = localStorage.getItem('lula_session');
        const users = JSON.parse(localStorage.getItem('lula_users') || '{}');
        if (users[email]) {
            users[email] = { ...users[email], ...newData };
            localStorage.setItem('lula_users', JSON.stringify(users));
            return users[email];
        }
        return null;
    }
};

function calculateMatch(jobTitle, searchKey) {
    if (!searchKey) return 70;
    const title = jobTitle.toLowerCase();
    const key = searchKey.toLowerCase();
    if (title.includes(key)) return Math.floor(Math.random() * (100 - 85) + 85);
    return Math.floor(Math.random() * (84 - 60) + 60);
}

function getLogo(companyName) {
    return `https://img.logo.dev/name/${encodeURIComponent(companyName)}?token=${CONFIG.LOGO_KEY}`;
}

// Market Insights with Demand Density
async function fetchMarketInsights(category) {
    const insightDiv = document.getElementById('marketInsights');
    const content = document.getElementById('insightContent');
    insightDiv.classList.remove('hidden');
    
    const jobs = window.lastResults || [];
    if (jobs.length === 0) return;

    // Calculate Average Salary
    const salaried = jobs.filter(j => j.salary_min);
    const avg = salaried.length ? salaried.reduce((acc, j) => acc + j.salary_min, 0) / salaried.length : 0;

    // Calculate Demand Density (Province check)
    const provinces = { 'Gauteng': 0, 'Western Cape': 0, 'KwaZulu-Natal': 0 };
    jobs.forEach(j => {
        const loc = j.location.display_name.toLowerCase();
        if (loc.includes('gauteng')) provinces['Gauteng']++;
        if (loc.includes('western cape') || loc.includes('cape town')) provinces['Western Cape']++;
        if (loc.includes('kwazulu') || loc.includes('durban')) provinces['KwaZulu-Natal']++;
    });

    const getDensityLabel = (count) => {
        if (count > 5) return { text: 'High', color: 'text-emerald-400' };
        if (count > 2) return { text: 'Medium', color: 'text-blue-400' };
        return { text: 'Low', color: 'text-slate-500' };
    };

    content.innerHTML = `
        <div class="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 mb-4">
            <p class="text-[9px] text-blue-400 font-bold uppercase mb-1">Avg Annual Salary</p>
            <p class="text-lg font-bold">${avg ? ZA_CURRENCY.format(avg) : 'Market Related'}</p>
        </div>
        <div class="space-y-2">
            <p class="text-[9px] text-slate-500 font-bold uppercase ml-1">Demand Density</p>
            ${Object.keys(provinces).map(p => {
                const density = getDensityLabel(provinces[p]);
                return `
                <div class="flex items-center justify-between text-[11px] p-2 bg-white/5 rounded-lg">
                    <span>${p}</span>
                    <span class="${density.color} font-bold">${density.text}</span>
                </div>`;
            }).join('')}
        </div>
    `;
}

// Search Handler
async function handleSearch(e) {
    e.preventDefault();
    UI.showSkeletons();
    const btnText = document.getElementById('btnText');
    btnText.innerHTML = '<div class="spinner"></div>';

    const q = document.getElementById('searchKey').value;
    const l = document.getElementById('searchLoc').value;
    const s = document.getElementById('searchSalary').value;

    let url = `${CONFIG.URL}?app_id=${CONFIG.ID}&app_key=${CONFIG.KEY}&what=${encodeURIComponent(q)}`;
    if (l) url += `&where=${encodeURIComponent(l)}`;
    if (s) url += `&salary_min=${s}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const data = await res.json();
        window.lastResults = data.results;
        renderResults(data.results, q);
        fetchMarketInsights(q);
    } catch (err) {
        UI.toast("Network error. Try again.", "error");
    } finally {
        btnText.textContent = "Search Jobs";
    }
}

// Fetch Job Recommendations based on user profile
async function fetchRecommendations() {
    const user = AuthService.getCurrentUser();
    if (!user || !user.qualification || !user.location) return; // Skip if no data

    UI.showSkeletons();
    const url = `${CONFIG.URL}?app_id=${CONFIG.ID}&app_key=${CONFIG.KEY}&what=${encodeURIComponent(user.qualification)}&where=${encodeURIComponent(user.location)}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const data = await res.json();
        window.lastResults = data.results;
        renderResults(data.results, user.qualification);
        fetchMarketInsights(user.qualification);
    } catch (err) {
        UI.toast("Failed to load recommendations.", "error");
        // Fallback to placeholder
        document.getElementById('resultsArea').innerHTML = `
            <div class="flex flex-col items-center justify-center p-20 glass rounded-[3rem] text-center border-dashed border-2 border-white/5">
                <div class="text-5xl mb-4">🇿🇦</div>
                <h2 class="text-2xl font-bold text-white mb-2">Ready for your next move?</h2>
                <p class="text-slate-400 text-sm max-w-xs mx-auto">Use the filters to find opportunities across South Africa.</p>
            </div>`;
    }
}

// Rendering Results
function renderResults(jobs, query) {
    const area = document.getElementById('resultsArea');
    if (!jobs.length) {
        area.innerHTML = `<div class="p-12 text-center glass rounded-3xl"><p class="font-bold">No results found</p></div>`;
        return;
    }

    area.innerHTML = jobs.map((job, i) => {
        const score = calculateMatch(job.title, query);
        return `
        <div class="glass p-8 rounded-[3rem] relative group hover:bg-white/[0.05] transition-all duration-500 border border-white/5">
            <div class="flex flex-col md:flex-row gap-6">
                <div class="w-16 h-16 rounded-2xl bg-white/5 p-2 flex-shrink-0 border border-white/10">
                    <img src="${getLogo(job.company.display_name)}" 
                         onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(job.company.display_name)}&background=random&color=fff'" 
                         class="w-full h-full object-contain rounded-lg">
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">${job.title}</h3>
                            <p class="text-emerald-500 font-medium">${job.company.display_name} • ${job.location.display_name}</p>
                            <div class="flex gap-3 mt-3">
                                <span class="text-[9px] bg-white/5 px-2 py-1 rounded text-slate-400 border border-white/5"> POSTED: ${formatDate(job.created)}</span>
                                <span class="text-[9px] bg-red-500/10 px-2 py-1 rounded text-red-400 border border-red-500/10"> CLOSES: ${getClosingDate(job.created)}</span>
                            </div>
                        </div>
                        <div class="text-center">
                            <div class="w-12 h-12 rounded-full border-2 border-emerald-500 flex items-center justify-center text-[10px] font-bold text-emerald-500 bg-emerald-500/10">${score}%</div>
                            <span class="text-[8px] text-slate-500 mt-1 uppercase font-bold">Match</span>
                        </div>
                    </div>
                    <p class="text-sm text-slate-400 line-clamp-2 mb-6">${job.description}</p>
                    <div class="flex gap-3">
                        <button onclick="openQuickView(${i})" class="flex-1 py-4 glass rounded-2xl text-[10px] font-bold uppercase transition hover:bg-white/10">Quick View</button>
                        <button onclick="saveJob(${i})" class="px-6 py-4 bg-slate-800 rounded-2xl hover:text-red-500 transition-colors">❤</button>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

function openQuickView(index) {
    const job = window.lastResults[index];
    const content = document.getElementById('quickViewContent');
    content.innerHTML = `
        <h2 class="text-3xl font-extrabold mb-2">${job.title}</h2>
        <p class="text-emerald-400 font-bold mb-4">${job.company.display_name}</p>
        <div class="flex gap-4 mb-6 text-[10px]">
            <span><strong>Posted:</strong> ${formatDate(job.created)}</span>
            <span class="text-red-400"><strong>Deadline:</strong> ${getClosingDate(job.created)}</span>
        </div>
        <div class="p-4 bg-white/5 rounded-2xl text-sm text-slate-300 leading-relaxed">${job.description}</div>
        <a href="${job.redirect_url}" target="_blank" class="block w-full text-center py-4 bg-emerald-500 text-white rounded-2xl font-bold uppercase text-xs mt-8">Apply Now</a>
    `;
    document.getElementById('quickView').classList.remove('translate-x-full');
}

function closeQuickView() { document.getElementById('quickView').classList.add('translate-x-full'); }

function saveJob(i) {
    const job = window.lastResults[i];
    const email = localStorage.getItem('lula_session');
    const users = JSON.parse(localStorage.getItem('lula_users'));
    if (!users[email].saved.some(s => s.id === job.id)) {
        users[email].saved.push({ id: job.id, title: job.title, url: job.redirect_url });
        localStorage.setItem('lula_users', JSON.stringify(users));
        UI.toast("Saved to Vault!", "success");
        renderSaved();
    }
}

function renderSaved() {
    const u = AuthService.getCurrentUser();
    const list = document.getElementById('savedJobsList');
    if (!u || !u.saved?.length) {
        list.innerHTML = `<p class="text-[9px] text-slate-600 text-center">Vault empty</p>`;
        return;
    }
    list.innerHTML = u.saved.map(s => `
        <div class="p-3 bg-white/5 rounded-2xl flex justify-between items-center text-[10px]">
            <a href="${s.url}" target="_blank" class="truncate font-bold text-slate-300">${s.title}</a>
            <button onclick="removeSaved('${s.id}')" class="text-red-500">&times;</button>
        </div>`).join('');
}

function removeSaved(id) {
    const email = localStorage.getItem('lula_session');
    const users = JSON.parse(localStorage.getItem('lula_users'));
    users[email].saved = users[email].saved.filter(s => s.id !== id);
    localStorage.setItem('lula_users', JSON.stringify(users));
    renderSaved();
}

function toggleSettings(open) {
    const panel = document.getElementById('settingsPanel');
    if (open) {
        const user = AuthService.getCurrentUser();
        document.getElementById('setUpdateName').value = user.name || '';
        document.getElementById('setUpdateSurname').value = user.surname || '';
        document.getElementById('setUpdatePhone').value = user.phone || '';
        document.getElementById('setUpdateLocation').value = user.location || '';
        document.getElementById('setUpdateQualification').value = user.qualification || '';
        panel.classList.remove('translate-x-full');
    } else {
        panel.classList.add('translate-x-full');
    }
}

function handleUpdateProfile(e) {
    e.preventDefault();
    const updateObj = { 
        name: document.getElementById('setUpdateName').value, 
        surname: document.getElementById('setUpdateSurname').value, 
        phone: document.getElementById('setUpdatePhone').value,
        location: document.getElementById('setUpdateLocation').value,
        qualification: document.getElementById('setUpdateQualification').value
    };
    const pass = document.getElementById('setUpdatePass').value;
    if (pass) updateObj.pass = pass;
    if (AuthService.updateUser(updateObj)) {
        document.getElementById('userNameDisplay').textContent = updateObj.name;
        UI.toast("Profile updated!");
        toggleSettings(false);
    }
}

function toggleAuth(isReg) {
    document.getElementById('regForm').classList.toggle('hidden', !isReg);
    document.getElementById('loginForm').classList.toggle('hidden', isReg);
}

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
        toggleAuth(false);
    } catch (err) { UI.toast(err.message, "error"); }
}

function handleLogin(e) {
    e.preventDefault();
    try {
        AuthService.login(document.getElementById('loginEmail').value, document.getElementById('loginPass').value);
        boot();
    } catch (err) { UI.toast(err.message, "error"); }
}

function boot() {
    const user = AuthService.getCurrentUser();
    if (user) {
        document.getElementById('authWrapper').classList.add('hidden');
        document.getElementById('appDashboard').classList.remove('hidden');
        document.getElementById('userNameDisplay').textContent = user.name;
        renderSaved();
        fetchRecommendations(); // Load personalized job recommendations
    }
}

window.addEventListener('DOMContentLoaded', boot);
