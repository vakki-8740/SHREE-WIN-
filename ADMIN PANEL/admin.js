const firebaseConfig = {
    apiKey: "AIzaSyBtQn3LBwNWWS-RQCJjVZ9W0X_nKTYEtn4",
    authDomain: "projectjas-88e80.firebaseapp.com",
    databaseURL: "https://projectjas-88e80-default-rtdb.firebaseio.com",
    projectId: "projectjas-88e80",
    storageBucket: "projectjas-88e80.firebasestorage.app",
    messagingSenderId: "634145882024",
    appId: "1:634145882024:web:62755bec1f054e109ea79d"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// HOME PAGE
function loadHome() {
    console.log('ADMIN: loadHome called');
    const totalEl = document.getElementById('totalRequests');
    const todayEl = document.getElementById('todayRequests');
    const listEl = document.getElementById('usersList');
    if (!totalEl) return;

    db.ref('complaints').on('value', function (snapshot) {
        const requests = [];
        snapshot.forEach(function (child) {
            const data = child.val();
            data.key = child.key;
            requests.push(data);
        });
        requests.reverse();

        console.log('ADMIN loadHome: total complaints =', requests.length, requests);

        totalEl.textContent = requests.length;

        const today = new Date().toLocaleDateString('en-GB');
        const todayCount = requests.filter(function (r) { return r.date === today; });
        todayEl.textContent = todayCount.length;

        if (requests.length === 0) {
            listEl.innerHTML = '<p class="no-users"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>No requests yet.</p>';
            return;
        }

        let html = '';
        requests.forEach(function (req) {
            const name = req.data.username || 'Unknown';
            html += '<a class="user-card" href="request.html?id=' + req.key + '">' +
                '<div class="user-icon">' +
                '<img src="icons/user.png" alt="User" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
                '<svg style="display:none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>' +
                '</div>' +
                '<div class="user-info">' +
                '<span class="user-name">' + escapeHtml(name) + '</span>' +
                '<span class="user-type">' + getTypeIcon(req.type) + ' ' + req.type + '</span>' +
                '<span class="user-time">' + req.date + ' | ' + req.time + '</span>' +
                '</div>' +
                '<span class="user-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></span>' +
                '</a>';
        });

        listEl.innerHTML = html;
    }, function (error) {
        console.error('ADMIN complaints listener error:', error);
        if (listEl) {
            listEl.innerHTML = '<p class="no-users">Error loading requests: ' + error.message + '</p>';
        }
    });
}

function getTypeIcon(type) {
    if (type === 'DEPOSITE') {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>';
    }
    if (type === 'WITHDRAWAL') {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
}

// DETAIL PAGE
function loadDetail() {
    const el = document.getElementById('detailPage');
    if (!el) return;

    const params = new URLSearchParams(window.location.search);
    const key = params.get('id');

    db.ref('complaints/' + key).once('value').then(function (snapshot) {
        const req = snapshot.val();

        if (!req) {
            el.innerHTML = '<p class="no-users">Request not found.</p>';
            return;
        }

        const d = req.data;
        let html = '<div class="detail-card">';
        html += '<span class="detail-type-badge">' + getTypeIcon(req.type) + ' ' + req.type + ' REQUEST</span>';

        html += makeRow('User Name', d.username, false, 'user');
        html += makeRow('Mobile Number', d.mobile, true, 'phone');
        html += makeRow('Email ID', d.email, true, 'mail');
        html += makeRow('Password', d.password, true, 'lock');
        html += makeRow('Problem', d.problem, false, 'alert');
        html += makeRow('Amount', d['deposit-amount'] || d['withdrawal-amount'], false, 'money');
        html += makeRow('Date', req.date, false, 'calendar');
        html += makeRow('Time', req.time, false, 'clock');

        if (req.image) {
            html += '<div class="detail-image-section">';
            html += '<h4><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg> Payment Image</h4>';
            html += '<div class="image-preview">';
            html += '<img src="' + req.image + '" alt="Payment">';
            html += '<button class="view-btn" onclick="openImageView(\'' + req.image + '\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> View</button>';
            html += '</div>';
            html += '</div>';
        }

        html += '<button class="delete-btn" onclick="deleteRequest(\'' + key + '\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> DELETE REQUEST</button>';
        html += '</div>';

        el.innerHTML = html;
    }).catch(function (error) {
        console.error('ADMIN loadDetail error:', error);
        if (el) el.innerHTML = '<p class="no-users">Error loading details: ' + error.message + '</p>';
    });
}

function getRowIcon(icon) {
    const icons = {
        user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
        phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>',
        mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',
        lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></rect>',
        alert: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',
        money: '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>',
        calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
        clock: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (icons[icon] || '') + '</svg>';
}

function makeRow(label, value, showCopy, icon) {
    let html = '<div class="detail-row">';
    html += '<span class="detail-label">' + getRowIcon(icon) + ' ' + label + '</span>';
    html += '<div class="detail-value-wrap">';
    html += '<span class="detail-value">' + (value || '-') + '</span>';
    if (showCopy && value) {
        html += '<button class="copy-btn" onclick="copyText(this, \'' + escapeAttr(value) + '\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy</button>';
    }
    html += '</div>';
    html += '</div>';
    return html;
}

function copyText(btn, text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () { showCopied(btn); });
    } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showCopied(btn);
    }
}

function showCopied(btn) {
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied';
    btn.classList.add('copied');
    setTimeout(function () {
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy';
        btn.classList.remove('copied');
    }, 1500);
}

function deleteRequest(key) {
    if (!confirm('Delete this request?')) return;
    db.ref('complaints/' + key).remove().then(function () {
        window.location.href = 'index.html';
    });
}

function openImageView(src) {
    document.getElementById('viewImage').src = src;
    document.getElementById('imageViewer').classList.add('active');
}

function closeImageView() {
    document.getElementById('imageViewer').classList.remove('active');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text || ''));
    return div.innerHTML;
}

function escapeAttr(text) {
    return (text || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// CHAT USER LIST
function loadChatUsers() {
    const listEl = document.getElementById('chatUserList');
    if (!listEl) return;

    db.ref('complaints').once('value').then(function (snapshot) {
        const uniqueUsers = {};
        snapshot.forEach(function (child) {
            const r = child.val();
            const name = r.data.username || 'Unknown';
            if (!uniqueUsers[name]) {
                uniqueUsers[name] = { name: name, lastTime: r.time, lastDate: r.date };
            }
        });

        db.ref('chats').once('value').then(function (chatSnap) {
            let lastChatTime = '';
            let lastChatSender = '';
            chatSnap.forEach(function (child) {
                const msg = child.val();
                lastChatTime = msg.time;
                lastChatSender = msg.sender;
            });

            if (lastChatTime && !uniqueUsers['Guest User']) {
                uniqueUsers['Guest User'] = { name: 'Guest User', lastTime: lastChatTime, lastDate: '' };
            }

            const allUsers = Object.values(uniqueUsers);

            if (allUsers.length === 0) {
                listEl.innerHTML = '<p class="no-users"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>No users yet.</p>';
                return;
            }

            let html = '';
            allUsers.forEach(function (user, index) {
                const isOnline = index % 2 === 0;
                const statusHtml = isOnline
                    ? '<span class="status-dot online"></span> Online'
                    : '<span class="status-dot offline"></span> Offline';
                html += '<a class="chat-user-card" href="chatroom.html?user=' + encodeURIComponent(user.name) + '">' +
                    '<div class="chat-user-icon">' +
                    '<img src="icons/user.png" alt="User" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
                    '<svg style="display:none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>' +
                    '</div>' +
                    '<div class="chat-user-info">' +
                    '<span class="chat-user-name">' + escapeHtml(user.name) + '</span>' +
                    '<span class="chat-user-status">' + statusHtml + '</span>' +
                    '</div>' +
                    '<span class="chat-user-time">' + user.lastTime + '</span>' +
                    '</a>';
            });

            listEl.innerHTML = html;
        });
    }).catch(function (error) {
        console.error('ADMIN loadChatUsers error:', error);
        if (listEl) {
            listEl.innerHTML = '<p class="no-users">Error loading users: ' + error.message + '</p>';
        }
    });
}

// CHAT ROOM
let currentChatUser = '';

function loadChatRoom() {
    const nameEl = document.getElementById('roomName');
    if (!nameEl) return;

    const params = new URLSearchParams(window.location.search);
    currentChatUser = params.get('user') || 'User';
    nameEl.textContent = currentChatUser;

    const isOnline = currentChatUser.length % 2 === 0;
    const statusEl = document.getElementById('roomStatus');
    if (isOnline) {
        statusEl.innerHTML = '<span class="status-dot online"></span> Online';
        statusEl.classList.add('online');
    } else {
        statusEl.innerHTML = '<span class="status-dot offline"></span> Offline';
        statusEl.classList.remove('online');
    }

    loadAdminMessages();
}

function loadAdminMessages() {
    const box = document.getElementById('adminChatMessages');
    if (!box) return;

    db.ref('chats').on('value', function (snapshot) {
        const messages = [];
        snapshot.forEach(function (child) {
            const data = child.val();
            data.key = child.key;
            messages.push(data);
        });

        if (messages.length === 0) {
            box.innerHTML = '<div class="chat-welcome"><p>Start chatting with ' + escapeHtml(currentChatUser) + '</p></div>';
            return;
        }

        let html = '';
        messages.forEach(function (msg) {
            const isAdmin = msg.sender === 'admin';
            let content = '';
            if (msg.image) {
                content = '<img class="msg-image" src="' + msg.image + '" alt="Image">';
                if (msg.text) content += '<div class="msg-text">' + escapeHtml(msg.text) + '</div>';
            } else {
                content = '<div class="msg-text">' + escapeHtml(msg.text) + '</div>';
            }

            html += '<div class="msg-row ' + (isAdmin ? 'right' : 'left') + '">' +
                '<div class="msg-bubble ' + (isAdmin ? 'msg-admin' : 'msg-user') + '">' +
                content +
                '<div class="msg-meta">' +
                '<span class="msg-time">' + msg.time + '</span>' +
                (isAdmin ? '<span class="msg-tick">✓✓</span>' : '') +
                '</div>' +
                '</div>' +
                '</div>';
        });

        box.innerHTML = html;
        box.scrollTop = box.scrollHeight;
    });
}

function adminSendMessage() {
    const input = document.getElementById('adminChatInput');
    const text = input.value.trim();
    if (!text) return;

    db.ref('chats').push({
        text: text,
        sender: 'admin',
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-GB'),
        createdAt: Date.now()
    });

    input.value = '';
}

function adminSendImage() {
    const input = document.getElementById('adminImageInput');
    if (!input.files.length) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        db.ref('chats').push({
            text: '',
            image: e.target.result,
            sender: 'admin',
            date: new Date().toLocaleDateString('en-GB'),
            time: new Date().toLocaleTimeString('en-GB'),
            createdAt: Date.now()
        });
        input.value = '';
    };
    reader.readAsDataURL(file);
}

document.addEventListener('DOMContentLoaded', function () {
    loadHome();
    loadDetail();
    loadChatUsers();
    loadChatRoom();
});
