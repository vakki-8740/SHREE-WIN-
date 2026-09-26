document.addEventListener('DOMContentLoaded', function () {
    console.log('Website loaded successfully!');
});

function toggleMenu() {
    const overlay = document.getElementById('menuOverlay');
    const sidebar = document.getElementById('sidebar');
    overlay.classList.toggle('active');
    sidebar.classList.toggle('active');
}

function toggleAnswer(el) {
    el.classList.toggle('active');
}

let currentForm = null;

function submitComplaint(e) {
    e.preventDefault();
    const form = e.target;
    currentForm = form;
    const btn = form.querySelector('.btn');
    btn.disabled = true;
    btn.classList.add('loading');
    btn.innerHTML = '<span class="spinner"></span> Submitting...';

    const formData = {};
    new FormData(form).forEach(function (value, key) {
        if (typeof value === 'string') formData[key] = value;
    });

    const fileInput = form.querySelector('input[type="file"]');
    if (fileInput && fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (event) {
            finishSubmit(form, formData, event.target.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        finishSubmit(form, formData, '');
    }
}

function finishSubmit(form, formData, imageData) {
    const request = {
        type: form.id === 'depositeForm' ? 'DEPOSITE' : 'WITHDRAWAL',
        data: formData,
        image: imageData,
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-GB'),
        createdAt: Date.now()
    };

    db.ref('complaints').push(request).then(function () {
        const btn = form.querySelector('.btn');
        btn.disabled = false;
        btn.classList.remove('loading');
        btn.textContent = 'Submit Complaint';
        document.getElementById('successPopup').classList.add('active');
    }).catch(function (error) {
        const btn = form.querySelector('.btn');
        btn.disabled = false;
        btn.classList.remove('loading');
        btn.textContent = 'Submit Complaint';
        alert('Error: ' + error.message);
    });
}

function closePopup() {
    document.getElementById('successPopup').classList.remove('active');
    if (currentForm) {
        currentForm.reset();
        currentForm = null;
    }
    setTimeout(function () {
        window.location.href = 'contact.html';
    }, 500);
}

function loadRequests() {
    const container = document.getElementById('mailboxContainer');
    if (!container) return;

    db.ref('complaints').once('value').then(function (snapshot) {
        const requests = [];
        snapshot.forEach(function (child) {
            const data = child.val();
            data.key = child.key;
            requests.push(data);
        });
        requests.reverse();

        if (requests.length === 0) {
            container.innerHTML = '<p class="no-requests">No submitted requests yet.</p>';
            return;
        }

        let html = '';
        requests.forEach(function (req) {
            const d = req.data;
            let imageHtml = '';
            if (req.image) {
                imageHtml = '<div class="request-image"><img src="' + req.image + '" alt="Payment Image"></div>';
            }
            html += '<div class="request-card">' +
                '<div class="request-header">' +
                '<span class="request-type">' + req.type + '</span>' +
                '<span class="request-datetime">' + req.date + ' | ' + req.time + '</span>' +
                '</div>' +
                '<div class="request-details">' +
                '<div class="request-row"><strong>User Name:</strong> ' + (d.username || '-') + '</div>' +
                '<div class="request-row"><strong>Mobile:</strong> ' + (d.mobile || '-') + '</div>' +
                '<div class="request-row"><strong>Email:</strong> ' + (d.email || '-') + '</div>' +
                '<div class="request-row"><strong>Problem:</strong> ' + (d.problem || '-') + '</div>' +
                '<div class="request-row"><strong>Amount:</strong> ' + (d['deposit-amount'] || d['withdrawal-amount'] || '-') + '</div>' +
                '</div>' +
                imageHtml +
                '<button class="delete-btn" onclick="deleteRequest(\'' + req.key + '\')">Delete</button>' +
                '<div style="clear:both"></div>' +
                '</div>';
        });

        container.innerHTML = html;
    });
}

function deleteRequest(key) {
    if (!confirm('Delete this request?')) return;
    db.ref('complaints/' + key).remove().then(function () {
        loadRequests();
    });
}

document.addEventListener('DOMContentLoaded', function () {
    loadRequests();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('service-worker.js').then(function (reg) {
            console.log('SW registered:', reg.scope);
        }).catch(function (err) {
            console.log('SW registration failed:', err);
        });
    });
}
