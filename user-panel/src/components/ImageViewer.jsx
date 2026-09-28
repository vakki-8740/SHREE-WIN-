import { useEffect } from 'react';
import { DownloadIcon } from './icons.jsx';

export default function ImageViewer({ src, fileName, onClose }) {
  const open = Boolean(src);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
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
    <div
      className={open ? 'image-viewer-overlay active' : 'image-viewer-overlay'}
      onClick={onClose}
    >
      <span className="image-viewer-close" onClick={(e) => { e.stopPropagation(); onClose(); }}>✕</span>
      <div className="image-viewer-toolbar">
        <span className="image-viewer-info">{open ? fileName || 'Image' : ''}</span>
        <a className="image-viewer-download" href={src || '#'} download={fileName || 'image.png'}>
          <DownloadIcon />
        </a>
      </div>
      <img src={src || ''} alt="Fullscreen image" />
    </div>
  );
}
