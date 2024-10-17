import React, { useState } from 'react';
import axios from 'axios';
import { auth } from '../firebase';

const TaobaoMatch = () => {
  const [productName, setProductName] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMatch = async () => {
    setIsLoading(true);
    setError('');
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("로그인이 필요합니다.");
      }
      const idToken = await user.getIdToken();
      const response = await axios.post('http://1.234.83.86:5000/taobao_match', {
        uid: user.uid,
        product_name: productName
      }, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setMatchResult(response.data.taobao_result);
    } catch (error) {
      console.error('Taobao matching error:', error);
      setError('타오바오 매칭 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="taobao-match-container">
      <h2>타오바오 매칭</h2>
      <input
        type="text"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        placeholder="상품명 입력"
      />
      <button onClick={handleMatch} disabled={isLoading}>
        {isLoading ? '매칭 중...' : '타오바오 매칭'}
      </button>
      {error && <p className="error-message">{error}</p>}
      {matchResult && (
        <div className="match-result">
          <h3>매칭 결과:</h3>
          <p>URL: {matchResult.url}</p>
          <p>가격: {matchResult.price}</p>
        </div>
      )}
    </div>
  );
};

export default TaobaoMatch;