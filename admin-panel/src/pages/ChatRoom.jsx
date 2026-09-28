import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ref, onValue, push, update, remove, get } from 'firebase/database';
import { db } from '../firebase.js';
import { AdminHeader } from '../components/AdminHeader.jsx';
import { OverlayImageViewer } from '../components/ImageViewers.jsx';
import { useLiveList } from '../hooks/useLive.js';
import { ImageIcon, SendIcon, UserSvg } from '../components/icons.jsx';

export default function ChatRoom() {
  const [params] = useSearchParams();
  const user = params.get('user') || 'User';

  const [messages, error] = useLiveList('chats', 30);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingKey, setEditingKey] = useState(null);
  const [editText, setEditText] = useState('');
  const [detail, setDetail] = useState(null);
  const [loadedImgs, setLoadedImgs] = useState({});
  const [viewer, setViewer] = useState(null);

  const boxRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages]);

  // The header status was derived from the name length in the old build.
  const isOnline = user.length % 2 === 0;

  function send() {
    const t = text.trim();
    if (!t) return;
    const payload = {
      text: t,
      sender: 'admin',
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-GB'),
      createdAt: Date.now()
    };
    if (replyTo) payload.replyTo = replyTo;
    push(ref(db, 'chats'), payload);
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
        sender: 'admin',
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-GB'),
        createdAt: Date.now()
      });
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  }

  // Read only the tapped message, not the whole chats node.
  async function openDetail(key) {
    const snap = await get(ref(db, 'chats/' + key));
    if (snap.exists()) setDetail({ key, ...snap.val() });
  }

  function startEdit(msg) {
    setEditingKey(msg.key);
    setEditText(msg.text || '');
  }

  function saveEdit() {
    const t = editText.trim();
    if (!t || !editingKey) return;
    update(ref(db, 'chats/' + editingKey), {
      text: t,
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-GB')
    });
    setEditingKey(null);
  }

  function copyMsg(msg) {
    if (navigator.clipboard) navigator.clipboard.writeText(msg.text || '').then(() => alert('Message copied!'));
    else alert('Message copied!');
  }

  function delMsg(key) {
    if (confirm('Delete this message?')) remove(ref(db, 'chats/' + key));
  }

  return (
    <>
      <AdminHeader back="/chat.html">
        <div className="chat-room-header-info">
          <div className="chat-room-avatar" id="roomAvatar">
            <UserSvg size={24} />
          </div>
          <div className="chat-room-details">
            <h1 id="roomName">{user}</h1>
            <span className={isOnline ? 'room-status online' : 'room-status'} id="roomStatus">
              <span className={isOnline ? 'status-dot online' : 'status-dot offline'} />
              {isOnline ? ' Online' : ' Offline'}
            </span>
          </div>
        </div>
      </AdminHeader>

      <div className="admin-chat-messages" id="adminChatMessages" ref={boxRef}>
        {!messages && <div className="chat-welcome"><span className="loading-spinner"></span> Loading...</div>}

        {error && <div className="chat-welcome">Error loading messages: {error.message}</div>}

        {messages && messages.length === 0 && (
          <div className="chat-welcome"><p>Start chatting with {user}</p></div>
        )}

        {messages && messages.map((msg) => {
          const isAdmin = msg.sender === 'admin';
          return (
            <div className={'msg-row ' + (isAdmin ? 'right' : 'left')} key={msg.key} id={'msg-' + msg.key}>
              <div
                className={'msg-bubble ' + (isAdmin ? 'msg-admin' : 'msg-user')}
                onClick={() => openDetail(msg.key)}
              >
                {msg.replyTo && (
                  <div className="msg-reply-ref">↩ &quot;{msg.replyTo.substring(0, 40)}&quot;</div>
                )}

                {msg.image ? (
                  <>
                    <div className="msg-image-wrapper" onClick={(e) => { e.stopPropagation(); setViewer(msg.image); }}>
                      <img
                        className={loadedImgs[msg.key] ? 'lazy-image loaded' : 'lazy-image'}
                        data-src={msg.image}
                        alt="Image"
                        src={loadedImgs[msg.key]
                          ? msg.image
                          : 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 200 200%27%3E%3Crect fill=%27%23f0f0f0%27 width=%27200%27 height=%27200%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 fill=%27%23999%27 font-size=%2712%27%3ETap to load%3C/text%3E%3C/svg%3E'}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLoadedImgs((s) => ({ ...s, [msg.key]: true }));
                        }}
                      />
                    </div>
                    {msg.text && <div className="msg-text">{msg.text}</div>}
                  </>
                ) : (
                  <div className="msg-text">{msg.text || ''}</div>
                )}

                <div className="msg-meta">
                  <span className="msg-time">{msg.time}</span>
                  {isAdmin && <span className="msg-tick">✓✓</span>}
                </div>
              </div>

              <div className="msg-actions">
                <button className="mini-btn" title="Reply" onClick={(e) => { e.stopPropagation(); setReplyTo(msg.text || ''); }}>↩</button>
                <button className="mini-btn" title="Edit" onClick={(e) => { e.stopPropagation(); startEdit(msg); }}>✎</button>
                <button className="mini-btn" title="Copy" onClick={(e) => { e.stopPropagation(); copyMsg(msg); }}>⎘</button>
                <button className="mini-btn del" title="Delete" onClick={(e) => { e.stopPropagation(); delMsg(msg.key); }}>✕</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="typing-indicator" id="typingIndicator" style={{ display: 'none' }}>
        <span></span><span></span><span></span>
      </div>

      <div className={editingKey ? 'edit-popup active' : 'edit-popup'} id="editPopup">
        <div className="edit-popup-box">
          <h3>EDIT MESSAGE</h3>
          <input
            type="text" id="editInput" placeholder="Edit your message..."
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className="popup-actions">
            <button className="btn btn-save" onClick={saveEdit}>Save</button>
            <button className="btn btn-cancel" onClick={() => setEditingKey(null)}>Cancel</button>
          </div>
        </div>
      </div>

      <div className={detail ? 'chat-detail-popup active' : 'chat-detail-popup'} id="chatDetailPopup">
        <div className="chat-detail-box">
          <h3>MESSAGE DETAILS</h3>
          <div id="chatDetailContent">
            {detail && (
              <>
                <div className="chat-detail-row"><strong>Message:</strong> {detail.text ? detail.text : (detail.fileName || detail.image ? 'Attachment' : '-')}</div>
                <div className="chat-detail-row"><strong>From:</strong> {detail.sender === 'admin' ? 'You (Admin)' : 'User'}</div>
                {detail.fileName && <div className="chat-detail-row"><strong>File:</strong> {detail.fileName}</div>}
                {detail.fileSize && <div className="chat-detail-row"><strong>Size:</strong> {detail.fileSize}</div>}
                {detail.replyTo && <div className="chat-detail-row"><strong>Reply To:</strong> {detail.replyTo}</div>}
                <div className="chat-detail-row"><strong>Date:</strong> {detail.date}</div>
                <div className="chat-detail-row"><strong>Time:</strong> {detail.time}</div>
                <div className="chat-detail-row"><strong>Full:</strong> {detail.date} {detail.time}</div>
              </>
            )}
          </div>
          <div className="chat-detail-actions">
            <button className="btn" onClick={() => setDetail(null)}>Close</button>
          </div>
        </div>
      </div>

      <div className="admin-chat-input-bar">
        <label className="input-action-btn" title="Send Image">
          <ImageIcon size={20} />
          <input ref={fileRef} type="file" id="adminImageInput" accept="image/*" onChange={sendImage} style={{ display: 'none' }} />
        </label>
        <input
          type="text" id="adminChatInput"
          placeholder={replyTo ? `Replying to: "${replyTo.substring(0, 25)}..."` : 'Type a message...'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
        />
        <button className="send-btn" onClick={send}>
          <SendIcon size={18} />
        </button>
      </div>

      <OverlayImageViewer src={viewer} fileName="payment.png" onClose={() => setViewer(null)} />
    </>
  );
}
