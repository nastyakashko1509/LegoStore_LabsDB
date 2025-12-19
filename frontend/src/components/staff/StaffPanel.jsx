import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const StaffPanel = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]); // Добавим состояние для поставщиков

  const [discountForm, setDiscountForm] = useState({
    productId: '',
    percent: '',
    startDate: '',
    endDate: ''
  });

  const [priceForm, setPriceForm] = useState({
    productId: '',
    newPrice: ''
  });

  const [supplyForm, setSupplyForm] = useState({
    supplierId: '',
    supplyDate: '',
    statusName: '',
  });
  const [supplyStatuses, setSupplyStatuses] = useState([]);
  const [supplyItems, setSupplyItems] = useState([
    { productId: '', quantity: 1 }
  ]);
  const [supplies, setSupplies] = useState([]);
  const [supplyItemsById, setSupplyItemsById] = useState({});

  useEffect(() => {
    if (!user) return;
    loadOrders();
    loadStatuses();
    loadCustomers();
    loadSupplyStatuses();
    loadSupplies();
    loadProducts();
    loadSuppliers(); // Загружаем поставщиков
  }, [user]);

  const loadProducts = async () => {
    try {
      const data = await api.get('/products');
      setProducts(data);
    } catch (err) {
      console.error('Ошибка загрузки товаров:', err);
    }
  };

  const loadSuppliers = async () => {
    try {
      const data = await api.get('/staff/suppliers'); // Предполагаемый эндпоинт
      // Если такого эндпоинта нет, можно создать или использовать существующие данные
      setSuppliers(data);
    } catch (err) {
      console.error('Ошибка загрузки поставщиков:', err);
      // Заглушка для тестирования
      setSuppliers([
        { id: 1, name: 'Поставщик 1', contact: '+7 (999) 111-11-11' },
        { id: 2, name: 'Поставщик 2', contact: '+7 (999) 222-22-22' },
        { id: 3, name: 'Поставщик 3', contact: '+7 (999) 333-33-33' },
      ]);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await api.get('/orders/all');
      setOrders(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const loadStatuses = async () => {
    try {
      const data = await api.get('/orders/statuses');
      setStatuses(data);
    } catch (err) {
      console.error('Ошибка загрузки статусов:', err);
    }
  };

  const loadSupplyStatuses = async () => {
    try {
      const data = await api.get('/staff/supplies/statuses');
      setSupplyStatuses(data);
    } catch (err) {
      console.error('Ошибка загрузки статусов поставок:', err);
    }
  };

  const loadSupplies = async () => {
    try {
      const data = await api.get('/staff/supplies');
      setSupplies(data);
    } catch (err) {
      console.error('Ошибка загрузки поставок:', err);
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await api.get('/staff/customers');
      setCustomers(data);
    } catch (err) {
      console.error('Ошибка загрузки покупателей:', err);
    }
  };

  const updateOrderStatus = async (id, statusId) => {
    try {
      await api.patch(`/orders/${id}/status`, { statusId });
      await loadOrders();
      setMessage('Статус заказа обновлен');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const submitDiscount = async (e) => {
    e.preventDefault();
    try {
      await api.post('/staff/discounts', {
        productId: discountForm.productId,
        percent: Number(discountForm.percent),
        startDate: discountForm.startDate,
        endDate: discountForm.endDate
      });
      setMessage('Скидка сохранена');
      // Очищаем форму скидки
      setDiscountForm({
        productId: '',
        percent: '',
        startDate: '',
        endDate: ''
      });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const submitPrice = async (e) => {
    e.preventDefault();
    try {
      await api.post('/staff/prices', {
        productId: priceForm.productId,
        newPrice: Number(priceForm.newPrice)
      });
      setMessage('Цена обновлена');
      // Очищаем форму цены
      setPriceForm({
        productId: '',
        newPrice: ''
      });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const submitSupply = async (e) => {
    e.preventDefault();
    try {
      const items = supplyItems
        .filter((it) => it.productId && Number(it.quantity) > 0)
        .map((it) => ({
          product_id: it.productId,
          quantity: Number(it.quantity)
        }));

      if (!items.length) {
        setMessage('Добавьте хотя бы один товар');
        return;
      }

      if (!supplyForm.supplierId) {
        setMessage('Выберите поставщика');
        return;
      }

      await api.post('/staff/supplies', {
        supplierId: supplyForm.supplierId,
        supplyDate: supplyForm.supplyDate,
        statusName: supplyForm.statusName,
        items
      });
      setMessage('Поставка зарегистрирована');
      
      // Очищаем форму поставки
      setSupplyForm({
        supplierId: '',
        supplyDate: '',
        statusName: '',
      });
      setSupplyItems([{ productId: '', quantity: 1 }]);
      
      await loadSupplies();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Функция для получения текущей даты в формате YYYY-MM-DD
  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  // Функция для получения даты через неделю
  const getDateWeekFromNow = () => {
    const now = new Date();
    now.setDate(now.getDate() + 7);
    return now.toISOString().split('T')[0];
  };

  if (!user || (user.role !== 'employee' && user.role !== 'admin')) {
    return <p>Нет доступа</p>;
  }

  return (
    <div>
      <h2>Панель сотрудника</h2>
      {message && (
        <div className={`message ${message.includes('Ошибка') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="card">
        <h3>Заказы</h3>
        {orders.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            Нет доступных заказов
          </p>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="card row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <b>Клиент: {o.client_name} ({o.client_email})</b>
                <div>Статус: {o.status}</div>
                <div>Сумма: {o.total_amount}</div>
              </div>
              <select
                value={statuses.find((s) => s.name === o.status)?.id || ''}
                onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                style={{ minWidth: '150px' }}
              >
                <option value="">Изменить статус</option>
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h3>Скидка на товар</h3>
        <form onSubmit={submitDiscount} className="row" style={{ alignItems: 'flex-end', gap: 12 }}>
          <div className="field">
            <label>Товар</label>
            <select
              value={discountForm.productId}
              onChange={(e) => setDiscountForm({ ...discountForm, productId: e.target.value })}
              required
            >
              <option value="">Выберите товар</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Процент скидки</label>
            <input 
              type="number" 
              value={discountForm.percent} 
              onChange={(e) => setDiscountForm({ ...discountForm, percent: e.target.value })} 
              min="1" 
              max="100"
              required
              placeholder="%"
            />
          </div>
          <div className="field">
            <label>Начало</label>
            <input 
              type="date" 
              value={discountForm.startDate} 
              onChange={(e) => setDiscountForm({ ...discountForm, startDate: e.target.value })} 
              min={getCurrentDate()}
              required
            />
          </div>
          <div className="field">
            <label>Окончание</label>
            <input 
              type="date" 
              value={discountForm.endDate} 
              onChange={(e) => setDiscountForm({ ...discountForm, endDate: e.target.value })} 
              min={discountForm.startDate || getCurrentDate()}
              required
            />
          </div>
          <button type="submit">Сохранить скидку</button>
        </form>
      </div>

      <div className="card">
        <h3>Изменение цены</h3>
        <form onSubmit={submitPrice} className="row" style={{ alignItems: 'flex-end', gap: 12 }}>
          <div className="field">
            <label>Товар</label>
            <select
              value={priceForm.productId}
              onChange={(e) => setPriceForm({ ...priceForm, productId: e.target.value })}
              required
            >
              <option value="">Выберите товар</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} (текущая: {p.price})</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Новая цена</label>
            <input 
              type="number" 
              value={priceForm.newPrice} 
              onChange={(e) => setPriceForm({ ...priceForm, newPrice: e.target.value })} 
              min="1"
              step="0.01"
              required
              placeholder="Цена"
            />
          </div>
          <button type="submit">Обновить цену</button>
        </form>
      </div>

      <div className="card">
        <h3>Поставка</h3>
        <form onSubmit={submitSupply} className="row" style={{ alignItems: 'flex-end', gap: 12 }}>
          <div className="field">
            <label>Supplier ID</label>
            <input value={supplyForm.supplierId} onChange={(e) => setSupplyForm({ ...supplyForm, supplierId: e.target.value })} />
          </div>
          <div className="field">
            <label>Дата</label>
            <input type="date" value={supplyForm.supplyDate} onChange={(e) => setSupplyForm({ ...supplyForm, supplyDate: e.target.value })} />
          </div>
          <div className="field">
            <label>Статус</label>
            <select value={supplyForm.statusName} onChange={(e) => setSupplyForm({ ...supplyForm, statusName: e.target.value })}>
              <option value="">Выбрать</option>
              {supplyStatuses.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <button type="submit">Создать</button>
        </form>

        <div className="card" style={{ background: '#f8fafc' }}>
          <h4>Позиции поставки</h4>
          {supplyItems.map((it, idx) => (
            <div key={idx} className="row" style={{ alignItems: 'flex-end', gap: 8 }}>
              <div className="field" style={{ minWidth: 180 }}>
                <label>Товар</label>
                <select
                  value={it.productId}
                  onChange={(e) => {
                    const next = [...supplyItems];
                    next[idx].productId = e.target.value;
                    setSupplyItems(next);
                  }}
                >
                  <option value="">Выберите товар</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ width: 110 }}>
                <label>Кол-во</label>
                <input
                  type="number"
                  min="1"
                  value={it.quantity}
                  onChange={(e) => {
                    const next = [...supplyItems];
                    next[idx].quantity = e.target.value;
                    setSupplyItems(next);
                  }}
                />
              </div>
              <button
                className="secondary"
                type="button"
                onClick={() => setSupplyItems(supplyItems.filter((_, i) => i !== idx))}
                disabled={supplyItems.length === 1}
              >
                Удалить
              </button>
            </div>
          ))}
          <div className="row">
            <button
              type="button"
              className="secondary"
              onClick={() => setSupplyItems([...supplyItems, { productId: '', quantity: 1 }])}
            >
              Добавить товар
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Существующие поставки</h3>
        {supplies.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            Нет зарегистрированных поставок
          </p>
        ) : (
          supplies.map((s) => (
            <div key={s.id} className="card" style={{ marginBottom: 16 }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <b>Поставщик: {s.supplier_name}</b>
                  <div className="muted">Дата: {new Date(s.supply_date).toLocaleDateString()}</div>
                  <div className="muted">Статус: {s.status_name}</div>
                  <div className="muted">Товаров: {s.total_quantity}</div>
                </div>
                <div className="row" style={{ gap: '10px', alignItems: 'center' }}>
                  <div className="field" style={{ width: '180px' }}>
                    <label>Изменить статус</label>
                    <select
                      value={s.status_name}
                      onChange={async (e) => {
                        try {
                          await api.patch(`/staff/supplies/${s.id}`, { statusName: e.target.value });
                          setMessage('Статус поставки обновлен');
                          await loadSupplies();
                          setTimeout(() => setMessage(''), 3000);
                        } catch (err) {
                          setMessage(err.message);
                        }
                      }}
                    >
                      {supplyStatuses.map((st) => (
                        <option key={st.id} value={st.name}>{st.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="secondary"
                    onClick={async () => {
                      if (supplyItemsById[s.id]) {
                        setSupplyItemsById({ ...supplyItemsById, [s.id]: undefined });
                        return;
                      }
                      try {
                        const items = await api.get(`/staff/supplies/${s.id}/items`);
                        setSupplyItemsById({ ...supplyItemsById, [s.id]: items });
                      } catch (err) {
                        setMessage(err.message);
                      }
                    }}
                  >
                    {supplyItemsById[s.id] ? 'Скрыть' : 'Позиции'}
                  </button>
                </div>
              </div>
              {supplyItemsById[s.id] && (
                <div style={{ marginTop: 16, padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  <h5 style={{ marginBottom: '8px' }}>Товары в поставке:</h5>
                  {supplyItemsById[s.id].map((it) => (
                    <div key={it.id} className="row" style={{ 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px',
                      borderBottom: '1px solid #dee2e6'
                    }}>
                      <div>
                        <b>{it.product_name}</b>
                        <div className="muted">ID: {it.product_id}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div>Количество: {it.quantity_for_delivery}</div>
                        <div>Цена за единицу: {it.unit_cost}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="row" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="danger"
                  onClick={async () => {
                    if (!window.confirm('Удалить поставку и все её позиции?')) return;
                    try {
                      await api.delete(`/staff/supplies/${s.id}`);
                      const next = { ...supplyItemsById };
                      delete next[s.id];
                      setSupplyItemsById(next);
                      setMessage('Поставка удалена');
                      await loadSupplies();
                      setTimeout(() => setMessage(''), 3000);
                    } catch (err) {
                      setMessage(err.message);
                    }
                  }}
                >
                  Удалить поставку
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h3>Покупатели</h3>
        {customers.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            Нет зарегистрированных покупателей
          </p>
        ) : (
          customers.map((c) => (
            <div key={c.id} className="card row" style={{ 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <div>
                <b>{c.name}</b>
                <div>{c.email}</div>
                <div>{c.phone}</div>
                <div>День рождения: {c.birthday}</div>
              </div>
              <button
                className="danger"
                onClick={async () => {
                  if (!window.confirm(`Удалить покупателя ${c.name}?`)) return;
                  try {
                    await api.delete(`/staff/customers/${c.id}`);
                    setMessage('Покупатель удален');
                    await loadCustomers();
                    setTimeout(() => setMessage(''), 3000);
                  } catch (err) {
                    setMessage(err.message);
                  }
                }}
              >
                Удалить
              </button>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .message {
          padding: 12px 16px;
          margin-bottom: 20px;
          border-radius: 4px;
          font-weight: 500;
        }
        
        .message.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        
        .message.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        
        .danger {
          background-color: #dc3545;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .danger:hover {
          background-color: #c82333;
        }
        
        .muted {
          color: #6c757d;
          font-size: 0.9em;
        }
        
        .field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .field label {
          font-size: 0.9em;
          font-weight: 500;
          color: #495057;
        }
      `}</style>
    </div>
  );
};

export default StaffPanel;
