import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BuildingCard from '../components/BuildingCard';
import RoomSelectModal from '../components/RoomSelectModal'; // 모달 추가
import profileImg from '../assets/profile.png';
import '../styles/ProfilePage.css';

const getBuildingImage = (id) => {
  try {
    return require(`../assets/buildings img/${id}.png`);
  } catch {
    return require(`../assets/buildings img/2.png`);
  }
};

const MOCK_BUILDINGS = [
  {
    id: '32',
    name: 'Frontier Hall',
    image: getBuildingImage('32'),
    availableRooms: [
      { room: 'Room 107', time: '8:00 - 10:50' },
      { room: 'Room 131', time: '11:00 - 12:50' },
    ],
  },
  {
    id: '2',
    name: 'Dasan Hall',
    image: getBuildingImage('2'),
    availableRooms: [
      { room: 'Room 201', time: '9:00 - 9:50' },
      { room: 'Room 105', time: '10:00 - 10:50' },
    ],
  },
];

// ✅ mock 유저 미리 설정
const MOCK_USER = {
  name: '홍길동',
  studentNumber: '202312345',
  major: '컴퓨터공학과',
  favorites: ['Frontier Hall', 'Dasan Hall'],
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [favoriteBuildings, setFavoriteBuildings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token');

        const res = await axios.get('https://star-isih.onrender.com/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const userData = res.data.user;
        setUser(userData);

        // 서버에서 전체 건물 목록 받아오기
        const buildingsRes = await axios.get('hhttps://star-isih.onrender.com/api/buildings');
        const buildingData = buildingsRes.data.buildings;

        // building.name과 userData.favorites를 비교해 매칭
        const matched = await Promise.all(
          buildingData
            .filter(b => userData.favorites.includes(b.buildingName))
            .map(async (b) => {
              const roomRes = await axios.get(`https://star-isih.onrender.com/api/buildings/rooms?buildingNo=${b.buildingNo}`);
              const availableRooms = roomRes.data.rooms || [];
        
              return {
                id: String(b.buildingNo),
                name: b.buildingName,
                image: getBuildingImage(b.buildingNo),
                availableRooms: availableRooms.map(room => ({
                  room: `Room ${room}`,
                  time: '8:00 - 17:50',
                }))
              };
            })
        );
        setFavoriteBuildings(matched);
      } catch (err) {
        console.warn('⚠️ 서버 연결 실패, mock 유저 사용');
        localStorage.setItem('user', JSON.stringify(MOCK_USER));
        setUser(MOCK_USER);

        const matched = MOCK_BUILDINGS.filter(b =>
          MOCK_USER.favorites.includes(b.name)
        );
        setFavoriteBuildings(matched);
      }
    };

    fetchProfile();
  }, []);

  const openRoomModal = (building) => {
    setSelectedBuilding(building);
    setShowModal(true);
  };

  const handleRoomSelect = (room) => {
    setShowModal(false);
    const roomNumber = room.room.match(/\d+/)?.[0];
    navigate(`/reserve/${selectedBuilding.name}/${roomNumber}`);
  };

  const toggleFavorite = async (buildingName) => {
    try {
      const token = localStorage.getItem('token');
      const isAlreadyFavorite = user?.favorites.includes(buildingName);
      let updatedFavorites;

      if (token) {
        if (isAlreadyFavorite) {
          await axios.delete('https://star-isih.onrender.com/api/users/favorites', {
            headers: { Authorization: `Bearer ${token}` },
            data: { building: buildingName },
          });
          updatedFavorites = user.favorites.filter((n) => n !== buildingName);
        } else {
          await axios.post('https://star-isih.onrender.com/api/users/favorites', { building: buildingName }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          updatedFavorites = [...user.favorites, buildingName];
        }
      } else {
        // mock fallback
        updatedFavorites = isAlreadyFavorite
          ? user.favorites.filter((n) => n !== buildingName)
          : [...user.favorites, buildingName];
      }

      const updatedUser = { ...user, favorites: updatedFavorites };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      const matched = MOCK_BUILDINGS.filter(b =>
        updatedFavorites.includes(b.name)
      );
      setFavoriteBuildings(matched);
    } catch (err) {
      alert('Unable to update your favorites. Please try again.');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-page">
      <Header />
      <main className="profile-content">
        <h2>My Information</h2>
        <div className="profile-box">
          <img src={profileImg} alt="profile" />
          <div className="profile-info">
            <div><strong>{user.name}</strong></div>
            <div>{user.studentNumber}</div>
            <div>{user.major}</div>
          </div>
        </div>

        <h2>My Favorite Classrooms</h2>
        <div className="building-list">
          {favoriteBuildings.length > 0 ? (
            favoriteBuildings.map((building) => (
              <BuildingCard
                key={building.id}
                building={building}
                isFavorite={user.favorites.includes(building.name)}
                onReserveClick={openRoomModal}
                onToggleFavorite={toggleFavorite}
              />
            ))
          ) : (
            <p>You have no favorite classrooms yet.</p>
          )}
        </div>
      </main>

      <RoomSelectModal
        building={selectedBuilding}
        onClose={() => setSelectedBuilding(null)}
        onSelectRoom={handleRoomSelect}
      />

      <Footer />
    </div>
  );
};

export default ProfilePage;