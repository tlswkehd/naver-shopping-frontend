// src/components/ViewMarketDB.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase';

// 마켓 DB 조회 컴포넌트
const ViewMarketDB = () => {
  const [markets, setMarkets] = useState([]);

  const fetchMarketDB = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    const idToken = await user.getIdToken();

    try {
      const response = await axios.get('http://1.234.83.86:5000/get_market_db', {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      setMarkets(response.data.markets);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "마켓 DB 조회 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    fetchMarketDB();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="view-market-db-container">
      <h2>마켓 DB 조회</h2>
      <button onClick={fetchMarketDB}>새로 고침</button>
      <div className="markets">
        {markets.length > 0 ? (
          <table border="1">
            <thead>
              <tr>
                <th>마켓명</th>
                <th>마켓링크</th>
                <th>마켓등급</th>
                <th>브랜드스토어 여부</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((market, index) => (
                <tr key={index}>
                  <td>{market.mallName}</td>
                  <td>
                    <a href={market.mallPcUrl} target="_blank" rel="noopener noreferrer">
                      방문
                    </a>
                  </td>
                  <td>{market.mallGrade}</td>
                  <td>{market.isBrandStore ? "브랜드" : "일반"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>마켓 DB가 비어있습니다.</p>
        )}
      </div>
    </div>
  );
};

export default ViewMarketDB;

