import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DownloadIcon } from './icons.jsx';

function installInstructions() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  let msg = '📱 Install Admin Panel as App:\n\n';
  if (isIOS) {
    msg += 'iOS (Safari):\n1. Tap the Share button (□↑)\n2. Scroll down → "Add to Home Screen"\n3. Tap "Add"';
  } else if (isAndroid) {
    msg += 'Android (Chrome):\n1. Tap the 3-dot menu (⋮)\n2. Select "Add to Home screen" or "Install app"\n3. Tap "Install"';
  } else {
    msg += 'Desktop (Chrome/Edge):\n1. Click the install icon in address bar (⬇)\n2. Or use menu → "Install Admin Panel..."';
  }
  alert(msg);
}

export default function InstallButton() {
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function onPrompt(e) {
      e.preventDefault();
      setDeferred(e);
      setTimeout(function () {
        setDeferred(function (d) {
          if (d) {
            d.prompt();
            d.userChoice.then(function (r) {
              if (r.outcome === 'accepted') console.log('User accepted the install prompt');
            });
          }
          return null;
        });
      }, 3000);
    }
    function onInstalled() {
      setInstalled(true);
      setDeferred(null);
      console.log('PWA installed');
    }
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return function () {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  function onClick() {
    if (deferred) {
      deferred.prompt();
      deferred.userChoice.then(function (r) {
        if (r.outcome === 'accepted') console.log('User accepted the install prompt');
      });
      setDeferred(null);
    } else {
      installInstructions();
    }
  }

  if (installed) return null;

  return (
    <button className="install-btn" id="installBtn" onClick={onClick}>
      <DownloadIcon size={18} />
      Install
    </button>
  );
}

export function AdminHeader({ back, title, TitleIcon, chatLink, children }) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);

  return (
    <div className="admin-header">
      {back && (
        <Link to={back} className="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
      )}

      {children}

      {title && (
        <h1>
          {TitleIcon}
          {title}
        </h1>
      )}

      {chatLink && (
        <Link to="/chat.html" className="header-chat-link">
          <ChatLinkIcon />
        </Link>
      )}

      <InstallButton />
    </div>
  );
}

function ChatLinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
