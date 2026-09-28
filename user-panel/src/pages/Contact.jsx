import { useEffect, useState } from 'react';
import { ref, onValue, remove } from 'firebase/database';
import { db } from '../firebase.js';
import Layout, { ROOT_NAV } from '../components/Layout.jsx';

export default function Contact() {
  const [requests, setRequests] = useState(null);

  useEffect(() => {
    const unsub = onValue(ref(db, 'complaints'), (snap) => {
      const list = [];
      snap.forEach((child) => {
        list.push({ key: child.key, ...child.val() });
      });
      list.reverse();
      setRequests(list);
    });
    return unsub;
  }, []);

  function deleteRequest(key) {
    if (!confirm('Delete this request?')) return;
    remove(ref(db, 'complaints/' + key));
  }

  return (
    <Layout title="MAIL BOX" nav={ROOT_NAV}>
      <main>
        <section>
          <div className="container">
            <h2 className="page-title">MAIL BOX</h2>
            <div className="mailbox-container" id="mailboxContainer">
              {requests === null && <p className="no-requests">No submitted requests yet.</p>}

              {requests !== null && requests.length === 0 && (
                <p className="no-requests">No submitted requests yet.</p>
              )}

              {requests !== null && requests.map((req) => {
                const d = req.data || {};
                return (
                  <div className="request-card" key={req.key}>
                    <div className="request-header">
                      <span className="request-type">{req.type}</span>
                      <span className="request-datetime">{req.date} | {req.time}</span>
                    </div>
                    <div className="request-details">
                      <div className="request-row"><strong>User Name:</strong> {d.username || '-'}</div>
                      <div className="request-row"><strong>Mobile:</strong> {d.mobile || '-'}</div>
                      <div className="request-row"><strong>Email:</strong> {d.email || '-'}</div>
                      <div className="request-row"><strong>Problem:</strong> {d.problem || '-'}</div>
                      <div className="request-row"><strong>Amount:</strong> {d['deposit-amount'] || d['withdrawal-amount'] || '-'}</div>
                    </div>
                    {req.image && (
                      <div className="request-image">
                        <img src={req.image} alt="Payment Image" />
                      </div>
                    )}
                    <button className="delete-btn" onClick={() => deleteRequest(req.key)}>Delete</button>
                    <div style={{ clear: 'both' }}></div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
