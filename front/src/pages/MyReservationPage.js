import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import '../styles/MyReservationPage.css';

// ✅ 이미지 경로 매핑
const getBuildingImage = (number) => {
  try {
    return require(`../assets/buildings img/${number}.png`);
  } catch {
    return require('../assets/buildings img/2.png'); // Default: Dasan Hall
  }
};

const MyReservationPage = () => {
  const [reservations, setReservations] = useState([]);
  const [buildings, setBuildings] = useState([]); // 건물 번호 <-> 이름 매핑용
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState('confirm');
  const [selectedReservation, setSelectedReservation] = useState(null);

  // 🧭 건물 리스트 받아오기
  const fetchBuildings = async () => {
    try {
      const res = await axios.get('https://star-isih.onrender.com/api/buildings');
      setBuildings(res.data.buildings || []);
    } catch (err) {
      console.warn('⚠️ 건물 정보 fetch 실패, fallback mock 사용');
      setBuildings([
        { buildingNo: 32, buildingName: 'Frontier Hall' },
        { buildingNo: 2, buildingName: 'Dasan Hall' }
      ]);
    }
  };

  // 🗓️ 예약 정보 불러오기
  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://star-isih.onrender.com/api/reservations/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReservations(res.data);
    } catch (err) {
      console.warn('⚠️ 예약 정보 fetch 실패, mock 사용');
      setReservations([
        {
          _id: 'mock1',
          building: 'Frontier Hall',
          room: '107',
          date: '2024-06-05',
          startTime: '08:00',
          endTime: '10:50'
        },
        {
          _id: 'mock2',
          building: 'Dasan Hall',
          room: '201',
          date: '2024-06-06',
          startTime: '09:00',
          endTime: '09:50'
        }
      ]);
    }
  };

  useEffect(() => {
    fetchBuildings();
    fetchReservations();
  }, []);

  const getBuildingNo = (name) => {
    const found = buildings.find(b => b.buildingName === name);
    return found?.buildingNo || 2;
  };

  const handleCancel = (reservation) => {
    setSelectedReservation(reservation);
    setModalStep('confirm');
    setShowModal(true);
  };

  const confirmCancel = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://star-isih.onrender.com/api/reservations/${selectedReservation._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReservations(reservations.filter(r => r._id !== selectedReservation._id));
      setModalStep('success');
    } catch (err) {
      console.error('❌ 예약 취소 실패:', err);
      alert('Reservation cancel failed.');
      closeModal();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReservation(null);
    setModalStep('confirm');
  };

  return (
    <div className="my-reservation-page">
      <Header />
      <main className="my-reservation-content">
        <h2>My reservation ({reservations.length})</h2>
        <div className="reservation-list">
          {reservations.map((res) => {
            const buildingNo = getBuildingNo(res.building);
            return (
              <div key={res._id} className="reservation-card">
                <img src={getBuildingImage(buildingNo)} alt={res.building} className="reservation-img" />
                <div className="reservation-info">
                  <div className="reservation-building-number">No.{buildingNo}</div>
                  <div className="reservation-building">{res.building}</div>
                  <div className="reservation-detail">
                    - Room {res.room} ({res.startTime} - {res.endTime}, {res.date})
                  </div>
                </div>
                <button className="cancel-button" onClick={() => handleCancel(res)}>
                  Cancel Reservation →
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {showModal && selectedReservation && (
        <Modal onClose={closeModal} size="medium">
          {modalStep === 'confirm' ? (
            <div>
              <div className="modal-card">
                <div className="modal-title">{selectedReservation.building}</div>
                <div className="modal-sub">Room {selectedReservation.room}</div>
                <div className="modal-sub">
                  - {selectedReservation.startTime} ~ {selectedReservation.endTime}, {selectedReservation.date}
                </div>
              </div>
              <p style={{ marginTop: '24px' }}>Are you sure to cancel your reservation?</p>
              <div className="modal-buttons">
                <button onClick={confirmCancel}>Yes!</button>
                <button onClick={closeModal}>No!</button>
              </div>
            </div>
          ) : (
            <div>
              <p>Reservation canceled successfully!</p>
              <div className="modal-buttons">
                <button onClick={closeModal}>Check Reservation</button>
              </div>
            </div>
          )}
        </Modal>
      )}

      <Footer />
    </div>
  );
};

export default MyReservationPage;