import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Deposite from './pages/Deposite.jsx';
import Withdrawal from './pages/Withdrawal.jsx';
import Contact from './pages/Contact.jsx';
import Chat from './pages/Chat.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/index.html" element={<Home />} />
      <Route path="/contact.html" element={<Contact />} />
      <Route path="/deposite.html" element={<Deposite />} />
      <Route path="/withdrawal.html" element={<Withdrawal />} />
      <Route path="/CHAT PAGE/chat.html" element={<Chat />} />
      <Route path="*" element={<Navigate to="/index.html" replace />} />
    </Routes>
  );
}
