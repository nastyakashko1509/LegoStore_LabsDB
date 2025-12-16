import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const Reviews = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [form, setForm] = useState({ productId: '', comment: '', rating: 5 });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'client') return;
    load();
  }, [user]);

  const load = async () => {
    try {
      const [prods, reviews] = await Promise.all([
        api.get('/products'),
        api.get('/reviews/me')
      ]);
      setProducts(prods);
      setMyReviews(reviews);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setMessage('');
      await api.post('/reviews', {
        productId: form.productId,
        comment: form.comment,
        rating: Number(form.rating)
      });
      setForm({ productId: '', comment: '', rating: 5 });
      await load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (!user) return <p>Требуется вход</p>;
  if (user.role !== 'client') return <p>Отзывы может оставлять только покупатель</p>;

  return (
    <div>
      <h2>Мои отзывы</h2>
      <div className="card">
        <form onSubmit={submit}>
          <div className="field">
            <label>Товар</label>
            <select name="productId" value={form.productId} onChange={handleChange} required>
              <option value="">Выберите товар</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Оценка (1-5)</label>
            <input
              type="number"
              name="rating"
              min="1"
              max="5"
              value={form.rating}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>Комментарий</label>
            <textarea
              name="comment"
              value={form.comment}
              onChange={handleChange}
              rows={3}
            />
          </div>
          {message && <p style={{ color: 'red' }}>{message}</p>}
          <button type="submit">Сохранить отзыв</button>
        </form>
      </div>

      {myReviews.map((r) => (
        <div key={r.id} className="card">
          <b>{r.product_name}</b>
          <div>Оценка: {r.rating}</div>
          <div>{r.comment}</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {new Date(r.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Reviews;





