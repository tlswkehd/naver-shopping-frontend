import React, { useState } from 'react';
import axios from 'axios';
import { auth } from '../firebase';

const SEOOptimize = () => {
  const [productName, setProductName] = useState('');
  const [optimizedName, setOptimizedName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOptimize = async () => {
    setIsLoading(true);
    setError('');
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("로그인이 필요합니다.");
      }
      const idToken = await user.getIdToken();
      const response = await axios.post('http://1.234.83.86:5000/seo_optimize', {
        uid: user.uid,
        productName
      }, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setOptimizedName(response.data.optimized_name);
    } catch (error) {
      console.error('SEO optimization error:', error);
      setError('SEO 최적화 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="seo-optimize-container">
      <h2>SEO 최적화</h2>
      <input
        type="text"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        placeholder="상품명 입력"
      />
      <button onClick={handleOptimize} disabled={isLoading}>
        {isLoading ? '최적화 중...' : 'SEO 최적화'}
      </button>
      {error && <p className="error-message">{error}</p>}
      {optimizedName && (
        <div className="optimized-result">
          <h3>최적화된 상품명:</h3>
          <p>{optimizedName}</p>
        </div>
      )}
    </div>
  );
};

export default SEOOptimize;