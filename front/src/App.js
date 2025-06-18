import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ReservePage from './pages/ReservePage';
import RoomDetailPage from './pages/RoomDetailPage';
import MyReservationPage from './pages/MyReservationPage';
import ProfilePage from './pages/ProfilePage';
import HotspotPage from './pages/HotspotPage'; // ⭐ 추가

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reserve" element={<ReservePage />} />
        <Route path="/reserve/:building/:roomId" element={<RoomDetailPage />} />
        <Route path="/my-reservation" element={<MyReservationPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/hotspot" element={<HotspotPage />} /> {/* 핫스팟 라우트 추가 */}
      </Routes>
    </Router>
  );
};

export default App;

