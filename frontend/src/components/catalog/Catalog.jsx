import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const Catalog = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minAge: '',
    maxAge: '',
    search: '',
    sort: ''
  });

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProducts = async (f = filters) => {
    try {
      const params = new URLSearchParams();
      if (f.minPrice) params.append('minPrice', f.minPrice);
      if (f.maxPrice) params.append('maxPrice', f.maxPrice);
      if (f.minAge) params.append('minAge', f.minAge);
      if (f.maxAge) params.append('maxAge', f.maxAge);
      if (f.search) params.append('search', f.search);
      if (f.sort) params.append('sort', f.sort);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const data = await api.get(`/products${qs}`);
      setProducts(data);
      setMessage('');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleFilterChange = (e) => {
    const next = { ...filters, [e.target.name]: e.target.value };
    setFilters(next);
  };

  const applyFilters = () => {
    loadProducts(filters);
  };

  const addToCart = async (id) => {
    try {
      await api.post('/cart', { productId: id, quantity: 1 });
      setMessage('Товар добавлен в корзину');
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h2>Каталог</h2>
      <div className="card">
        <div className="row">
          <div className="field">
            <label>Цена от</label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
            />
          </div>
          <div className="field">
            <label>до</label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </div>
          <div className="field">
            <label>Возраст от</label>
            <input
              type="number"
              name="minAge"
              value={filters.minAge}
              onChange={handleFilterChange}
            />
          </div>
          <div className="field">
            <label>до</label>
            <input
              type="number"
              name="maxAge"
              value={filters.maxAge}
              onChange={handleFilterChange}
            />
          </div>
          <div className="field">
            <label>Поиск</label>
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Название набора"
            />
          </div>
          <div className="field">
            <label>Сортировка</label>
            <select name="sort" value={filters.sort} onChange={handleFilterChange}>
              <option value="">Нет</option>
              <option value="priceAsc">Цена ↑</option>
              <option value="priceDesc">Цена ↓</option>
              <option value="ageAsc">Возраст ↑</option>
              <option value="ageDesc">Возраст ↓</option>
              <option value="popular">Популярность</option>
            </select>
          </div>
        </div>
        <button onClick={applyFilters}>Применить</button>
      </div>
      {message && <p>{message}</p>}
      {products.map((p) => (
        <div key={p.id} className="card row" style={{ justifyContent: 'space-between' }}>
          <div>
            <b>{p.name}</b>
            <div>
              Цена: {p.discount_percent ? (
                <>
                  <span style={{ textDecoration: 'line-through', opacity: 0.6, marginRight: 8 }}>{p.price}</span>
                  <span>{(Number(p.price) * (1 - Number(p.discount_percent) / 100)).toFixed(2)}</span>
                  <span style={{ marginLeft: 8, color: '#dc2626' }}>-{p.discount_percent}%</span>
                </>
              ) : (
                p.price
              )}
            </div>
            <div>Возраст: {p.age_limit}+</div>
            {p.avg_rating !== undefined && <div>Рейтинг: {p.avg_rating}</div>}
          </div>
          {user?.role === 'client' && <button onClick={() => addToCart(p.id)}>В корзину</button>}
        </div>
      ))}
    </div>
  );
};

export default Catalog;

