import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const analyticsList = [
  'usersWithLargeCart',
  'expensiveProducts',
  'supplierProductCounts',
  'cartStats',
  'reviewsMissing'
];

const AdminPanel = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState(analyticsList[0]);
  const [data, setData] = useState([]);
  const [message, setMessage] = useState('');
  const [threshold, setThreshold] = useState(1000);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState({ userId: '', action: '' });
  const [roleForm, setRoleForm] = useState({ userId: '', role: 'client' });

  useEffect(() => {
    if (!user) return;
    load();
    loadUsers();
  }, [selected, user]);

  const load = async () => {
    try {
      const qs = selected === 'ordersOverThreshold' ? `?threshold=${threshold}` : '';
      const result = await api.get(`/analytics/${selected}${qs}`);
      setData(result);
      setMessage('');
    } catch (err) {
      setMessage(err.message);
      setData([]);
    }
  };

  const loadUsers = async () => {
    try {
      const result = await api.get('/admin/users');
      setUsers(result);
    } catch (err) {
      /* noop */
    }
  };

  const changeRole = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${roleForm.userId}/role`, { role: roleForm.role });
      setMessage('Роль обновлена');
      await loadUsers();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const loadLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (logFilter.userId) params.append('userId', logFilter.userId);
      if (logFilter.action) params.append('action', logFilter.action);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const result = await api.get(`/admin/logs${qs}`);
      setLogs(result);
    } catch (err) {
      setLogs([]);
      setMessage(err.message);
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
    return <p>Нет доступа</p>;
  }

  return (
    <div>
      <h2>Аналитика</h2>
      <div className="row">
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          {analyticsList.map((key) => <option key={key} value={key}>{key}</option>)}
        </select>
        {selected === 'ordersOverThreshold' && (
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            style={{ width: 120 }}
          />
        )}
        <button onClick={load}>Обновить</button>
      </div>
      {message && <p>{message}</p>}
      <pre className="card" style={{ overflow: 'auto' }}>{JSON.stringify(data, null, 2)}</pre>

      {user.role === 'admin' && (
        <>
          <div className="card">
            <h3>Управление ролями</h3>
            <form onSubmit={changeRole} className="row" style={{ gap: 8, alignItems: 'flex-end' }}>
              <div className="field">
                <label>User ID</label>
                <input value={roleForm.userId} onChange={(e) => setRoleForm({ ...roleForm, userId: e.target.value })} />
              </div>
              <div className="field">
                <label>Роль</label>
                <select value={roleForm.role} onChange={(e) => setRoleForm({ ...roleForm, role: e.target.value })}>
                  <option value="client">client</option>
                  <option value="employee">employee</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <button type="submit">Сменить</button>
            </form>
            <pre className="card" style={{ overflow: 'auto', maxHeight: 150 }}>
              {JSON.stringify(users, null, 2)}
            </pre>
          </div>

          <div className="card">
            <h3>Логи</h3>
            <div className="row" style={{ gap: 8 }}>
              <input
                placeholder="userId"
                value={logFilter.userId}
                onChange={(e) => setLogFilter({ ...logFilter, userId: e.target.value })}
              />
              <input
                placeholder="action содержит"
                value={logFilter.action}
                onChange={(e) => setLogFilter({ ...logFilter, action: e.target.value })}
              />
              <button onClick={loadLogs}>Загрузить</button>
            </div>
            <pre className="card" style={{ overflow: 'auto', maxHeight: 200 }}>
              {JSON.stringify(logs, null, 2)}
            </pre>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPanel;



