import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Request from './pages/Request.jsx';
import ChatList from './pages/ChatList.jsx';
import ChatRoom from './pages/ChatRoom.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/index.html" element={<Home />} />
      <Route path="/request.html" element={<Request />} />
      <Route path="/chat.html" element={<ChatList />} />
      <Route path="/chatroom.html" element={<ChatRoom />} />
      <Route path="*" element={<Navigate to="/index.html" replace />} />
    </Routes>
  );
}
