import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AdminHeader } from '../components/AdminHeader.jsx';
import UserIcon from '../components/UserIcon.jsx';
import { useLiveList } from '../hooks/useLive.js';
import {
  GearIcon, DocIcon, ChatIcon, RupeeIcon, TrendIcon, ArrowIcon, UsersIcon, RowCalendar
} from '../components/icons.jsx';

function TypeIcon({ type }) {
  if (type === 'DEPOSITE') return <RupeeIcon size={14} />;
  if (type === 'WITHDRAWAL') return <TrendIcon size={14} />;
  return <ChatIcon size={14} />;
}

export default function Home() {
  const [rows, error] = useLiveList('complaints', 50);

  const stats = useMemo(() => {
    if (!rows) return { total: 0, today: 0 };
    const today = new Date().toLocaleDateString('en-GB');
    return {
      total: rows.length,
      today: rows.filter((r) => r.date === today).length
    };
  }, [rows]);

  return (
    <>
      <AdminHeader title="ADMIN PANEL" TitleIcon={<GearIcon />} chatLink />

      <div className="cards-row">
        <div className="stat-card">
          <DocIcon className="stat-icon" size={22} />
          <span className="stat-num" id="totalRequests">{rows ? stats.total : 0}</span>
          <span className="stat-label">Total Request</span>
        </div>
        <div className="stat-card">
          <RowCalendar className="stat-icon" size={22} />
          <span className="stat-num" id="todayRequests">{rows ? stats.today : 0}</span>
          <span className="stat-label">Today Request</span>
        </div>
      </div>

      <div className="users-section">
        <h2 className="section-title">
          <UsersIcon size={20} />
          USERS
        </h2>
        <div className="users-list" id="usersList">
          {!rows && <p className="no-users"><span className="loading-spinner"></span> Loading...</p>}

          {error && <p className="no-users">Error loading requests: {error.message}</p>}

          {rows && rows.length === 0 && (
            <p className="no-users">
              <UsersIcon size={20} />
              No requests yet.
            </p>
          )}

          {rows && [...rows].reverse().map((req) => {
            const name = (req.data && req.data.username) || 'Unknown';
            return (
              <Link className="user-card" key={req.key} to={'/request.html?id=' + req.key}>
                <UserIcon className="user-icon" />
                <div className="user-info">
                  <span className="user-name">{name}</span>
                  <span className="user-type"><TypeIcon type={req.type} /> {req.type}</span>
                  <span className="user-time">{req.date} | {req.time}</span>
                </div>
                <span className="user-arrow"><ArrowIcon size={20} /></span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
