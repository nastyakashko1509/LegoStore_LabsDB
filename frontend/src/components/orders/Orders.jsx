import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    api.get('/orders').then(setOrders).catch((err) => setMessage(err.message));
  }, [user]);

  const checkout = async () => {
    try {
      await api.post('/orders', {});
      setMessage('Заказ оформлен');
      const data = await api.get('/orders');
      setOrders(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (!user) return <p>Требуется вход</p>;

  const grouped = orders.reduce((acc, o) => {
    const key = o.status || 'прочее';
    if (!acc[key]) acc[key] = [];
    acc[key].push(o);
    return acc;
  }, {});

  const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
  const sortedStatuses = [
    ...statusOrder.filter((s) => grouped[s]?.length),
    ...Object.keys(grouped).filter((s) => !statusOrder.includes(s))
  ];

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Мои заказы</h2>
        {user.role === 'client' && <button onClick={checkout}>Оформить заказ из корзины</button>}
      </div>
      {message && <p>{message}</p>}
      {sortedStatuses.map((statusKey) => (
        <div key={statusKey} className="section">
          <h3>{statusKey === 'delivered' ? 'Покупки' : statusKey}</h3>
          {grouped[statusKey].map((o) => (
            <div key={o.id} className="card">
              <div className="muted">
                Создан: {new Date(o.order_date).toLocaleString()}
              </div>
              <div className="muted">
                Статус: {o.status}
              </div>
              <div style={{ marginTop: 8 }}>
                {o.items?.map((it, idx) => (
                  <div key={idx} className="row" style={{ justifyContent: 'space-between' }}>
                    <div>{it.product_name}</div>
                    <div>× {it.quantity}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8, fontWeight: 600 }}>
                Сумма: {o.total_amount}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Orders;





