import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const Cart = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await api.get('/cart');
      setItems(data);
      setMessage('');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'client') {
      loadCart();
    }
  }, [user]);

  const removeItem = async (id) => {
    try {
      await api.delete(`/cart/${id}`);
      await loadCart();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      await loadCart();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const changeQty = async (id, qty) => {
    if (qty <= 0) return;
    try {
      await api.put('/cart', { productId: id, quantity: qty });
      await loadCart();
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (!user) return <p>Требуется вход</p>;
  if (user.role !== 'client') return <p>Корзина доступна только покупателю</p>;

  const total = items.reduce((sum, it) => sum + Number(it.total_price || 0), 0);

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Корзина</h2>
        <button className="secondary" onClick={clearCart} disabled={!items.length || loading}>
          Очистить корзину
        </button>
      </div>
      {message && <p>{message}</p>}
      {!items.length && !loading && <p>Корзина пуста</p>}
      {items.map((it) => (
        <div key={it.product_id} className="card row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <b>{it.product_name}</b>
            <div>Возраст: {it.age_limit}+</div>
            <div>Цена за шт.: {it.unit_price}</div>
            <div>Сумма: {it.total_price}</div>
          </div>
          <div className="row" style={{ alignItems: 'center' }}>
            <button
              className="secondary"
              onClick={() => changeQty(it.product_id, it.quantity - 1)}
              disabled={it.quantity <= 1 || loading}
            >
              -
            </button>
            <span style={{ margin: '0 8px' }}>{it.quantity}</span>
            <button
              className="secondary"
              onClick={() => changeQty(it.product_id, it.quantity + 1)}
              disabled={loading}
            >
              +
            </button>
            <button style={{ marginLeft: 8 }} onClick={() => removeItem(it.product_id)} disabled={loading}>
              Удалить
            </button>
          </div>
        </div>
      ))}
      {!!items.length && (
        <div className="card">
          <b>Итого: {total}</b>
        </div>
      )}
    </div>
  );
};

export default Cart;










