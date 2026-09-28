import { useState } from 'react';
import userImg from '../assets/user.png';
import { UserSvg } from './icons.jsx';

// Mirrors the old onerror behaviour: show the avatar, and if it fails to load
// drop the <img> and show the inline person SVG instead.
export default function UserIcon({ className = 'user-icon' }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={className}>
      {!failed && <img src={userImg} alt="User" onError={() => setFailed(true)} />}
      {failed && <UserSvg />}
    </div>
  );
}
