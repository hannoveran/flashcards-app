import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, saveToken } from '../api/auth';
import '../styles/Auth.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await login(email, password);
      saveToken(data.token);
      navigate('/folders');
    } catch (err) {
      setError('Invalid email or password');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="authPage">
      <div className="authContainer">
        <div className="authBox">
          <h1>🎮 FLASHBACK</h1>
          <h2>Welcome Back!</h2>
          <p className="subtitle">Login to continue your learning journey</p>

          <form onSubmit={handleSubmit} className="authForm">
            {error && <div className="errorMessage">{error}</div>}

            <div className="formGroup">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="formGroup">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="authButton" disabled={isLoading}>
              {isLoading ? 'Logging in...' : '▶ Login'}
            </button>
          </form>

          <div className="authFooter">
            <p>
              Dont have an account?{' '}
              <Link to="/register" className="authLink">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
