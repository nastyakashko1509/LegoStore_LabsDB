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

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Мои заказы</h2>
        {user.role === 'client' && <button onClick={checkout}>Оформить заказ из корзины</button>}
      </div>
      {message && <p>{message}</p>}
      {orders.map((o) => (
        <div key={o.id} className="card">
          <div>№ {o.id}</div>
          <div>Создан: {new Date(o.order_date).toLocaleString()}</div>
          <div>Статус: {o.status}</div>
          <div>Сумма: {o.total_amount}</div>
        </div>
      ))}
    </div>
  );
};

export default Orders;



