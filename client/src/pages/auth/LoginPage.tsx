import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();

  // TODO: Anusha will implement the actual login/registration functionality
  const handleTempLogin = () => {
    navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-logo">FinTrack</h1>
        <p className="login-tagline">Track your finances, subscriptions, and budgets</p>

        <div className="login-placeholder">
          <p>Login / Registration Page</p>
          <p className="note">This page will be implemented by Anusha</p>

          <button onClick={handleTempLogin} className="temp-login-btn">
            Temporary Login (for testing)
          </button>
        </div>
      </div>
    </div>
  );
}
