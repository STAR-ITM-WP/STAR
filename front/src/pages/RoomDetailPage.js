import React, { useEffect, useState } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import PurposeModal from '../components/PurposeModal';
import '../styles/RoomDetailPage.css';

const periods = [
  'Period 0 (8:00 - 8:50)', 'Period 1 (9:00 - 9:50)', 'Period 2 (10:00 - 10:50)', 'Period 3 (11:00 - 11:50)',
  'Period 4 (12:00 - 12:50)', 'Period 5 (13:00 - 13:50)', 'Period 6 (14:00 - 14:50)', 'Period 7 (15:00 - 15:50)',
  'Period 8 (16:00 - 16:50)', 'Period 9 (17:00 - 17:50)'
];
const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const dayKor = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const startTimes = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

const numberToRange = {
  10: '1–10',
  30: '11–30',
  50: '31–50',
  100: '51+',
};

const RoomDetailPage = () => {
  const { building, roomId } = useParams();
  const navigate = useNavigate();

  const [startOfWeek, setStartOfWeek] = useState(getStartOfWeek(new Date()));
  const [grid, setGrid] = useState(Array.from({ length: periods.length }, () =>
    Array.from({ length: dayLabels.length }, () => ({ status: 'available' }))
  ));
  const [selected, setSelected] = useState([]);
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [purposeInfo, setPurposeInfo] = useState(null);

  const room = roomId;

  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  const formatDate = (date) => date.toISOString().split('T')[0];

  const moveWeek = (offset) => {
    const next = new Date(startOfWeek);
    next.setDate(next.getDate() + offset * 7);
    setStartOfWeek(next);
    setSelected([]);
  };

  const getWeekDates = () => [...Array(5)].map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return `${dayKor[i]} (${d.getMonth() + 1}/${d.getDate()})`;
  });

  const getDateByCol = (col) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + col);
    return formatDate(d);
  };

  const handleClick = (row, col) => {
    const key = `${row}-${col}`;
    if (grid[row][col].status === 'unavailable') return;
    if (selected.includes(key)) {
      setSelected(selected.filter(k => k !== key));
    } else {
      const isAdjacent = selected.length === 0 || selected.some(k => {
        const [r, c] = k.split('-').map(Number);
        return (r === row - 1 && c === col) || (r === row + 1 && c === col);
      });
      if (!isAdjacent) return alert('Select contiguous time slots only.');
      setSelected([...selected, key]);
    }
  };

  const fetchAvailability = async () => {
    try {
      const res = await axios.get('https://star-isih.onrender.com/api/timetable/availability', {
        params: { building, room, week: formatDate(startOfWeek) }
      });
      applyGridFromAvailability(res.data.availability);
    } catch {
      console.warn('⚠️ API failed');
    }
  };

  const applyGridFromAvailability = (data) => {
    const newGrid = Array.from({ length: periods.length }, (_, r) =>
      Array.from({ length: dayLabels.length }, (_, c) => {
        const slot = data[dayLabels[c]]?.[`Period ${r}`];
        if (typeof slot === 'object' && slot.status === 'unavailable') {
          return { status: 'unavailable', subject: slot.subject || null };
        } else if (slot === 'unavailable') {
          return { status: 'unavailable' };
        } else {
          return { status: 'available' };
        }
      })
    );
    setGrid(newGrid);
  };

  useEffect(() => { fetchAvailability(); }, [startOfWeek]);

  const renderCell = (r, c) => {
    const key = `${r}-${c}`;
    const cell = grid[r][c];
    const isSelected = selected.includes(key);
    const isUnavailable = cell.status === 'unavailable';
    const today = new Date();
    const cellDate = new Date(startOfWeek);
    cellDate.setDate(cellDate.getDate() + c);
    const isPast = cellDate < new Date(today.toDateString()) || 
      (cellDate.toDateString() === today.toDateString() && r < today.getHours() - 8);

    let content = '';
    if (isUnavailable) {
      content = cell.subject ? `📘 ${cell.subject}` : 'Reserved';
    } else if (isSelected) {
      content = 'Selected ✓';
    }

    return (
      <div
        key={c}
        className={`cell ${isPast ? 'unavailable' : isUnavailable ? 'unavailable' : isSelected ? 'selected' : 'available'}`}
        onClick={() => !isUnavailable && !isPast && handleClick(r, c)}
      >
        {content}
      </div>
    );
  };

  const handleReservation = async () => {
    if (!purposeInfo || selected.length === 0) return alert('Missing information.');
    const [r, c] = selected[0].split('-').map(Number);
    const date = getDateByCol(c);
    const startTime = startTimes[r];
    const endTime = startTimes[r + selected.length] || '18:00';

    try {
      await axios.post(
        'https://star-isih.onrender.com/api/reservations',
        {
          building,
          room,
          date,
          startTime,
          endTime,
          purpose: purposeInfo.purpose,
          peopleCount: parseInt(purposeInfo.peopleCount),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setShowConfirm(false);
      setShowSuccess(true);
    } catch (err) {
      setShowConfirm(false);
      alert(err.response?.status === 409
        ? 'Some of the selected periods have already been reserved'
        : 'Reservation failed. Try again.');
    }
  };

  return (
    <div className="room-detail-page">
      <Header />
      <main className="room-detail-content">
        <div className="calendar-header">
          <button onClick={() => moveWeek(-1)}>&larr;</button>
          <h2>{building} - Room {room} - Week of {formatDate(startOfWeek)}</h2>
          <button onClick={() => moveWeek(1)}>&rarr;</button>
        </div>

        <div className="legend">
          <span className="dot gray" /> Unavailable
          <span className="dot green" /> Available
          <span className="dot dark-green" /> Selected
        </div>

        <div className="calendar-wrapper">
          <div className="grid">
            <div className="grid-header">
              <div className="cell time-label"></div>
              {getWeekDates().map((d, i) => <div className="cell header" key={i}>{d}</div>)}
            </div>
            {periods.map((label, r) => (
              <div className="grid-row" key={r}>
                <div className="cell time-label">{label}</div>
                {dayLabels.map((_, c) => renderCell(r, c))}
              </div>
            ))}
          </div>
        </div>

        <div className="calendar-actions">
          <button
            className="reserve-btn"
            onClick={() => {
              if (selected.length === 0) {
                alert('Please select at least one time before making a reservation.');
                return;
              }
              setShowPurposeModal(true);
            }}
          >
            Make a Reservation →
          </button>
        </div>


        {showPurposeModal && (
          <PurposeModal
            onClose={() => setShowPurposeModal(false)}
            onSubmit={(info) => {
              setPurposeInfo(info);
              setShowPurposeModal(false);
              setShowConfirm(true);
            }}
          />
        )}

        {showConfirm && (
          <Modal onClose={() => setShowConfirm(false)} size="medium">
            <h3>{building}</h3>
            <p>Room {room}</p>
            {(() => {
              const [firstRow, firstCol] = selected[0].split('-').map(Number);
              const lastRow = firstRow + selected.length - 1;
              const day = dayKor[firstCol];
              const timeRange = `${startTimes[firstRow]} - ${startTimes[lastRow + 1] || '18:00'}`;
              return (
                <>
                  <p>- {day} / Period {firstRow} - {lastRow} ({timeRange})</p>
                  <hr />
                  <p>
                    Number of People: <strong>{purposeInfo?.peopleCount || '-'}</strong><br />
                    Purpose: <strong>{purposeInfo?.purpose || '-'}</strong>
                  </p>
                </>
              );
            })()}
            <p>Are you sure to confirm your reservation?</p>
            <div className="modal-buttons">
              <button onClick={handleReservation}>Yes!</button>
              <button onClick={() => setShowConfirm(false)}>No!</button>
            </div>
          </Modal>
        )}

        {showSuccess && (
          <Modal
            onClose={() => {
              setShowSuccess(false);
              fetchAvailability();
              setSelected([]);
            }}
            size="medium"
          >
            <h3>Reservation completed successfully!</h3>
            <button onClick={() => navigate('/my-reservation')}>Check Reservation</button>
          </Modal>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RoomDetailPage;