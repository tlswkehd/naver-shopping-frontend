import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Collect = ({ selectedProducts, onCollectComplete }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [collectedProducts, setCollectedProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCollectedProducts();
  }, []);

  const fetchCollectedProducts = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage("로그인이 필요합니다.");
        return;
      }
      const idToken = await user.getIdToken();
      const response = await axios.get('http://1.234.83.86:5000/get_collected_products', {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      setCollectedProducts(response.data.products);
    } catch (error) {
      console.error("수집된 상품 조회 중 오류 발생:", error);
      setMessage("수집된 상품 조회 중 오류가 발생했습니다.");
    }
  };

  const handleCollect = async () => {
    const user = auth.currentUser;
    if (!user) {
      setMessage("로그인이 필요합니다.");
      return;
    }
    if (selectedProducts.length === 0) {
      setMessage("선택된 상품이 없습니다.");
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const idToken = await user.getIdToken();
      const response = await axios.post('hhttp://1.234.83.86:5000/collect', {
        selected_product_ids: selectedProducts.map(product => product.id)
      }, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage(response.data.message);
      onCollectComplete && onCollectComplete();
      fetchCollectedProducts(); // 수집 후 목록 새로고침
      navigate('/collected-products');
    } catch (error) {
      console.error("상품 수집 중 오류 발생:", error.response?.data);
      setMessage(error.response?.data?.error || "상품 수집 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="collect-container">
      <h2>상품 수집</h2>
      <p>{selectedProducts.length}개의 상품이 선택되었습니다.</p>
      <button 
        onClick={handleCollect} 
        disabled={selectedProducts.length === 0 || isLoading}
      >
        {isLoading ? '수집 중...' : '선택된 상품 수집'}
      </button>
      {message && <p className={message.includes('성공') ? 'success-message' : 'error-message'}>{message}</p>}

      <h3>수집된 상품 목록</h3>
      <ul>
        {collectedProducts.map((product, index) => (
          <li key={index}>
            <img src={product.image_url} alt={product.product_title} width="50" />
            {product.product_title} - {product.price}원
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Collect;