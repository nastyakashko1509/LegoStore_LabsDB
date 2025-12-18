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

// Словарь переводов для отображения в интерфейсе
const analyticsLabels = {
  usersWithLargeCart: 'Пользователи с большими корзинами',
  expensiveProducts: 'Дорогие товары',
  supplierProductCounts: 'Количество товаров по поставщикам',
  cartStats: 'Статистика корзин',
  reviewsMissing: 'Товары без отзывов'
};

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
  const [isLoading, setIsLoading] = useState(false); // Добавляем состояние загрузки

  useEffect(() => {
    if (!user) return;
    load();
    loadUsers();
  }, [selected, user]);

  const load = async () => {
    setIsLoading(true);
    try {
      const qs = selected === 'ordersOverThreshold' ? `?threshold=${threshold}` : '';
      const result = await api.get(`/analytics/${selected}${qs}`);
      setData(result);
      setMessage('');
    } catch (err) {
      setMessage(err.message);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const result = await api.get('/admin/users');
      // Предполагаем, что result - это массив пользователей
      // Если сервер не возвращает имя, можно сформировать его из других полей
      const usersWithDisplayName = result.map(user => ({
        ...user,
        displayName: user.name || user.username || user.email || `Пользователь ${user.id}`
      }));
      setUsers(usersWithDisplayName);
      
      // Устанавливаем первого пользователя по умолчанию, если выбран пустой
      if (usersWithDisplayName.length > 0 && !roleForm.userId) {
        setRoleForm({
          ...roleForm,
          userId: usersWithDisplayName[0].id
        });
      }
    } catch (err) {
      console.error('Ошибка загрузки пользователей:', err);
      setUsers([]);
    }
  };

  const changeRole = async (e) => {
    e.preventDefault();
    if (!roleForm.userId) {
      setMessage('Выберите пользователя');
      return;
    }
    
    try {
      await api.put(`/admin/users/${roleForm.userId}/role`, { role: roleForm.role });
      setMessage('Роль обновлена');
      await loadUsers(); // Перезагружаем список пользователей для обновления ролей
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

  // Функция для получения отображаемого имени пользователя по ID
  const getUserDisplayName = (userId) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.displayName : 'Неизвестный пользователь';
  };

  // Функция для проверки, пустые ли данные
  const isEmptyData = () => {
    if (!data) return true;
    if (Array.isArray(data)) return data.length === 0;
    if (typeof data === 'object') return Object.keys(data).length === 0;
    return false;
  };

  // Функция для получения понятного описания текущего отчета
  const getCurrentReportDescription = () => {
    const currentLabel = analyticsLabels[selected] || selected;
    return `Отчет: ${currentLabel}`;
  };

  if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
    return <p>Нет доступа</p>;
  }

  return (
    <div>
      <h2>Аналитика</h2>
      <div className="row">
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          {analyticsList.map((key) => (
            <option key={key} value={key}>
              {analyticsLabels[key] || key}
            </option>
          ))}
        </select>
        {selected === 'ordersOverThreshold' && (
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            style={{ width: 120 }}
          />
        )}
        <button onClick={load} disabled={isLoading}>
          {isLoading ? 'Загрузка...' : 'Обновить'}
        </button>
      </div>
      
      {message && <p style={{ color: message.includes('обновлена') ? 'green' : 'red' }}>{message}</p>}
      
      <div style={{ margin: '10px 0', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <strong>{getCurrentReportDescription()}</strong>
      </div>
      
      {isLoading ? (
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <p>Загрузка данных...</p>
        </div>
      ) : isEmptyData() ? (
        <div className="card" style={{ 
          padding: '5px 5px', 
          textAlign: 'center', 
          backgroundColor: '#f8f9fa',
          border: '1px dashed #dee2e6'
        }}>
          <p style={{ color: '#868e96', fontSize: '13px' }}>
            Данные не найдены. В системе нет соответствующих записей или условий для формирования отчета.
          </p>
        </div>
      ) : (
        <pre className="card" style={{ overflow: 'auto' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}

      {user.role === 'admin' && (
        <>
          <div className="card">
            <h3>Управление ролями</h3>
            <form onSubmit={changeRole} className="row" style={{ gap: 8, alignItems: 'flex-end' }}>
              <div className="field">
                <label>Пользователь</label>
                <select 
                  value={roleForm.userId} 
                  onChange={(e) => setRoleForm({ ...roleForm, userId: e.target.value })}
                  style={{ minWidth: '200px' }}
                >
                  <option value="">Выберите пользователя</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.displayName} {user.role && `(${user.role})`}
                    </option>
                  ))}
                </select>
                {roleForm.userId && (
                  <div style={{ fontSize: '0.8em', marginTop: '4px', color: '#666' }}>
                    ID: {roleForm.userId} | Email: {users.find(u => u.id === roleForm.userId)?.email || 'N/A'}
                  </div>
                )}
              </div>
              <div className="field">
                <label>Новая роль</label>
                <select value={roleForm.role} onChange={(e) => setRoleForm({ ...roleForm, role: e.target.value })}>
                  <option value="client">client</option>
                  <option value="employee">employee</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <button type="submit">Сменить роль</button>
            </form>
            
            <div style={{ marginTop: '20px' }}>
              <h4>Текущие роли пользователей:</h4>
              {users.length === 0 ? (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px dashed #dee2e6'
                }}>
                  <p style={{ color: '#6c757d' }}>Пользователи не загружены</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {users.slice(0, 10).map(user => (
                    <div key={user.id} className="card" style={{ padding: '8px', fontSize: '0.9em' }}>
                      <div><strong>{user.displayName}</strong></div>
                      <div>Роль: {user.role}</div>
                      <div style={{ fontSize: '0.8em', color: '#666' }}>ID: {user.id}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3>Логи</h3>
            <div className="row" style={{ gap: 8, alignItems: 'flex-end' }}>
              <div className="field">
                <label>Пользователь</label>
                <select
                  value={logFilter.userId}
                  onChange={(e) => setLogFilter({ ...logFilter, userId: e.target.value })}
                  style={{ minWidth: '150px' }}
                >
                  <option value="">Все пользователи</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Действие</label>
                <input
                  placeholder="действие содержит"
                  value={logFilter.action}
                  onChange={(e) => setLogFilter({ ...logFilter, action: e.target.value })}
                />
              </div>
              <button onClick={loadLogs}>Загрузить логи</button>
            </div>
            
            {logs.length === 0 ? (
              <div style={{ 
                padding: '5px 5px', 
                textAlign: 'center', 
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                marginTop: '5px',
                border: '1px dashed #dee2e6'
              }}>
                <p style={{ color: '#6c757d', fontSize: '13px' }}>Логи не загружены или отсутствуют</p>
              </div>
            ) : (
              <pre className="card" style={{ overflow: 'auto', maxHeight: 200 }}>
                {JSON.stringify(logs, null, 2)}
              </pre>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPanel;