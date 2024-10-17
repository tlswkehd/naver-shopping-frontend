// src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Search from './components/Search';
import ScrapeMarket from './components/ScrapeMarket';
import ViewMarketDB from './components/ViewMarketDB';
import UserInfo from './components/UserInfo';
import CollectedProducts from './components/CollectedProducts';
import { auth } from './firebase';
import './App.css';
import MainMenu from './components/MainMenu'; // MainMenu 컴포넌트 추가

const App = () => {
  const [user, setUser] = useState(null);
  const [collectedProducts, setCollectedProducts] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleCollectProducts = (products) => {
    setCollectedProducts(products);
  };

  return (
    <Router>
      <div className="app-container">
        {/* 상단 헤더 */}
        <header className="top-bar">
          <div className="header-left">
            {/* 로고 또는 빈 공간 */}
          </div>
          <div className="header-center">
            <MainMenu /> {/* MainMenu 컴포넌트 중앙 배치 */}
          </div>
          <div className="header-right">
            {user && (
              <div className="user-actions">
                <span id="remainingCredits">남은 컨설팅 횟수: 5</span>
                <a href="#" className="guide">가이드</a>
                <a href="#" className="icon" aria-label="설정"><i className="fas fa-cog"></i></a>
                <a href="#" className="icon" aria-label="알림"><i className="fas fa-bell"></i></a>
                <a href="#" className="icon" aria-label="사용자"><i className="fas fa-user"></i></a>
                <span className="user-email">{user.email}</span>
                <button onClick={() => auth.signOut()} className="logout-button">로그아웃</button>
              </div>
            )}
          </div>
        </header>

        {/* 인증 상태에 따른 렌더링 */}
        {!user ? (
          <Auth />
        ) : (
          <div className="main-content">
            <nav className="side-nav">
              <ul>
                <li>
                  <a href="/search" className="nav-link">
                    <i className="fas fa-search"></i>
                    <span>상품 검색</span>
                  </a>
                </li>
                <li>
                  <a href="/scrape-market" className="nav-link">
                    <i className="fas fa-spider"></i>
                    <span>매장 스크래핑</span>
                  </a>
                </li>
                <li>
                  <a href="/view-market-db" className="nav-link">
                    <i className="fas fa-database"></i>
                    <span>매장 DB 조회</span>
                  </a>
                </li>
                <li>
                  <a href="/user-info" className="nav-link">
                    <i className="fas fa-user"></i>
                    <span>사용자 정보</span>
                  </a>
                </li>
                <li>
                  <a href="/collected-products" className="nav-link">
                    <i className="fas fa-shopping-basket"></i>
                    <span>수집한 상품</span>
                  </a>
                </li>
              </ul>
            </nav>
            <div className="content-area">
              <Routes>
                <Route path="/" element={<Navigate to="/search" />} />
                <Route
                  path="/search"
                  element={<Search onCollectProducts={handleCollectProducts} />}
                />
                <Route 
                  path="/scrape-market" 
                  element={<ScrapeMarket onCollectProducts={handleCollectProducts} />} 
                />
                <Route path="/view-market-db" element={<ViewMarketDB />} />
                <Route path="/user-info" element={<UserInfo />} />
                <Route 
                  path="/collected-products" 
                  element={<CollectedProducts products={collectedProducts} setProducts={setCollectedProducts} />} 
                />
              </Routes>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;
