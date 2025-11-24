import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, saveToken } from '../api/auth';
import '../styles/Auth.css';

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const data = await register(username, email, password);
      saveToken(data.token);
      navigate('/folders');
    } catch (err) {
      setError('Registration failed. Email may already be in use.');
      console.error('Register error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="authPage">
      <div className="authContainer">
        <div className="authBox">
          <h1>🎮 FLASHBACK</h1>
          <h2>Join Us!</h2>
          <p className="subtitle">Create an account to start learning</p>

          <form onSubmit={handleSubmit} className="authForm">
            {error && <div className="errorMessage">{error}</div>}

            <div className="formGroup">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
              />
            </div>

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
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div className="formGroup">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
              />
            </div>

            <button type="submit" className="authButton" disabled={isLoading}>
              {isLoading ? 'Creating account...' : '▶ Register'}
            </button>
          </form>

          <div className="authFooter">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="authLink">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Register;
