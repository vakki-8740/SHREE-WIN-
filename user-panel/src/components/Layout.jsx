import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import {
  HomeIcon, MailIcon, ChatIcon, RupeeIcon, TrendIcon, ArrowIcon
} from './icons.jsx';

export const ROOT_NAV = [
  { to: '/index.html', label: 'HOME', Icon: HomeIcon },
  { to: '/contact.html', label: 'MAIL BOX', Icon: MailIcon },
  { to: '/CHAT PAGE/chat.html', label: 'CHAT', Icon: ChatIcon }
];

export const CHAT_NAV = [
  { to: '/index.html', label: 'HOME', Icon: HomeIcon },
  { to: '/contact.html', label: 'MAIL BOX', Icon: MailIcon },
  { to: '/deposite.html', label: 'DEPOSITE', Icon: RupeeIcon },
  { to: '/withdrawal.html', label: 'WITHDRAWAL', Icon: TrendIcon }
];

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

export default function Layout({ title, nav = ROOT_NAV, footerLogo = false, children }) {
  const [open, setOpen] = useState(false);

  usePageTitle(title);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <>
      <div className="preloader" id="preloader">
        <img src={logo} alt="Logo" />
      </div>

      <div className={open ? 'menu-overlay active' : 'menu-overlay'} id="menuOverlay" onClick={() => setOpen(false)}>
        <div className={open ? 'sidebar active' : 'sidebar'} id="sidebar" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={() => setOpen(false)}>✕</button>
          <div className="sidebar-logo">
            <img src={logo} alt="Logo" />
          </div>
          {nav.map(({ to, label, Icon }) => (
            <Link key={to} to={to} className="sidebar-item" onClick={() => setOpen(false)}>
              <Icon className="sidebar-icon" />
              <span>{label}</span>
              <ArrowIcon className="arrow-icon" />
            </Link>
          ))}
        </div>
      </div>

      <nav className="navbar">
        <div className="container">
          <button className="menu-btn" id="menuBtn" onClick={() => setOpen(true)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="logo">
            <Link to="/index.html">
              <img src={logo} alt="Logo" />
            </Link>
          </div>
        </div>
      </nav>

      {children}

      <footer>
        <div className="container">
          <p>&copy; 2026 SHREE WIN GAME. All Rights Reserved.</p>
          {footerLogo && (
            <div className="footer-logo">
              <img src={logo} alt="Logo" />
            </div>
          )}
        </div>
      </footer>
    </>
  );
}
