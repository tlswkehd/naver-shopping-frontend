import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import './CollectedProducts.css';

const CollectedProducts = () => {
  const [products, setProducts] = useState([]);
  const [completedProducts, setCompletedProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCollectedProducts();
    fetchCompletedProducts();
  }, []);

  const fetchCollectedProducts = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        throw new Error("로그인이 필요합니다.");
      }
      const idToken = await user.getIdToken();
      const response = await axios.get('http://1.234.83.86:5000/get_collected_products', {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setProducts(response.data.products);
    } catch (err) {
      console.error("Error fetching collected products:", err);
      setError("수집된 상품을 가져오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedProducts = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("로그인이 필요합니다.");
      const idToken = await user.getIdToken();
      const response = await axios.get('http://1.234.83.86:5000/get_completed_products', {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setCompletedProducts(response.data.products);
    } catch (err) {
      console.error("Error fetching completed products:", err);
      setError("완료된 상품을 가져오는 중 오류가 발생했습니다.");
    }
  };

  const handleHeysellerDownload = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("로그인이 필요합니다.");
      const idToken = await user.getIdToken();
      
      // 배송비 계산
      await axios.post('http://1.234.83.86:5000/calculate_shipping', {}, {
        headers: { 
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      // 헤이셀러 다운로드
      const response = await axios.post('http://1.234.83.86:5000/download_heyseller', {}, {
        headers: { 
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'heyseller.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Heyseller download error:", error);
      setError(error.response?.data?.error || "헤이셀러 다운로드 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(product => product.id));
    }
  };

  const handleTaobaoMatch = async (productIds) => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("로그인이 필요합니다.");
      const idToken = await user.getIdToken();
      
      const matchPromises = productIds.map(productId => {
        const product = products.find(p => p.id === productId);
        return axios.post('http://1.234.83.86:5000/taobao_match', 
          { 
            productId: product.id,
            image_url: product.image_url,
            taobao_url: product.taobao_url || ''
          },
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
      });

      const matchResults = await Promise.all(matchPromises);
      
      setProducts(prevProducts => prevProducts.map(product => {
        const matchResult = matchResults.find(r => r.data.itemId === product.id);
        return matchResult ? { ...product, taobaoMatch: matchResult.data } : product;
      }));

      console.log("Taobao matching completed:", matchResults);
    } catch (error) {
      console.error("Taobao matching error:", error);
      setError(error.response?.data?.error || "타오바오 매칭 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSEOOptimize = async (productId) => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("로그인이 필요합니다.");
      const idToken = await user.getIdToken();
      
      const response = await axios.post('http://1.234.83.86:5000/seo_optimize', 
        { productId },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      
      const optimizedTitle = response.data.optimized_title;
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, seo_product_name: optimizedTitle } 
            : product
        )
      );
      
    } catch (error) {
      console.error("SEO 최적화 오류:", error);
      setError(error.response?.data?.error || "SEO 최적화 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleTaobaoUrlChange = (productId, url) => {
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === productId ? { ...p, taobao_url: url } : p
      )
    );
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">오류: {error}</div>;

  return (
    <div className="container">
      <main className="main-content">
        <div className="user-info">
          <span id="userName">사용자</span>님, 환영합니다!
          (멤버십 레벨: <span id="membershipLevel">Basic</span>)
        </div>

        <section className="section table-section">
          <h2>수집한 상품</h2>
          <div className="action-buttons">
            <button 
              onClick={() => handleTaobaoMatch(selectedProducts)} 
              disabled={selectedProducts.length === 0 || loading}
              className="match-button"
            >
              <i className="fas fa-exchange-alt"></i> 선택한 상품 타오바오 매칭 ({selectedProducts.length}개)
            </button>
            <button 
              onClick={handleHeysellerDownload} 
              disabled={loading || products.length === 0}
              className="download-button"
            >
              헤이셀러 다운로드
            </button>
          </div>
          {loading && <div className="loading">로딩 중...</div>}
          {error && <div className="error">오류: {error}</div>}
          {products.length === 0 ? (
            <p>수집된 상품이 없습니다.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>
                    <input 
                      type="checkbox" 
                      id="selectAll" 
                      onChange={handleSelectAll} 
                      checked={selectedProducts.length === products.length}
                    />
                  </th>
                  <th>메인키워드</th>
                  <th>국내상품명</th>
                  <th>국내상품URL</th>
                  <th>국내상품 이미지</th>
                  <th>국내상품 가격</th>
                  <th>최근판매량</th>
                  <th>카테고리</th>
                  <th>배송비</th>
                  <th>배송비포함가격</th>
                  <th>계산된 배송비</th>
                  <th>SEO 상품명</th>
                  <th>SEO 태그</th>
                  <th>타오바오 URL</th>
                  <th>타오바오 이미지</th>
                  <th>타오바오 상품명</th>
                  <th>타오바오 상품 링크</th>
                  <th>타오바오 가격</th>
                  <th>타오바오 재고</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleProductSelect(product.id)}
                      />
                    </td>
                    <td>{product.main_keyword}</td>
                    <td>{product.product_title}</td>
                    <td>
                      <a href={product.product_url} target="_blank" rel="noopener noreferrer">
                        링크
                      </a>
                    </td>
                    <td>
                      <img src={product.image_url} alt={product.product_title} width="50" />
                    </td>
                    <td>{product.price}</td>
                    <td>{product.purchase_count}</td>
                    <td>{product.category}</td>
                    <td>{product.shipping_fee}</td>
                    <td>{product.price_with_shipping}</td>
                    <td>{product.calculated_shipping_fee}</td>
                    <td>{product.seo_product_name}</td>
                    <td>{product.seo_tags}</td>
                    <td>
                      <input
                        type="text"
                        value={product.taobao_url || ''}
                        onChange={(e) => handleTaobaoUrlChange(product.id, e.target.value)}
                        placeholder="타오바오 URL 입력"
                      />
                    </td>
                    <td>
                      {product.taobaoMatch ? (
                        <img src={product.taobaoMatch.mainImageUrl} alt="Taobao product" width="50" />
                      ) : (
                        "매칭 전"
                      )}
                    </td>
                    <td>
                      {product.taobaoMatch ? product.taobaoMatch.title : "매칭 전"}
                    </td>
                    <td>
                      {product.taobaoMatch ? (
                        <a href={`https://item.taobao.com/item.htm?id=${product.taobaoMatch.itemId}`} target="_blank" rel="noopener noreferrer">
                          링크
                        </a>
                      ) : (
                        "매칭 전"
                      )}
                    </td>
                    <td>
                      {product.taobaoMatch ? product.taobaoMatch.price : "매칭 전"}
                    </td>
                    <td>
                      {product.taobaoMatch ? (product.taobaoMatch.inventory || "정보 없음") : "매칭 전"}
                    </td>
                    <td>
                      <button 
                        onClick={() => handleSEOOptimize(product.id)} 
                        disabled={loading} 
                        className="action-button"
                      >
                        <i className="fas fa-magic"></i> SEO 최적화
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="section completed-section">
          <h3>완료된 상품</h3>
          {completedProducts.length === 0 ? (
            <p>완료된 상품이 없습니다.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>상품명</th>
                  <th>가격</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {completedProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.product_title}</td>
                    <td>{product.price}</td>
                    <td>완료</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
};

export default CollectedProducts;
