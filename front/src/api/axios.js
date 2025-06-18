import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://star-isih.onrender.com', // 변경 시 여기만 수정
  withCredentials: true
});

export default instance;