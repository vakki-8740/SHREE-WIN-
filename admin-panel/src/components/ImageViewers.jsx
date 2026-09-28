import { useEffect } from 'react';
import { DownloadIcon, CloseIcon } from './icons.jsx';

// request.html used classes image-viewer / close-view with a bare <img>.
export function SimpleImageViewer({ src, onClose }) {
  const open = Boolean(src);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={open ? 'image-viewer active' : 'image-viewer'} onClick={onClose}>
      <span className="close-view"><CloseIcon /></span>
      <img src={src || ''} alt="Image" />
    </div>
  );
}

// chatroom.html used image-viewer-overlay with the download toolbar.
export function OverlayImageViewer({ src, fileName = 'payment.png', onClose }) {
  const open = Boolean(src);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    if (open) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div className={open ? 'image-viewer-overlay active' : 'image-viewer-overlay'} onClick={onClose}>
      <span className="image-viewer-close" onClick={(e) => { e.stopPropagation(); onClose(); }}>✕</span>
      <div className="image-viewer-toolbar">
        <span className="image-viewer-info">{open ? fileName : ''}</span>
        <a className="image-viewer-download" href={src || '#'} download={fileName}>
          <DownloadIcon size={20} />
        </a>
      </div>
      <img src={src || ''} alt="Fullscreen image" />
    </div>
  );
}
