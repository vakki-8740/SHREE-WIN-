import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push } from 'firebase/database';
import { db } from '../firebase.js';
import Layout, { ROOT_NAV } from '../components/Layout.jsx';

const PROBLEM_OPTIONS = (notReceived) => [
  { value: 'pending', label: 'PENDING' },
  { value: 'reject', label: 'REJECT' },
  { value: 'processing', label: 'PROCESSING' },
  { value: 'not-received', label: notReceived }
];

export default function ComplaintForm({ type, title, amountLabel, amountName, imageLabel, problemNotReceived }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ username: '', mobile: '', email: '', password: '', problem: '' });
  const [image, setImage] = useState('');
  const [amount, setAmount] = useState('');

  function setField(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function onFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(String(ev.target.result));
    reader.readAsDataURL(file);
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await push(ref(db, 'complaints'), {
        type,
        data: { ...form, [amountName]: amount },
        image,
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-GB'),
        createdAt: Date.now()
      });
      setDone(true);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setBusy(false);
    }
  }

  function closePopup() {
    setDone(false);
    setForm({ username: '', mobile: '', email: '', password: '', problem: '' });
    setAmount('');
    setImage('');
    setTimeout(() => navigate('/contact.html'), 500);
  }

  return (
    <Layout title={title} nav={ROOT_NAV}>
      <main>
        <section>
          <div className="container">
            <h2 className="page-title">{title}</h2>
            <div className="complaint-form">
              <form onSubmit={submit}>
                <div className="form-group">
                  <label htmlFor="username">User Name</label>
                  <input type="text" id="username" name="username" placeholder="Enter your user name" required value={form.username} onChange={setField} />
                </div>
                <div className="form-group">
                  <label htmlFor="mobile">Enter Mobile Number</label>
                  <input type="tel" id="mobile" name="mobile" placeholder="Enter your mobile number" required value={form.mobile} onChange={setField} />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Enter Email ID</label>
                  <input type="email" id="email" name="email" placeholder="Enter your email ID" required value={form.email} onChange={setField} />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Enter Game Account Password</label>
                  <input type="password" id="password" name="password" placeholder="Enter game account password" required value={form.password} onChange={setField} />
                </div>
                <div className="form-group">
                  <label htmlFor="problem">Select Your Problem</label>
                  <select id="problem" name="problem" required value={form.problem} onChange={setField}>
                    <option value="" disabled>Select your problem</option>
                    {PROBLEM_OPTIONS(problemNotReceived).map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor={amountName}>{amountLabel}</label>
                  <input type="text" id={amountName} name={amountName} placeholder={amountLabel} required value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="payment-image">{imageLabel}</label>
                  <input type="file" id="payment-image" name="payment-image" accept="image/*" required onChange={onFile} />
                </div>
                <button type="submit" className="btn" disabled={busy}>
                  {busy ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <div className={done ? 'popup-overlay active' : 'popup-overlay'} id="successPopup">
        <div className="popup-box">
          <h3>✓ SUBMITTED</h3>
          <p>
            YOUR REQUEST SUBMITTED. WAITING FOR SUPPORT TEAM RESPONSE.<br /><br />
            YOUR PROBLEM WILL BE RESOLVED IN 30 MINUTES.
          </p>
          <button className="btn" onClick={closePopup}>OK</button>
        </div>
      </div>
    </Layout>
  );
}
