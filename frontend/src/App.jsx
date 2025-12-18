import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';
import Orders from './components/orders/Orders.jsx';
import Catalog from './components/catalog/Catalog.jsx';
import AdminPanel from './components/admin/AdminPanel.jsx';
import Cart from './components/cart/Cart.jsx';
import Reviews from './components/review/Reviews.jsx';
import StaffPanel from './components/staff/StaffPanel.jsx';
import { useAuth } from './context/AuthContext.jsx';

const App = () => {
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      <header className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="row">
          <Link to="/">Каталог</Link>
          {user?.role === 'client' && <Link to="/cart">Корзина</Link>}
          {user?.role === 'client' && <Link to="/reviews">Отзывы</Link>}
          {user?.role === 'client' && <Link to="/orders">Мои заказы</Link>}
          {(user?.role === 'employee' || user?.role === 'admin') && <Link to="/staff">Панель сотрудника</Link>}
          {user?.role === 'admin' && <Link to="/admin">Админка</Link>}
        </div>
        <div className="row">
          {user ? (
            <>
              <span>{user.name} ({user.role})</span>
              <button className="secondary" onClick={logout}>Выйти</button>
            </>
          ) : (
            <>
              <Link to="/login">Вход</Link>
              <Link to="/register">Регистрация</Link>
            </>
          )}
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/staff" element={<StaffPanel />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </div>
  );
};

export default App;

