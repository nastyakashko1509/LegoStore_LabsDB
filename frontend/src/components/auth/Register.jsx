import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

const Register = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'client',
    birthday: ''
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await register(form);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card">
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Имя</label>
          <input name="name" value={form.name} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Email</label>
          <input name="email" value={form.email} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Телефон</label>
          <input name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Пароль</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Дата рождения</label>
          <input type="date" name="birthday" value={form.birthday} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Роль</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="client">Покупатель</option>
            <option value="employee">Сотрудник</option>
            <option value="admin">Администратор</option>
          </select>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Создать аккаунт</button>
      </form>
    </div>
  );
};

export default Register;






