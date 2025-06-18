import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/LoginPage.css';
import signpassward from '../assets/signpass.png';
import signstudentnumber from '../assets/signprofile.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ studentNumber: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post('https://star-isih.onrender.com/api/users/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/'); // ✅ 메인 페이지로 이동
    } catch (err) {
      console.warn('⚠️ 백엔드 로그인 실패 - mock 처리로 우회');

      const mockUser = {
        name: '테스트유저',
        studentNumber: form.studentNumber || '23100000',
        major: 'ITM',
        favorites: ['프론티어관', '다산관'],
      };

      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      alert('⚠️ 서버 미연결 상태 - mock 로그인 처리됨');
      navigate('/');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // ⛔ 새로고침 방지
    handleLogin();      // ✅ 로그인 실행
  };

  return (
    <div className="login-page">
      <Header />
      <main className="login-content">
        <div className="login-title-wrapper">
          <h1 className="login-title">
            <span className="r">S</span>eoul{' '}
            <span className="b">T</span>ech{' '}
            <span className="g">A</span>vailable{' '}
            <span className="g">R</span>oom
          </h1>
        </div>

        {/* ✅ form으로 감싸고 onSubmit 적용 */}
        <form className="login-box" onSubmit={handleSubmit}>
          <h2 className="login-label">Log in</h2>

          <div className="login-input-wrapper">
            <img src={signstudentnumber} alt="student number" className="input-icon" />
            <input
              name="studentNumber"
              type="text"
              placeholder="Student Number"
              onChange={handleChange}
              value={form.studentNumber}
              required
            />
          </div>

          <div className="login-input-wrapper">
            <img src={signpassward} alt="password" className="input-icon" />
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              value={form.password}
              required
            />
          </div>

          <div className="login-buttons">
            <button type="submit">Log in</button> {/* ✅ 기본 로그인 버튼 */}
            <button type="button" onClick={() => navigate('/signup')}>Sign in</button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;