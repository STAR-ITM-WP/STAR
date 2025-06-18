import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/SignupPage.css';

const SignupPage = () => {
  const [form, setForm] = useState({
    name: '',
    studentNumber: '',
    password: '',
    major: '',
  });

  const [departments, setDepartments] = useState([]);

  // 학과 데이터 불러오기
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch('/departments.json');
        const data = await res.json();
        const deptList = data.map(d => d.department);
        setDepartments(deptList);
      } catch (err) {
        console.error('⚠️ 학과 데이터 로딩 실패:', err);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    try {
      await axios.post('https://star-isih.onrender.com/api/users/register', form);
      alert('회원가입 성공!');
      window.location.href = '/login';
    } catch (err) {
      if (!err.response) {
        console.warn('⚠️ 서버 연결 실패. 로컬에 mock 회원 저장.');
        localStorage.setItem('mockUser', JSON.stringify(form));
        alert('⚠️ 서버 미연결 - 로컬 mock 회원가입 완료');
        window.location.href = '/login';
      } else {
        alert(err.response?.data?.message || '회원가입 실패');
      }
    }
  };

  return (
    <div className="signup-page">
      <Header />
      <main className="signup-content">
        <div className="signup-box">
          <h2 className="signup-label">Sign in</h2>

          {/* 이름 */}
          <div className="input-wrapper">
            <label>Name</label>
            <input
              name="name"
              type="text"
              placeholder="Enter your name"
              onChange={handleChange}
            />
          </div>

          {/* 학번 */}
          <div className="input-wrapper">
            <label>Student Number</label>
            <input
              name="studentNumber"
              type="text"
              placeholder="Enter your student number"
              onChange={handleChange}
            />
          </div>

          {/* 비밀번호 */}
          <div className="input-wrapper">
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="Enter password"
              onChange={handleChange}
            />
          </div>

          {/* 전공 선택 */}
          <div className="input-wrapper">
            <label>Major</label>
            <select name="major" value={form.major} onChange={handleChange}>
              <option value="">Select your department</option>
              {departments.map((dept, idx) => (
                <option key={idx} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* 회원가입 버튼 */}
          <div className="signup-button">
            <button onClick={handleSignup}>Sign in</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignupPage;