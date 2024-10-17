// src/components/MainMenu.js

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './MainMenu.css'; // 스타일을 위한 CSS 파일

const MainMenu = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const toggleDropdown = (menu) => {
    if (activeDropdown === menu) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(menu);
    }
  };

  const handleKeyDown = (event, menu) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleDropdown(menu);
    }
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="main-menu" aria-label="주요 내비게이션" ref={dropdownRef}>
      <ul>
        {/* 소싱 드롭다운 메뉴 */}
        <li className="dropdown">
          <button 
            className="dropdown-button" 
            onClick={() => toggleDropdown('sourcing')} 
            onKeyDown={(e) => handleKeyDown(e, 'sourcing')}
            aria-haspopup="true" 
            aria-expanded={activeDropdown === 'sourcing'}
          >
            <i className="fas fa-box"></i> 소싱 <i className="fas fa-chevron-down dropdown-arrow"></i>
          </button>
          <ul className={`dropdown-content ${activeDropdown === 'sourcing' ? 'open' : ''}`} aria-label="소싱 하위 메뉴">
            <li><Link to="/ai-sourcing/ai-sourcing"><i className="fas fa-robot"></i> AI 소싱</Link></li>
            <li><Link to="/ai-sourcing/reverse"><i className="fas fa-undo"></i> REVERSE</Link></li>
            <li><Link to="/ai-sourcing/shipping-agent"><i className="fas fa-truck"></i> 배송대행지</Link></li>
            <li><Link to="/ai-sourcing/customs-number"><i className="fas fa-hashtag"></i> 통관번호</Link></li>
            <li><Link to="/ai-sourcing/exclusion-list"><i className="fas fa-ban"></i> 제외 LIST</Link></li>
          </ul>
        </li>

        {/* 비활성화된 메뉴 항목 */}
        <li className="disabled">
          <a href="#" className="not-available" aria-disabled="true">
            <i className="fas fa-cogs"></i> AI <i className="fas fa-chevron-down dropdown-arrow"></i>
          </a>
          <span className="tooltip">준비중입니다.</span>
        </li>
        <li className="disabled">
          <a href="#" className="not-available" aria-disabled="true">
            <i className="fas fa-chart-line"></i> 마케팅 <i className="fas fa-chevron-down dropdown-arrow"></i>
          </a>
          <span className="tooltip">준비중입니다.</span>
        </li>
        <li className="disabled">
          <a href="#" className="not-available" aria-disabled="true">
            <i className="fas fa-youtube"></i> 유튜브
          </a>
          <span className="tooltip">준비중입니다.</span>
        </li>
        <li className="disabled">
          <a href="#" className="not-available" aria-disabled="true">
            <i className="fas fa-user-tie"></i> 멤버십
          </a>
          <span className="tooltip">준비중입니다.</span>
        </li>
        <li className="disabled">
          <a href="#" className="not-available" aria-disabled="true">
            <i className="fas fa-campground"></i> 레버리지캠프
          </a>
          <span className="tooltip">준비중입니다.</span>
        </li>
      </ul>
    </nav>
  );
};

export default MainMenu;
