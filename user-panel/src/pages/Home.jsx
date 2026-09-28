import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout, { ROOT_NAV } from '../components/Layout.jsx';
import banner from '../assets/banner.jpg';
import depositeIcon from '../assets/deposite.png';
import withdrawalIcon from '../assets/withdrawal.png';
import chatIcon from '../assets/chat.png';

const OPTIONS = [
  { to: '/deposite.html', label: 'DEPOSITE PROBLEM', img: depositeIcon, alt: 'Deposite' },
  { to: '/withdrawal.html', label: 'WITHDRAWAL PROBLEM', img: withdrawalIcon, alt: 'Withdrawal' },
  { to: '/CHAT PAGE/chat.html', label: 'ONLINE CHAT', img: chatIcon, alt: 'Online Chat' }
];

const FAQS = [
  { q: 'What is DEPOSITE PROBLEM?', a: 'If you face any issue while depositing, contact our support team immediately.' },
  { q: 'How to resolve WITHDRAWAL PROBLEM?', a: 'Submit a withdrawal complaint with your details and our team will resolve it.' },
  { q: 'Is ONLINE CHAT available 24/7?', a: 'Yes, our online chat support is available 24/7 to help you.' },
  { q: 'How to submit a complaint?', a: 'Click on the relevant option from the menu and fill the complaint form.' }
];

export default function Home() {
  const [openFaqs, setOpenFaqs] = useState([]);

  function toggleFaq(i) {
    setOpenFaqs((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  }

  return (
    <Layout title="SHREE WIN GAME" nav={ROOT_NAV} footerLogo>
      <div className="banner">
        <img src={banner} alt="Banner" />
      </div>

      <main>
        <section className="options-section">
          <div className="container">
            <h2 className="option-title">SELECT OPTION OF YOUR PROBLEM</h2>
            {OPTIONS.map(({ to, label, img, alt }) => (
              <Link key={to} to={to} className="option-item">
                <img src={img} alt={alt} />
                <span>{label}</span>
                <span className="arrow">&gt;</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="aq-section">
          <div className="container">
            <h2 className="section-title">A&Q</h2>
            <div className="aq-list">
              {FAQS.map((f, i) => (
                <a
                  key={f.q}
                  href="#"
                  className={openFaqs.includes(i) ? 'aq-item active' : 'aq-item'}
                  onClick={(e) => { e.preventDefault(); toggleFaq(i); }}
                >
                  <span className="aq-question">{f.q}</span>
                  <span className="aq-arrow">&gt;</span>
                  <p className="aq-answer">{f.a}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
