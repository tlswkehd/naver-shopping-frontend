// src/components/UserInfo.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase';

const UserInfo = () => {
  const [userInfo, setUserInfo] = useState(null);

  const fetchUserInfo = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    const idToken = await user.getIdToken();

    try {
      const response = await axios.get('http://1.234.83.86:5000/user-info', {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      setUserInfo(response.data.user);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "사용자 정보 조회 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    fetchUserInfo();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="user-info-container">
      <h2>사용자 정보</h2>
      {userInfo ? (
        <div>
          <p><strong>이름:</strong> {userInfo.name}</p>
          <p><strong>회원 등급:</strong> {userInfo.membershipLevel}</p>
          <p><strong>남은 크레딧:</strong> {userInfo.remainingCredits}</p>
        </div>
      ) : (
        <p>사용자 정보를 불러오는 중입니다...</p>
      )}
    </div>
  );
};

export default UserInfo;
