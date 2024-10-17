import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const ScrapeMarket = ({ onCollectProducts }) => {
  const [markets, setMarkets] = useState([]);
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const [option, setOption] = useState('3일이내구매건수');
  const [message, setMessage] = useState('');
  const [scrapingResults, setScrapingResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMarketDB();
  }, []);

  const fetchMarketDB = async () => {
    const user = auth.currentUser;
    if (!user) {
      setMessage("로그인이 필요합니다.");
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
      setMessage(error.response?.data?.error || "마켓 DB 조회 중 오류가 발생했습니다.");
    }
  };

  const handleMarketSelect = (marketUrl) => {
    setSelectedMarkets(prev => 
      prev.includes(marketUrl) 
        ? prev.filter(url => url !== marketUrl)
        : [...prev, marketUrl]
    );
  };

  const handleScrape = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setScrapingResults([]);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("로그인이 필요합니다.");
      }
      const idToken = await user.getIdToken();

      const response = await axios.post('http://1.234.83.86:5000/scrape_market', {
        urls: selectedMarkets,
        option
      }, {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });

      const formattedResults = response.data.products.map(product => ({
        id: product.id,
        market_name: product.market_name,
        product_title: product.product_title,
        price: product.price,
        image_url: product.image_url,
        product_url: product.product_url,
        recent_purchases: product.recent_purchases || 0
      }));

      setScrapingResults(formattedResults);
    } catch (error) {
      console.error("스크래핑 오류:", error);
      setMessage(error.response?.data?.error || "마켓 스크래핑 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleCollectProducts = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage("로그인이 필요합니다.");
        return;
      }
      const idToken = await user.getIdToken();

      const response = await axios.post('http://1.234.83.86:5000/collect', {
        selected_product_ids: selectedProducts
      }, {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      setMessage(response.data.message);
      
      const collectedProducts = scrapingResults.filter(product => selectedProducts.includes(product.id));
      onCollectProducts(collectedProducts);
      
      navigate('/collected-products');
      
      setSelectedProducts([]);
    } catch (error) {
      console.error("Collection error:", error.response?.data);
      setMessage(error.response?.data?.error || "상품 수집 중 오류가 발생했습니다.");
    }
  };

  const handleCollectMarket = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage("로그인이 필요합니다.");
        return;
      }
      const idToken = await user.getIdToken();

      const selectedMarketData = markets.filter(market => selectedMarkets.includes(market.mallPcUrl));

      const response = await axios.post('http://1.234.83.86:5000/collect_market', {
        market_data: selectedMarketData
      }, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      setMessage(response.data.message);
    } catch (error) {
      console.error("마켓 수집 오류:", error.response?.data);
      setMessage(error.response?.data?.error || "마켓 수집 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="scrape-market-container">
      <h2>마켓 스크래핑</h2>
      <div className="market-list">
        <h3>내 마켓 DB 현황</h3>
        {markets.length > 0 ? (
          <table border="1">
            <thead>
              <tr>
                <th>선택</th>
                <th>마켓명</th>
                <th>마켓등급</th>
                <th>브랜드스토어 여부</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((market, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedMarkets.includes(market.mallPcUrl)}
                      onChange={() => handleMarketSelect(market.mallPcUrl)}
                    />
                  </td>
                  <td>{market.mallName}</td>
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
      <button onClick={handleCollectMarket} disabled={selectedMarkets.length === 0}>
        선택한 마켓 정보 수집 ({selectedMarkets.length}개 선택됨)
      </button>
      <form onSubmit={handleScrape}>
        <label>
          옵션:
          <select value={option} onChange={(e) => setOption(e.target.value)}>
            <option value="3일이내구매건수">3일이내구매건수</option>
            <option value="전체구매건수">전체구매건수</option>
          </select>
        </label><br/>
        <button type="submit" disabled={selectedMarkets.length === 0 || isLoading}>
          {isLoading ? '스크래핑 중...' : `선택한 마켓 스크래핑 시작 (${selectedMarkets.length}개 선택됨)`}
        </button>
      </form>
      {message && <p>{message}</p>}
      
      {scrapingResults.length > 0 && (
        <div className="scraping-results">
          <h3>스크래핑 결과</h3>
          <table border="1">
            <thead>
              <tr>
                <th>선택</th>
                <th>마켓명</th>
                <th>상품명</th>
                <th>가격</th>
                <th>3일 이내 구매건수</th>
                <th>이미지</th>
                <th>링크</th>
              </tr>
            </thead>
            <tbody>
              {scrapingResults.map((result) => (
                <tr key={result.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(result.id)}
                      onChange={() => handleProductSelect(result.id)}
                    />
                  </td>
                  <td>{result.market_name}</td>
                  <td>{result.product_title}</td>
                  <td>{result.price}</td>
                  <td>{result.recent_purchases}</td>
                  <td><img src={result.image_url} alt={result.product_title} width="50" /></td>
                  <td><a href={result.product_url} target="_blank" rel="noopener noreferrer">보기</a></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleCollectProducts} disabled={selectedProducts.length === 0}>
            선택한 상품 수집 ({selectedProducts.length}개 선택됨)
          </button>
        </div>
      )}
    </div>
  );
};

export default ScrapeMarket;