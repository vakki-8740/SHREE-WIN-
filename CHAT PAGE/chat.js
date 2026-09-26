let chats = [];
let editingId = null;
let replyTo = null;

function checkVerification() {
    const userData = localStorage.getItem('chatUserData');
    const overlay = document.getElementById('verifyOverlay');
    const chatMain = document.getElementById('chatMain');
    if (userData) {
        if (overlay) overlay.style.display = 'none';
        if (chatMain) chatMain.style.display = '';
        loadChats();
    } else {
        if (overlay) overlay.style.display = 'flex';
        if (chatMain) chatMain.style.display = 'none';
        setupVerifyForm();
    }
}

function setupVerifyForm() {
    const form = document.getElementById('verifyForm');
    if (!form) return;
    form.onsubmit = function (e) {
        e.preventDefault();
        const name = document.getElementById('vName').value.trim();
        const mobile = document.getElementById('vMobile').value.trim();
        const password = document.getElementById('vPassword').value.trim();
        const email = document.getElementById('vEmail').value.trim();
        if (!name || !mobile || !password || !email) {
            alert('Please fill all fields');
            return;
        }
        const userData = { name: name, mobile: mobile, password: password, email: email };
        localStorage.setItem('chatUserData', JSON.stringify(userData));
        const overlay = document.getElementById('verifyOverlay');
        const chatMain = document.getElementById('chatMain');
        if (overlay) overlay.style.display = 'none';
        if (chatMain) chatMain.style.display = '';
        loadChats();
    };
}

function loadChats() {
    const box = document.getElementById('chatMessages');
    if (!box) return;

    db.ref('chats').on('value', function (snapshot) {
        chats = [];
        snapshot.forEach(function (child) {
            const data = child.val();
            data.key = child.key;
            chats.push(data);
        });

        if (chats.length === 0) {
            box.innerHTML = '<div class="chat-welcome"><p>Welcome to SHREE WIN GAME Support Chat</p><span>Send a message to start the conversation</span></div>';
            return;
        }

        let html = '';
        chats.forEach(function (chat, index) {
            const mine = chat.sender === 'me';
            let bubbleClass = mine ? 'msg-sent' : 'msg-received';
            let content = '';

            if (chat.image) {
                content = '<img class="msg-image" src="' + chat.image + '" alt="Image" onclick="openImageViewer(\'' + chat.image.replace(/'/g, "\\'") + '\', \'image.png\')">';
                if (chat.text) {
                    content += '<div class="msg-text">' + escapeHtml(chat.text) + '</div>';
                }
            } else if (chat.file) {
                content = '<a class="msg-file" href="' + chat.file + '" download="' + escapeHtml(chat.fileName || 'file') + '">' +
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>' +
                    '<div class="file-info"><span class="file-name">' + escapeHtml(chat.fileName || 'File') + '</span><span class="file-size">' + (chat.fileSize || '') + '</span></div>' +
                    '<span class="file-dl">↓</span>' +
                    '</a>';
                if (chat.text) {
                    content += '<div class="msg-text">' + escapeHtml(chat.text) + '</div>';
                }
            } else {
                content = '<div class="msg-text">' + escapeHtml(chat.text) + '</div>';
            }

            let replyHtml = '';
            if (chat.replyTo) {
                replyHtml = '<div class="msg-reply-ref">↩ "' + escapeHtml(chat.replyTo.substring(0, 40)) + '"</div>';
            }

            html += '<div class="msg-row ' + (mine ? 'right' : 'left') + '" onclick="showChatDetail(' + index + ')">' +
                '<div class="msg-bubble ' + bubbleClass + '">' +
                replyHtml +
                content +
                '<div class="msg-meta">' +
                '<span class="msg-time">' + chat.time + '</span>' +
                '<span class="msg-tick">✓✓</span>' +
                '</div>' +
                '</div>' +
                '<div class="msg-actions">' +
                '<button class="mini-btn" title="Reply" onclick="event.stopPropagation(); replyChat(' + index + ')">↩</button>' +
                '<button class="mini-btn" title="Edit" onclick="event.stopPropagation(); editChat(' + index + ')">✎</button>' +
                '<button class="mini-btn" title="Copy" onclick="event.stopPropagation(); copyChat(' + index + ')">⎘</button>' +
                '<button class="mini-btn mini-del" title="Delete" onclick="event.stopPropagation(); deleteChat(' + index + ')">✕</button>' +
                '</div>' +
                '</div>';
        });

        box.innerHTML = html;
        box.scrollTop = box.scrollHeight;
    });
}

function pushChat(chat) {
    db.ref('chats').push(chat);
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    const chat = {
        text: text,
        sender: 'me',
        replyTo: replyTo || null,
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-GB'),
        createdAt: Date.now()
    };

    pushChat(chat);
    input.value = '';
    replyTo = null;
    document.getElementById('chatInput').placeholder = 'Type a message...';
}

function sendImage() {
    const input = document.getElementById('imageInput');
    if (!input.files.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        pushChat({
            text: '',
            image: e.target.result,
            fileName: file.name,
            sender: 'me',
            replyTo: null,
            date: new Date().toLocaleDateString('en-GB'),
            time: new Date().toLocaleTimeString('en-GB'),
            createdAt: Date.now()
        });
        input.value = '';
    };
    reader.readAsDataURL(file);
}

function sendFile() {
    const input = document.getElementById('fileInput');
    if (!input.files.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        pushChat({
            text: '',
            file: e.target.result,
            fileName: file.name,
            fileSize: formatSize(file.size),
            fileType: file.type || 'file',
            sender: 'me',
            replyTo: null,
            date: new Date().toLocaleDateString('en-GB'),
            time: new Date().toLocaleTimeString('en-GB'),
            createdAt: Date.now()
        });
        input.value = '';
    };
    reader.readAsDataURL(file);
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function replyChat(index) {
    replyTo = chats[index].text;
    const input = document.getElementById('chatInput');
    input.placeholder = 'Replying to: "' + replyTo.substring(0, 25) + '..."';
    input.focus();
}

function editChat(index) {
    editingId = chats[index].key;
    document.getElementById('editInput').value = chats[index].text;
    document.getElementById('editPopup').classList.add('active');
    document.getElementById('editInput').focus();
}

function saveEdit() {
    const newText = document.getElementById('editInput').value.trim();
    if (!newText || !editingId) return;
    db.ref('chats/' + editingId).update({
        text: newText,
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-GB')
    });
    editingId = null;
    document.getElementById('editPopup').classList.remove('active');
}

function closeEditPopup() {
    document.getElementById('editPopup').classList.remove('active');
    editingId = null;
}

function copyChat(index) {
    const text = chats[index].text;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () { alert('Message copied!'); });
    } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        alert('Message copied!');
    }
}

function deleteChat(index) {
    if (confirm('Delete this message?')) {
        db.ref('chats/' + chats[index].key).remove();
    }
}

function showChatDetail(index) {
    const chat = chats[index];
    let html = '';
    html += '<div class="detail-row"><strong>Message:</strong> ' + (chat.text ? escapeHtml(chat.text) : (chat.fileName || chat.image ? 'Attachment' : '-')) + '</div>';
    html += '<div class="detail-row"><strong>From:</strong> ' + (chat.sender === 'me' ? 'You' : 'Support Team') + '</div>';
    if (chat.fileName) {
        html += '<div class="detail-row"><strong>File:</strong> ' + escapeHtml(chat.fileName) + '</div>';
        if (chat.fileSize) html += '<div class="detail-row"><strong>Size:</strong> ' + chat.fileSize + '</div>';
    }
    if (chat.replyTo) {
        html += '<div class="detail-row"><strong>Reply To:</strong> ' + escapeHtml(chat.replyTo) + '</div>';
    }
    html += '<div class="detail-row"><strong>Date:</strong> ' + chat.date + '</div>';
    html += '<div class="detail-row"><strong>Time:</strong> ' + chat.time + '</div>';
    html += '<div class="detail-row"><strong>Full:</strong> ' + chat.date + ' ' + chat.time + '</div>';

    document.getElementById('chatDetailContent').innerHTML = html;
    document.getElementById('chatPopup').classList.add('active');
}

function closeChatPopup() {
    document.getElementById('chatPopup').classList.remove('active');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// ====== CHAT INFO POPUP ======
function openChatInfo() {
    document.getElementById('chatInfoPopup').classList.add('active');
}

function closeChatInfo() {
    document.getElementById('chatInfoPopup').classList.remove('active');
}

function openChatMedia() {
    closeChatInfo();
    alert('Media & Files feature coming soon!');
}

function openChatSearch() {
    closeChatInfo();
    alert('Search feature coming soon!');
}

function clearChatHistory() {
    if (confirm('Clear all chat history? This cannot be undone.')) {
        db.ref('chats').remove().then(function () {
            alert('Chat history cleared!');
        });
    }
    closeChatInfo();
}

// ====== IMAGE VIEWER ======
function openImageViewer(src, fileName) {
    const viewer = document.getElementById('imageViewer');
    const img = document.getElementById('imageViewerImg');
    const download = document.getElementById('imageViewerDownload');
    const info = document.getElementById('imageViewerInfo');
    
    img.src = src;
    download.href = src;
    download.download = fileName || 'image.png';
    info.textContent = fileName || 'Image';
    
    viewer.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeImageViewer() {
    const viewer = document.getElementById('imageViewer');
    const img = document.getElementById('imageViewerImg');
    viewer.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { img.src = ''; }, 300);
}

document.addEventListener('DOMContentLoaded', function () {
    checkVerification();

    // Close image viewer on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeImageViewer();
            closeChatInfo();
        }
    });
});
