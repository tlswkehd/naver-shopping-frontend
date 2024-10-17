// src/components/Search.js

import React, { useState } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Collect from './Collect';

const Search = () => {
  const [keyword, setKeyword] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    const idToken = await user.getIdToken();

    try {
      const response = await axios.post('http://1.234.83.86:5000/search', {
        keyword // 매칭되는 변수: keyword (프론트엔드) / 라우트: POST /search (백엔드)
      }, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      // 검색 결과 데이터 설정
      const formattedProducts = response.data.products.map(product => ({
        id: product.id,
        market_name: product.market_name,
        product_title: product.product_title,
        price: product.price,
        image_url: product.image_url,
        product_url: product.product_url,
        recent_purchases: product.recent_sales || 0
      }));

      setProducts(formattedProducts);
      setSelectedIds([]);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "검색 중 오류가 발생했습니다.");
    }
  };

  const handleCheckboxChange = (e, productId) => {
    setSelectedIds(prev => 
      e.target.checked
        ? [...prev, productId]
        : prev.filter(id => id !== productId)
    );
  };

  const handleCollect = async () => {
    if (selectedIds.length === 0) {
      alert("수집할 상품을 선택해주세요.");
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("로그인이 필요합니다.");
        return;
      }
      const idToken = await user.getIdToken();

      const selectedProducts = products.filter(product => selectedIds.includes(product.id));
      
      const response = await axios.post('http://1.234.83.86:5000/collect', {
        selected_product_ids: selectedIds
      }, {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      alert(response.data.message);
      handleCollectComplete();
    } catch (error) {
      console.error("Collection error:", error.response?.data);
      alert(error.response?.data?.error || "상품 수집 중 오류가 발생했습니다.");
    }
  };

  const handleMarketCollect = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("로그인이 필요합니다.");
        return;
      }
      const idToken = await user.getIdToken();

      // 현재 검색 결과에서 유니크한 마켓 정보 추출
      const uniqueMarkets = [...new Set(products.map(product => product.market_name))];
      const marketData = uniqueMarkets.map(marketName => ({
        mallName: marketName,
        mallPcUrl: products.find(p => p.market_name === marketName)?.product_url || "",
        mallGrade: "",
        isBrandStore: false
      }));

      const response = await axios.post('http://1.234.83.86:5000/collect_market', {
        market_data: marketData // 매칭되는 변수: marketData (프론트엔드) / 라우트: POST /collect_market (백엔드)
      }, {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });

      alert(response.data.message || "마켓 정보가 성공적으로 저장되었습니다.");
      navigate('/view-market-db');
    } catch (error) {
      console.error("Market collection error:", error);
      alert(error.response?.data?.error || "마켓 정보 수집 중 오류가 발생했습니다.");
    }
  };

  const handleCollectComplete = () => {
    setSelectedIds([]);
    // 필요한 경우 추가 작업 수행
  };

  return (
    <div className="search-container">
      <h2>상품 검색</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="검색 키워드"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          required
        />
        <button type="submit">검색</button>
      </form>
      <div className="products">
        {products.length > 0 ? (
          <>
            <table border="1">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>상품명</th>
                  <th>가격</th>
                  <th>이미지</th>
                  <th>링크</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={(e) => handleCheckboxChange(e, product.id)}
                      />
                    </td>
                    <td>{product.product_title}</td>
                    <td>{product.price}</td>
                    <td>
                      <img src={product.image_url} alt={product.product_title} width="50" />
                    </td>
                    <td>
                      <a href={product.product_url} target="_blank" rel="noopener noreferrer">보기</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleCollect} disabled={selectedIds.length === 0}>
              수집 ({selectedIds.length}개 선택됨)
            </button>
            <button onClick={handleMarketCollect}>마켓 수집</button>
            <Collect 
              selectedProducts={products.filter(product => selectedIds.includes(product.id))}
              onCollectComplete={handleCollectComplete}
            />
          </>
        ) : (
          <p>검색 결과가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default Search;