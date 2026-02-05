import { Outlet, Link, useLocation } from 'react-router-dom';
import './MainLayout.css';

export default function MainLayout() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/expenses', label: 'Expenses' },
    { path: '/subscriptions', label: 'Subscriptions' },
    { path: '/budgets', label: 'Budgets' },
  ];

  return (
    <div className="main-layout">
      {/* Header */}
      <header className="header">
        <div className="logo">FinTrack</div>
      </header>

      <div className="layout-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="nav-menu">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="user-profile">
            <div className="user-avatar">
              <span>U</span>
            </div>
            <div className="username">Username</div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
