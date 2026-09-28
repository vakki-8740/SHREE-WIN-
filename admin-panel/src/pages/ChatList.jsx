import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AdminHeader } from '../components/AdminHeader.jsx';
import UserIcon from '../components/UserIcon.jsx';
import { useLiveList } from '../hooks/useLive.js';
import { ChatIcon, UsersIcon } from '../components/icons.jsx';

export default function ChatList() {
  const [rows, error] = useLiveList('complaints', 100);

  const users = useMemo(() => {
    if (!rows) return [];
    const seen = {};
    rows.forEach((r) => {
      const name = (r.data && r.data.username) || 'Unknown';
      if (!seen[name]) seen[name] = { name, lastTime: r.time, lastDate: r.date };
    });
    return Object.values(seen);
  }, [rows]);

  return (
    <>
      <AdminHeader back="/index.html" title="CHAT" TitleIcon={<ChatIcon size={22} />} />

      <div className="users-section" style={{ paddingTop: '15px' }}>
        <div className="chat-user-list" id="chatUserList">
          {!rows && <p className="no-users"><span className="loading-spinner"></span> Loading...</p>}

          {error && <p className="no-users">Error loading users: {error.message}</p>}

          {rows && users.length === 0 && (
            <p className="no-users"><UsersIcon size={20} /> No users yet.</p>
          )}

          {users.map((user, index) => {
            const isOnline = index % 2 === 0;
            return (
              <Link
                className="chat-user-card"
                key={user.name}
                to={'/chatroom.html?user=' + encodeURIComponent(user.name)}
              >
                <UserIcon className="chat-user-icon" />
                <div className="chat-user-info">
                  <span className="chat-user-name">{user.name}</span>
                  <span className="chat-user-status">
                    <span className={isOnline ? 'status-dot online' : 'status-dot offline'} />
                    {isOnline ? ' Online' : ' Offline'}
                  </span>
                </div>
                <span className="chat-user-time">{user.lastTime}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
