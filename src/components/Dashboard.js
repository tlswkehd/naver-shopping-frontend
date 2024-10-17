import React, { useState } from 'react';
import axios from 'axios';

function Dashboard({ user }) {
  const [productName, setProductName] = useState('');
  const [optimizedName, setOptimizedName] = useState('');
  const [taobaoResult, setTaobaoResult] = useState(null);

  const handleSEOOptimize = async () => {
    try {
      const idToken = await user.getIdToken();
      const response = await axios.post('http://1.234.83.86:5000/seo_optimize', {
        uid: user.uid,
        productName
      }, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setOptimizedName(response.data.optimized_name);
      return response.data.product_id;
    } catch (error) {
      console.error('SEO optimization error:', error);
    }
  };

  const handleTaobaoMatch = async (productId) => {
    try {
      const idToken = await user.getIdToken();
      const response = await axios.post('http://1.234.83.86:5000/taobao_match', {
        uid: user.uid,
        product_id: productId,
        product_name: optimizedName
      }, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setTaobaoResult(response.data.taobao_result);
    } catch (error) {
      console.error('Taobao matching error:', error);
    }
  };

  const handleFullProcess = async () => {
    const productId = await handleSEOOptimize();
    if (productId) {
      await handleTaobaoMatch(productId);
    }
  };

  return (
    <div>
      <h1>대시보드</h1>
      <p>환영합니다, {user.displayName}님!</p>
      <input
        type="text"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        placeholder="상품명 입력"
      />
      <button onClick={handleFullProcess}>최적화 및 매칭 시작</button>
      {optimizedName && <p>최적화된 상품명: {optimizedName}</p>}
      {taobaoResult && (
        <div>
          <p>타오바오 매칭 결과:</p>
          <p>URL: {taobaoResult.url}</p>
          <p>가격: {taobaoResult.price}</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;