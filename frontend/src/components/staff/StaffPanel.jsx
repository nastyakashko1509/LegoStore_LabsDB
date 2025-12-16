import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const StaffPanel = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [message, setMessage] = useState('');

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
    { productId: '', quantity: 1, unitCost: 0 }
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
  }, [user]);

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
      /* noop */
    }
  };

  const loadSupplyStatuses = async () => {
    try {
      const data = await api.get('/staff/supplies/statuses');
      setSupplyStatuses(data);
    } catch (err) {
      /* noop */
    }
  };

  const loadSupplies = async () => {
    try {
      const data = await api.get('/staff/supplies');
      setSupplies(data);
    } catch (err) {
      /* noop */
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await api.get('/staff/customers');
      setCustomers(data);
    } catch (err) {
      /* noop */
    }
  };

  const updateOrderStatus = async (id, statusId) => {
    try {
      await api.patch(`/orders/${id}/status`, { statusId });
      await loadOrders();
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
          quantity: Number(it.quantity),
          unit_cost: Number(it.unitCost)
        }));

      if (!items.length) {
        setMessage('Добавьте хотя бы один товар');
        return;
      }

      await api.post('/staff/supplies', {
        supplierId: supplyForm.supplierId,
        supplyDate: supplyForm.supplyDate,
        statusName: supplyForm.statusName,
        items
      });
      setMessage('Поставка зарегистрирована');
      setSupplyItems([{ productId: '', quantity: 1, unitCost: 0 }]);
      await loadSupplies();
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (!user || (user.role !== 'employee' && user.role !== 'admin')) {
    return <p>Нет доступа</p>;
  }

  return (
    <div>
      <h2>Панель сотрудника</h2>
      {message && <p>{message}</p>}

      <div className="card">
        <h3>Заказы</h3>
        {orders.map((o) => (
          <div key={o.id} className="card row" style={{ justifyContent: 'space-between' }}>
            <div>
              <b>№ {o.id}</b>
              <div>Клиент: {o.client_name} ({o.client_email})</div>
              <div>Статус: {o.status}</div>
              <div>Сумма: {o.total_amount}</div>
            </div>
            <select
              value={statuses.find((s) => s.name === o.status)?.id || ''}
              onChange={(e) => updateOrderStatus(o.id, e.target.value)}
            >
              <option value="">Статус</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Скидка на товар</h3>
        <form onSubmit={submitDiscount} className="row" style={{ alignItems: 'flex-end', gap: 12 }}>
          <div className="field">
            <label>Product ID</label>
            <input value={discountForm.productId} onChange={(e) => setDiscountForm({ ...discountForm, productId: e.target.value })} />
          </div>
          <div className="field">
            <label>%</label>
            <input type="number" value={discountForm.percent} onChange={(e) => setDiscountForm({ ...discountForm, percent: e.target.value })} />
          </div>
          <div className="field">
            <label>Start</label>
            <input type="date" value={discountForm.startDate} onChange={(e) => setDiscountForm({ ...discountForm, startDate: e.target.value })} />
          </div>
          <div className="field">
            <label>End</label>
            <input type="date" value={discountForm.endDate} onChange={(e) => setDiscountForm({ ...discountForm, endDate: e.target.value })} />
          </div>
          <button type="submit">Сохранить</button>
        </form>
      </div>

      <div className="card">
        <h3>Изменение цены</h3>
        <form onSubmit={submitPrice} className="row" style={{ alignItems: 'flex-end', gap: 12 }}>
          <div className="field">
            <label>Product ID</label>
            <input value={priceForm.productId} onChange={(e) => setPriceForm({ ...priceForm, productId: e.target.value })} />
          </div>
          <div className="field">
            <label>Новая цена</label>
            <input type="number" value={priceForm.newPrice} onChange={(e) => setPriceForm({ ...priceForm, newPrice: e.target.value })} />
          </div>
          <button type="submit">Обновить</button>
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
                <label>Product ID</label>
                <input
                  value={it.productId}
                  onChange={(e) => {
                    const next = [...supplyItems];
                    next[idx].productId = e.target.value;
                    setSupplyItems(next);
                  }}
                  placeholder="UUID товара"
                />
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
              <div className="field" style={{ width: 140 }}>
                <label>Закуп. цена</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={it.unitCost}
                  onChange={(e) => {
                    const next = [...supplyItems];
                    next[idx].unitCost = e.target.value;
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
              onClick={() => setSupplyItems([...supplyItems, { productId: '', quantity: 1, unitCost: 0 }])}
            >
              Добавить товар
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Существующие поставки</h3>
        {supplies.map((s) => (
          <div key={s.id} className="card" style={{ marginBottom: 8 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <b>{s.supplier_name}</b>
                <div className="muted">Дата: {new Date(s.supply_date).toLocaleDateString()}</div>
                <div className="muted">Статус: {s.status_name}</div>
                <div className="muted">Всего: {s.total_quantity}</div>
              </div>
              <div className="field" style={{ width: 180 }}>
                <label>Статус</label>
                <select
                  value={s.status_name}
                  onChange={async (e) => {
                    try {
                      await api.patch(`/staff/supplies/${s.id}`, { statusName: e.target.value });
                      await loadSupplies();
                    } catch (err) {
                      setMessage(err.message);
                    }
                  }}
                >
                  <option value="">Выбрать</option>
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
            {supplyItemsById[s.id] && (
              <div style={{ marginTop: 8 }}>
                {supplyItemsById[s.id].map((it) => (
                  <div key={it.id} className="row" style={{ justifyContent: 'space-between' }}>
                    <div>
                      <b>{it.product_name}</b>
                      <div className="muted">{it.product_id}</div>
                    </div>
                    <div>Кол-во: {it.quantity_for_delivery}</div>
                    <div>Цена: {it.unit_cost}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="row" style={{ marginTop: 8 }}>
              <button
                type="button"
                className="secondary"
                onClick={async () => {
                  if (!window.confirm('Удалить поставку и все её позиции?')) return;
                  try {
                    await api.delete(`/staff/supplies/${s.id}`);
                    const next = { ...supplyItemsById };
                    delete next[s.id];
                    setSupplyItemsById(next);
                    await loadSupplies();
                  } catch (err) {
                    setMessage(err.message);
                  }
                }}
              >
                Удалить поставку
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Покупатели</h3>
        {customers.map((c) => (
          <div key={c.id} className="card row" style={{ justifyContent: 'space-between' }}>
            <div>
              <b>{c.name}</b>
              <div>{c.email}</div>
              <div>{c.phone}</div>
              <div>{c.birthday}</div>
            </div>
            <button
              className="secondary"
              onClick={async () => {
                try {
                  await api.delete(`/staff/customers/${c.id}`);
                  await loadCustomers();
                } catch (err) {
                  setMessage(err.message);
                }
              }}
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffPanel;




